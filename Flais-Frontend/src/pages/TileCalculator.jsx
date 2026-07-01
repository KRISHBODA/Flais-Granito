import React, { useState, useEffect, useMemo } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { Calculator, Share2, Printer, Check } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import SEO from '../components/SEO';
import api from '../utils/api';
import { 
  calculateRoomRequirements, 
  encodeState, 
  decodeState,
  getSmartTileRecommendation
} from '../utils/calculatorCore';

// Fixed 3m x 3m square preview polygon
const PREVIEW_PTS = [[0, 0], [3, 0], [3, 3], [0, 3]];

const Counter = ({ value, duration = 1500, isFloat = false }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime;
    const startValue = count;
    const endValue = value;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
      setCount(startValue + (endValue - startValue) * easeOutCubic(progress));
      if (progress < 1) requestAnimationFrame(step);
      else setCount(endValue);
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration]);
  return <span>{isFloat ? count.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : Math.floor(count).toLocaleString('en-IN')}</span>;
};

const TilePreview = ({ room }) => {
  const pts = PREVIEW_PTS;
  const tileW = room.tileId === 'custom' ? (parseFloat(room.customTileW)/1000 || 0.6) : (parseFloat(room.tileId.split('x')[0])/1000 || 0.6);
  const tileH = room.tileId === 'custom' ? (parseFloat(room.customTileH)/1000 || 0.6) : (parseFloat(room.tileId.split('x')[1])/1000 || 0.6);
  const grout = parseFloat(room.groutJoint)/1000 || 0.003;
  const totalW = tileW + grout;
  const totalH = tileH + grout;

  const getPattern = () => {
    const p = room.pattern;
    const patId = `pat-${room.id}`;
    if (p === 'straight') return (
      <pattern id={patId} width={totalW} height={totalH} patternUnits="userSpaceOnUse">
        <rect width={tileW} height={tileH} fill="#d4c9b8" stroke="#8a7f72" strokeWidth={grout/2} />
      </pattern>
    );
    if (p === 'brick') return (
      <pattern id={patId} width={totalW} height={totalH*2} patternUnits="userSpaceOnUse">
        <rect x={0} y={0} width={tileW} height={tileH} fill="#d4c9b8" stroke="#8a7f72" strokeWidth={grout/2} />
        <rect x={totalW/2} y={totalH} width={tileW} height={tileH} fill="#cdc2b0" stroke="#8a7f72" strokeWidth={grout/2} />
        <rect x={-totalW/2} y={totalH} width={tileW} height={tileH} fill="#cdc2b0" stroke="#8a7f72" strokeWidth={grout/2} />
      </pattern>
    );
    if (p === 'diagonal') return (
      <pattern id={patId} width={totalW} height={totalH} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect width={tileW} height={tileH} fill="#d4c9b8" stroke="#8a7f72" strokeWidth={grout/2} />
      </pattern>
    );
    if (p === 'herringbone' || p === 'double-herringbone') return (
      <pattern id={patId} width={totalH + totalW} height={totalW + totalH} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
        <rect x={0} y={0} width={tileW} height={tileH} fill="#d4c9b8" stroke="#8a7f72" strokeWidth={grout/2}/>
        <rect x={totalW} y={0} width={tileH} height={tileW} fill="#cdc2b0" stroke="#8a7f72" strokeWidth={grout/2}/>
      </pattern>
    );
    return null;
  };

  const padding = 0.45;
  const vBox = `${-padding} ${-padding} ${3 + padding*2} ${3 + padding*2}`;

  return (
    <div className="w-full bg-[#faf8f5] rounded-xl overflow-hidden border border-zinc-200 no-print">
      <svg width="100%" height="280" viewBox={vBox}>
        <defs>
          {getPattern()}
          <clipPath id={`clip-${room.id}`}>
            <polygon points={pts.map(p => `${p[0]},${p[1]}`).join(' ')} />
          </clipPath>
        </defs>
        <polygon points={pts.map(p => `${p[0]},${p[1]}`).join(' ')} fill="#e5e0d8" />
        <rect x={-6} y={-6} width={18} height={18} fill={`url(#pat-${room.id})`} clipPath={`url(#clip-${room.id})`} />
        <polygon points={pts.map(p => `${p[0]},${p[1]}`).join(' ')} fill="none" stroke="#8a7f72" strokeWidth={0.045} />
      </svg>
      <p className="text-center text-[10px] text-zinc-400 pb-3 -mt-1">Pattern preview (3m × 3m reference)</p>
    </div>
  );
};

const defaultRoom = (id) => ({
  id: id || Date.now().toString(),
  name: `Room ${id ? '' : '1'}`,
  unit: 'ft',
  inputMode: 'dimensions',
  calculationMode: 'floor',
  roomWidth: '10',
  roomLength: '12',
  roomHeight: '10',
  area: '120',
  tileId: '600x600', customTileW: '', customTileH: '',
  pattern: 'straight', wastage: 5, groutJoint: 3,
  tilesPerBox: '4',
  groutBagSize: 2,
  adhesiveBagSize: 20
});

const getTileCountFallback = (size) => {
  if (size.count !== undefined && size.count !== null && size.count !== 0) {
    return size.count;
  }
  if (size.id === 'custom') return 0;
  if (size.w && size.h) {
    const area = (size.w * size.h) / 1000000;
    if (area <= 0.4) return 4;
    if (area <= 1.44) return 2;
    return 1;
  }
  return 4;
};

const TileCalculator = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [rooms, setRooms] = useState(() => {
    const stateHash = searchParams.get('state');
    if (stateHash) {
      const decoded = decodeState(stateHash);
      if (decoded && Array.isArray(decoded)) {
        return decoded.map(r => ({ ...defaultRoom(r.id), ...r }));
      }
    }
    return [defaultRoom(1)];
  });
  const [activeRoomId, setActiveRoomId] = useState(rooms[0]?.id);
  const [projectName, setProjectName] = useState('My Project');
  const [customerName, setCustomerName] = useState('');

  const [settings, setSettings] = useState({
    badge: "Advanced Planning Tool",
    title: "Tile Calculator",
    subtitle: "Calculate exact materials for multiple rooms, preview layouts, and generate branded PDF estimates.",
    tileSizes: [
      { id: '600x600', w: 600, h: 600, label: '600×600 mm', desc: 'LISC / MARVEL', count: 4 },
      { id: '600x1200', w: 600, h: 1200, label: '600×1200 mm', desc: 'GLASS / ELECTRA', count: 2 },
      { id: '800x1600', w: 800, h: 1600, label: '800×1600 mm', desc: 'MARBLE GLOSS', count: 2 },
      { id: '800x2400', w: 800, h: 2400, label: '800×2400 mm', desc: 'EXTRA MAX', count: 2 },
      { id: '800x3000', w: 800, h: 3000, label: '800×3000 mm', desc: 'EXTRA MAX XL', count: 1 },
      { id: 'custom', label: 'Custom', desc: 'Enter dimensions', count: 0 }
    ],
    patterns: [
      { id: 'straight', label: 'Straight Lay', wastage: 5, desc: 'Grid pattern' },
      { id: 'brick', label: 'Brick Offset', wastage: 10, desc: 'Staggered rows' },
      { id: 'herringbone', label: 'Herringbone', wastage: 15, desc: 'Classic V-pattern' },
      { id: 'diagonal', label: 'Diagonal 45°', wastage: 20, desc: 'Rotated grid' },
      { id: 'double-herringbone', label: 'Double Herringbone', wastage: 20, desc: 'Mirrored V-pattern' }
    ],
    groutOptions: [
      { value: 2, label: '2mm', factor: 1 },
      { value: 3, label: '3mm', factor: 1.4 },
      { value: 5, label: '5mm', factor: 2.2 }
    ]
  });

  useEffect(() => {
    const fetchCalculatorData = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const response = await api.get('/flais-guide');
        if (response.data && response.data.success) {
          const data = response.data.flaisGuide || {};
          if (data.tileCalculator) {
            const fetchedSizes = data.tileCalculator.tileSizes || [];
            setSettings(prev => ({
              badge: data.tileCalculator.badge || prev.badge,
              title: data.tileCalculator.title || prev.title,
              subtitle: data.tileCalculator.subtitle || prev.subtitle,
              tileSizes: fetchedSizes.length > 0 ? fetchedSizes : prev.tileSizes,
              patterns: data.tileCalculator.patterns && data.tileCalculator.patterns.length > 0 
                ? data.tileCalculator.patterns 
                : prev.patterns,
              groutOptions: data.tileCalculator.groutOptions && data.tileCalculator.groutOptions.length > 0 
                ? data.tileCalculator.groutOptions 
                : prev.groutOptions
            }));

            // Sync loaded rooms with db counts for non-custom sizes
            if (fetchedSizes.length > 0) {
              setRooms(prevRooms => prevRooms.map(room => {
                if (room.tileId !== 'custom') {
                  const sizeObj = fetchedSizes.find(s => s.id === room.tileId);
                  if (sizeObj) {
                    return { ...room, tilesPerBox: String(getTileCountFallback(sizeObj)) };
                  }
                }
                return room;
              }));
            }
          }
        }
      } catch (err) {
                setLoadError('Failed to load Tile Calculator settings.');
      } finally {
        setLoading(false);
      }
    };
    fetchCalculatorData();
  }, []);

  // ✅ FIX 1: Move useMemo BEFORE early returns (loading/error checks)
  const resultsByRoom = useMemo(() => {
    return rooms.reduce((acc, room) => {
      acc[room.id] = calculateRoomRequirements(room);
      return acc;
    }, {});
  }, [rooms]);

  const activeRoomIndex = rooms.findIndex(r => r.id === activeRoomId);
  const activeRoom = activeRoomIndex >= 0 ? rooms[activeRoomIndex] : rooms[0];
  const activeResults = activeRoom ? resultsByRoom[activeRoom.id] : null;

  // ✅ FIX 2: Move second useMemo BEFORE early returns too
  const grandTotal = useMemo(() => {
    return Object.values(resultsByRoom).reduce((acc, r) => ({
      areaSqm: acc.areaSqm + r.areaSqm,
      netTiles: acc.netTiles + r.netTiles,
      totalTiles: acc.totalTiles + r.totalTiles,
      boxes: acc.boxes + r.boxes,
      groutKg: acc.groutKg + r.groutKg,
      adhesiveKg: acc.adhesiveKg + r.adhesiveKg
    }), { areaSqm: 0, netTiles: 0, totalTiles: 0, boxes: 0, groutKg: 0, adhesiveKg: 0 });
  }, [resultsByRoom]);

  const recTile = activeResults ? getSmartTileRecommendation(activeResults.areaSqm) : null;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f5f0] px-6">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#5D4037]/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#5D4037] border-l-[#c5a880] animate-spin" />
          </div>
          <p className="text-sm font-display font-medium tracking-widest text-[#5D4037] uppercase">Loading Tile Calculator</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-600 px-6">
        <div className="max-w-md text-center space-y-3 rounded-3xl border border-zinc-200 bg-white p-8">
          <p className="text-lg font-bold text-zinc-900">Tile Calculator unavailable</p>
          <p className="text-sm text-zinc-600">{loadError}</p>
        </div>
      </div>
    );
  }

  const updateRoom = (id, updates) => {
    setRooms(rooms.map(r => {
      if (r.id === id) {
        const merged = { ...r, ...updates };
        if (merged.inputMode === 'dimensions') {
          const w = parseFloat(merged.roomWidth) || 0;
          const l = parseFloat(merged.roomLength) || 0;
          const h = parseFloat(merged.roomHeight) || 0;
          let calculatedArea = 0;
          if (merged.calculationMode === 'floor') {
            calculatedArea = w * l;
          } else if (merged.calculationMode === 'wall') {
            calculatedArea = 2 * (w + l) * h;
          } else if (merged.calculationMode === 'floor-wall') {
            calculatedArea = (w * l) + 2 * (w + l) * h;
          }
          merged.area = calculatedArea % 1 === 0 ? calculatedArea.toString() : calculatedArea.toFixed(2);
        }
        return merged;
      }
      return r;
    }));
  };



  const addRoom = () => {
    const newRoom = defaultRoom(rooms.length + 1);
    setRooms([...rooms, newRoom]);
    setActiveRoomId(newRoom.id);
  };

  const removeRoom = (id) => {
    if (rooms.length === 1) return;
    const newRooms = rooms.filter(r => r.id !== id);
    setRooms(newRooms);
    if (activeRoomId === id) setActiveRoomId(newRooms[0].id);
  };

  const handleShare = () => {
    const stateHash = encodeState(rooms);
    const url = new URL(window.location.href);
    url.searchParams.set('state', stateHash);
    navigator.clipboard.writeText(url.toString());
    toast.success('Link copied! Share with your contractor');
  };

  const handlePrint = () => {
    window.print();
  };

  const formSectionClasses = "bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 mb-6 no-print";
  const labelClasses = "block text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-4";
  const inputClasses = "w-full bg-[#faf8f5] border border-zinc-200 focus:border-[#886d5e] focus:ring-1 focus:ring-[#886d5e] rounded-xl px-4 py-3 outline-none transition-all";

  return (
    <div className="min-h-screen bg-[#FCFCFC] pt-28 sm:pt-32 md:pt-40 pb-12 sm:pb-16 md:pb-20 font-sans">
      <SEO 
        title="Tile Calculator - Estimate Required Tiles & Boxes"
        description="Estimate exactly how many tile boxes, grout bags, and adhesive you need for your project. Choose patterns like Straight Lay, Brick Offset, or Herringbone."
        keywords="tile calculator, floor tile estimator, calculate tiles needed, tile area calculator, grout calculator"
      />
      <Toaster position="bottom-center" />
      <style>
        {`
          @media print {
            body * { visibility: hidden; }
            .print-container, .print-container * { visibility: visible; }
            .print-container { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
            body { background: white; }
          }
        `}
      </style>

      {/* PRINT ONLY SECTION */}
      <div className="print-container hidden print:block bg-white text-black p-8 font-sans">
        <div className="border-b-2 border-[#5D4037] pb-6 mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-display font-bold text-[#5D4037]">FLAIS GRANITO</h1>
            <p className="text-sm text-zinc-600">Premium Full Body Vitrified Tiles</p>
          </div>
          <div className="text-right text-sm">
            <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            {projectName && <p><strong>Project:</strong> {projectName}</p>}
            {customerName && <p><strong>Customer:</strong> {customerName}</p>}
          </div>
        </div>

        <h2 className="text-xl font-bold mb-4">Project Estimate Breakdown</h2>
        
        <table className="w-full text-left border-collapse mb-8 text-sm">
          <thead>
            <tr className="bg-zinc-100">
              <th className="p-3 border">Room</th>
              <th className="p-3 border">Area (sqm)</th>
              <th className="p-3 border">Tile Pattern</th>
              <th className="p-3 border">Tiles Needed</th>
              <th className="p-3 border">Boxes</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => {
              const res = resultsByRoom[room.id];
              return (
                <tr key={room.id}>
                  <td className="p-3 border font-medium">{room.name}</td>
                  <td className="p-3 border">{res.areaSqm.toFixed(2)}</td>
                  <td className="p-3 border capitalize">{room.pattern} ({room.wastage}%)</td>
                  <td className="p-3 border">{res.totalTiles}</td>
                  <td className="p-3 border">{res.boxes}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="bg-zinc-50 p-6 rounded-lg border border-zinc-200">
          <h2 className="text-lg font-bold mb-4 uppercase tracking-wider text-zinc-500">Grand Total Summary</h2>
          <div className="grid grid-cols-3 gap-6">
            <div><p className="text-sm text-zinc-500">Total Area</p><p className="text-xl font-bold">{grandTotal.areaSqm.toFixed(2)} sqm</p></div>
            <div><p className="text-sm text-zinc-500">Total Tiles</p><p className="text-xl font-bold">{grandTotal.totalTiles}</p></div>
            <div><p className="text-sm text-zinc-500">Total Boxes</p><p className="text-xl font-bold">{grandTotal.boxes}</p></div>
            <div><p className="text-sm text-zinc-500">Total Grout</p><p className="text-xl font-bold">{grandTotal.groutKg.toFixed(2)} kg</p></div>
            <div><p className="text-sm text-zinc-500">Total Adhesive</p><p className="text-xl font-bold">{grandTotal.adhesiveKg.toFixed(2)} kg</p></div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-zinc-200 text-center text-xs text-zinc-500">
          <p>flaisgranito.com | +91 95862 38772 | Wankaner, Morbi, Gujarat</p>
          <p className="mt-2 italic">Estimates are approximate based on standard installation practices. Always consult your contractor.</p>
        </div>
      </div>
      {/* END PRINT ONLY */}

      <div className="container-custom no-print">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 sm:gap-6 mb-8">
          <div>
            <div className="inline-block px-3 py-1 bg-beige-100 text-[#5D4037] text-xs font-bold uppercase tracking-widest rounded-full mb-4">
              {settings.badge}
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-display font-light text-zinc-900 mb-2 sm:mb-4">
              {settings.title}
            </h1>
            <p className="text-lg text-zinc-500 max-w-2xl">
              {settings.subtitle}
            </p>
          </div>
          <div className="flex gap-2 sm:gap-3 shrink-0">
            <button onClick={handleShare} className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 bg-white border border-zinc-200 rounded-lg text-zinc-700 hover:bg-zinc-50 font-medium transition text-sm">
              <Share2 size={16} /> Share
            </button>
            <button onClick={handlePrint} className="flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 bg-[#5D4037] text-white rounded-lg hover:bg-[#4a332c] font-medium transition shadow-md text-sm">
              <Printer size={16} /> Print PDF
            </button>
          </div>
        </motion.div>

        {/* Project Meta */}
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-zinc-200 flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8">
          <div className="flex-1">
            <label className="block text-xs font-semibold text-zinc-500 mb-1">Project Name</label>
            <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full border-none bg-transparent outline-none font-medium text-zinc-800" placeholder="e.g. Dream Villa" />
          </div>
          <div className="flex-1 border-l border-zinc-100 pl-4">
            <label className="block text-xs font-semibold text-zinc-500 mb-1">Customer Name</label>
            <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full border-none bg-transparent outline-none font-medium text-zinc-800" placeholder="Optional" />
          </div>
        </div>

        {/* Room Tabs removed */}

        {activeRoom && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column - Form */}
            <div className="lg:col-span-7">
              {/* Section 1: Room Dimensions */}
              <div className={formSectionClasses}>
                <h2 className={labelClasses}>1. Room Dimensions & Target</h2>
                
                {/* Toggles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  {/* Input Mode Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-2">Input Method</label>
                    <div className="flex bg-[#faf8f5] p-1 rounded-xl border border-zinc-200">
                      <button
                        type="button"
                        onClick={() => updateRoom(activeRoom.id, { inputMode: 'dimensions' })}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                          activeRoom.inputMode === 'dimensions'
                            ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                      >
                        Dimensions
                      </button>
                      <button
                        type="button"
                        onClick={() => updateRoom(activeRoom.id, { inputMode: 'direct' })}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                          activeRoom.inputMode === 'direct'
                            ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                      >
                        Enter Area
                      </button>
                    </div>
                  </div>

                  {/* Unit Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-600 mb-2">Measurement Unit</label>
                    <div className="flex bg-[#faf8f5] p-1 rounded-xl border border-zinc-200">
                      <button
                        type="button"
                        onClick={() => updateRoom(activeRoom.id, { unit: 'ft' })}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                          activeRoom.unit === 'ft'
                            ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                      >
                        Feet (ft)
                      </button>
                      <button
                        type="button"
                        onClick={() => updateRoom(activeRoom.id, { unit: 'm' })}
                        className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${
                          activeRoom.unit === 'm'
                            ? 'bg-white text-zinc-900 shadow-sm font-semibold'
                            : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                      >
                        Meters (m)
                      </button>
                    </div>
                  </div>
                </div>

                {/* Calculation Mode Selector - Only for Dimension mode */}
                {activeRoom.inputMode === 'dimensions' && (
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-zinc-600 mb-2">Area to Tile</label>
                    <div className="flex bg-[#faf8f5] p-1 rounded-xl border border-zinc-200">
                      <button
                        type="button"
                        onClick={() => updateRoom(activeRoom.id, { calculationMode: 'floor' })}
                        className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all ${
                          activeRoom.calculationMode === 'floor'
                            ? 'bg-zinc-900 text-white shadow-sm font-semibold'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        Floor Only
                      </button>
                      <button
                        type="button"
                        onClick={() => updateRoom(activeRoom.id, { calculationMode: 'wall' })}
                        className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all ${
                          activeRoom.calculationMode === 'wall'
                            ? 'bg-zinc-900 text-white shadow-sm font-semibold'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        Walls Only
                      </button>
                      <button
                        type="button"
                        onClick={() => updateRoom(activeRoom.id, { calculationMode: 'floor-wall' })}
                        className={`flex-1 py-2.5 text-xs font-medium rounded-lg transition-all ${
                          activeRoom.calculationMode === 'floor-wall'
                            ? 'bg-zinc-900 text-white shadow-sm font-semibold'
                            : 'text-zinc-600 hover:text-zinc-900'
                        }`}
                      >
                        Floor + Walls
                      </button>
                    </div>
                  </div>
                )}

                {/* Dimension Inputs */}
                {activeRoom.inputMode === 'dimensions' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-2">
                        Width ({activeRoom.unit})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={activeRoom.roomWidth}
                        onChange={(e) => updateRoom(activeRoom.id, { roomWidth: e.target.value })}
                        className={inputClasses}
                        placeholder="e.g. 10"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-600 mb-2">
                        Length ({activeRoom.unit})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={activeRoom.roomLength}
                        onChange={(e) => updateRoom(activeRoom.id, { roomLength: e.target.value })}
                        className={inputClasses}
                        placeholder="e.g. 12"
                      />
                    </div>
                    {(activeRoom.calculationMode === 'wall' || activeRoom.calculationMode === 'floor-wall') && (
                      <div className="col-span-2 md:col-span-1">
                        <label className="block text-xs font-semibold text-zinc-600 mb-2">
                          Wall Height ({activeRoom.unit})
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="any"
                          value={activeRoom.roomHeight}
                          onChange={(e) => updateRoom(activeRoom.id, { roomHeight: e.target.value })}
                          className={inputClasses}
                          placeholder="e.g. 10"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Direct Area Input */
                  <div className="mb-6">
                    <label className="block text-xs font-semibold text-zinc-600 mb-2">
                      Total Area (sq {activeRoom.unit === 'ft' ? 'ft' : 'm'})
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={activeRoom.area}
                      onChange={(e) => updateRoom(activeRoom.id, { area: e.target.value })}
                      className={inputClasses}
                      placeholder="e.g. 120"
                    />
                  </div>
                )}

                {/* Display Calculated/Entered Area Card */}
                <div className="p-4 rounded-xl bg-beige-50 border border-beige-100 flex justify-between items-center">
                  <div>
                    <span className="text-xs text-zinc-500 font-medium block">Total Area to Tile</span>
                    <span className="text-2xl font-bold font-display text-zinc-800">
                      {parseFloat(activeRoom.area) || 0}
                      <span className="text-sm font-normal text-zinc-500 ml-1">
                        sq {activeRoom.unit === 'ft' ? 'ft' : 'm'}
                      </span>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">Equivalent</span>
                    <span className="text-sm font-semibold text-[#886d5e]">
                      {activeRoom.unit === 'ft'
                        ? ((parseFloat(activeRoom.area) || 0) * 0.09290304).toFixed(2)
                        : ((parseFloat(activeRoom.area) || 0) * 10.76391).toFixed(2)}
                      <span className="text-xs font-normal text-zinc-500 ml-1">
                        sq {activeRoom.unit === 'ft' ? 'm' : 'ft'}
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              <div className={formSectionClasses}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className={labelClasses + " !mb-0"}>2. Tile Size & Pattern</h2>

                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {settings.tileSizes.map((size) => (
                    <button
                      key={size.id}
                      onClick={() => {
                        const updates = { tileId: size.id };
                        if (size.id !== 'custom') {
                          updates.tilesPerBox = String(getTileCountFallback(size));
                        }
                        updateRoom(activeRoom.id, updates);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all relative ${
                        activeRoom.tileId === size.id 
                        ? 'bg-zinc-900 border-zinc-900 text-white' 
                        : 'bg-[#faf8f5] border-zinc-200 text-zinc-700 hover:border-[#886d5e]'
                      }`}
                    >
                      <div className="font-semibold text-sm">{size.label}</div>
                      <div className={`text-[10px] mt-1 line-clamp-1 ${activeRoom.tileId === size.id ? 'text-zinc-400' : 'text-zinc-500'}`}>
                        {size.desc}
                      </div>
                    </button>
                  ))}
                </div>

                {activeRoom.tileId === 'custom' && (
                  <div className="grid grid-cols-2 gap-4 p-4 mb-6 bg-beige-50 rounded-xl border border-beige-100">
                    <div><label className="block text-xs font-semibold text-zinc-600 mb-2">Width (mm)</label><input type="number" min="0" value={activeRoom.customTileW} onChange={e => updateRoom(activeRoom.id, { customTileW: e.target.value })} className={inputClasses} placeholder="e.g. 600" /></div>
                    <div><label className="block text-xs font-semibold text-zinc-600 mb-2">Length (mm)</label><input type="number" min="0" value={activeRoom.customTileH} onChange={e => updateRoom(activeRoom.id, { customTileH: e.target.value })} className={inputClasses} placeholder="e.g. 1200" /></div>
                  </div>
                )}

                <label className="block text-sm font-semibold text-zinc-800 mb-3">Laying Pattern</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {settings.patterns.map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => updateRoom(activeRoom.id, { pattern: opt.id, wastage: opt.wastage })}
                      className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                        activeRoom.pattern === opt.id
                        ? 'bg-zinc-900 border-zinc-900 text-white'
                        : 'bg-[#faf8f5] border-zinc-200 text-zinc-700 hover:border-[#886d5e]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-500 mt-2 flex items-center gap-1">
                  Pattern auto-sets wastage to: <span className="font-bold text-zinc-800">{activeRoom.wastage}%</span>
                </p>
              </div>

              <div className={formSectionClasses}>
                <h2 className={labelClasses}>3. Packaging & Materials</h2>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm text-zinc-600 mb-2">Tiles per Box</label>
                      <input
                        type="number"
                        min="0"
                        value={activeRoom.tilesPerBox}
                        onChange={e => updateRoom(activeRoom.id, { tilesPerBox: e.target.value })}
                        disabled={activeRoom.tileId !== 'custom'}
                        className={`${inputClasses} ${activeRoom.tileId !== 'custom' ? 'opacity-60 bg-zinc-100 cursor-not-allowed' : ''}`}
                        title={activeRoom.tileId !== 'custom' ? "This value is fixed by admin and cannot be changed." : ""}
                      />
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-zinc-100">
                    <label className="block text-sm font-semibold text-zinc-800 mb-3">Grout Details</label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {settings.groutOptions.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => updateRoom(activeRoom.id, { groutJoint: opt.value })}
                          className={`py-1.5 px-4 rounded-lg border text-xs font-medium transition-all ${
                            activeRoom.groutJoint === opt.value
                            ? 'bg-zinc-900 border-zinc-900 text-white'
                            : 'bg-[#faf8f5] border-zinc-200 text-zinc-700 hover:border-[#886d5e]'
                          }`}
                        >
                          {opt.label} joint
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div><label className="block text-xs text-zinc-600 mb-2">Bag Size (kg)</label><input type="number" min="0" value={activeRoom.groutBagSize} onChange={e => updateRoom(activeRoom.id, { groutBagSize: e.target.value })} className={inputClasses + " !py-2 !text-sm"} /></div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-100">
                    <label className="block text-sm font-semibold text-zinc-800 mb-3">Adhesive Details</label>
                    <div className="grid grid-cols-1 gap-4">
                      <div><label className="block text-xs text-zinc-600 mb-2">Bag Size (kg)</label><input type="number" min="0" value={activeRoom.adhesiveBagSize} onChange={e => updateRoom(activeRoom.id, { adhesiveBagSize: e.target.value })} className={inputClasses + " !py-2 !text-sm"} /></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Column - Preview & Results */}
            <div className="lg:col-span-5 relative">
              <div className="sticky top-28 space-y-6">
                
                <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-6 no-print">
                  <h2 className={labelClasses}>Tile Pattern Preview</h2>
                  <TilePreview room={activeRoom} />
                </div>

                {activeResults && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={activeRoom.id}
                    className="bg-[#5D4037] rounded-2xl p-8 text-white shadow-xl relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 p-12 bg-white/5 rounded-bl-full -mr-10 -mt-10 pointer-events-none" />
                    
                    <h3 className="font-display text-2xl font-semibold mb-6">{activeRoom.name} Results</h3>
                    
                    <div className="space-y-4 mb-8 relative z-10">

                      <div className="flex justify-between items-end border-b border-white/10 pb-3">
                        <span className="text-white/70 text-sm">Net Tiles (no wastage)</span>
                        <span className="font-medium"><Counter value={activeResults.netTiles} /> tiles</span>
                      </div>
                      
                      <div className="flex justify-between items-end border-b border-white/10 pb-3">
                        <span className="text-white/70 text-sm">Wastage ({activeRoom.wastage}%)</span>
                        <span className="text-beige-300 font-medium">+<Counter value={activeResults.wastageCount} /> tiles</span>
                      </div>

                      <div className="flex justify-between items-end pt-2">
                        <span className="text-white/90 font-medium">Total Tiles Needed</span>
                        <span className="text-4xl font-display font-bold text-beige-100">
                          <Counter value={activeResults.totalTiles} />
                        </span>
                      </div>
                    </div>

                    <div className="bg-white/10 rounded-xl p-5 mb-6 space-y-3 relative z-10 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Boxes ({activeRoom.tilesPerBox || 0}/box)</span>
                        <span className="font-bold text-base">{activeResults.boxes}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Grout Required</span>
                        <span className="font-medium">{activeResults.groutKg.toFixed(2)} kg ({activeResults.groutBags} bags)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-white/80">Adhesive Required</span>
                        <span className="font-medium">{activeResults.adhesiveKg.toFixed(2)} kg ({activeResults.adhesiveBags} bags)</span>
                      </div>
                    </div>
                  </motion.div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* Grand Total Card */}
        {rooms.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="mt-12 bg-zinc-900 rounded-3xl p-8 lg:p-12 text-white shadow-2xl relative overflow-hidden no-print">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-[#886d5e]/30 to-transparent rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none" />
            <div className="relative z-10">
              <h2 className="text-3xl font-display font-bold mb-8 text-beige-100">Grand Total Project Materials</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
                <div><p className="text-zinc-400 text-sm mb-1">Total Area</p><p className="text-2xl font-bold">{grandTotal.areaSqm.toFixed(2)} <span className="text-sm font-normal text-zinc-500">sqm</span></p></div>
                <div><p className="text-zinc-400 text-sm mb-1">Total Tiles</p><p className="text-3xl font-display font-bold text-beige-200">{grandTotal.totalTiles}</p></div>
                <div><p className="text-zinc-400 text-sm mb-1">Total Boxes</p><p className="text-2xl font-bold">{grandTotal.boxes}</p></div>
                <div><p className="text-zinc-400 text-sm mb-1">Total Grout</p><p className="text-2xl font-bold">{grandTotal.groutKg.toFixed(1)} <span className="text-sm font-normal text-zinc-500">kg</span></p></div>
                <div><p className="text-zinc-400 text-sm mb-1">Total Adhesive</p><p className="text-2xl font-bold">{grandTotal.adhesiveKg.toFixed(1)} <span className="text-sm font-normal text-zinc-500">kg</span></p></div>
              </div>
              <div className="mt-8 flex justify-end">
                <button onClick={handlePrint} className="px-6 py-3 bg-white text-zinc-900 rounded-xl font-bold hover:bg-beige-50 transition shadow-md flex items-center gap-2">
                  <Printer size={18} /> Print Project Estimate
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};

export default TileCalculator;
