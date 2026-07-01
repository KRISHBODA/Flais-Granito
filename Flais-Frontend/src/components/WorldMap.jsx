import React, { useState, useEffect } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, RotateCcw, Globe, ArrowRight } from 'lucide-react';

const GEO_URL =
  'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

const DEFAULT_COUNTRIES = [
  {
    id: 1,
    name: 'UAE',
    fullName: 'United Arab Emirates',
    coordinates: [54.37, 24.47],
    flag: '🇦🇪',
    region: 'Middle East',
    highlight: 'Premium Hospitality & Luxury Residential',
    detail:
      'Our largest export market. FLAIS tiles grace luxury residential and hospitality projects across Dubai, Abu Dhabi, and beyond.',
  },
  {
    id: 2,
    name: 'USA',
    fullName: 'United States',
    coordinates: [-99.13, 38.01],
    flag: '🇺🇸',
    region: 'North America',
    highlight: 'Commercial & High-End Residential',
    detail:
      'Supplying premium vitrified tiles to commercial developers and design studios across major US metro areas.',
  },
  {
    id: 3,
    name: 'UK',
    fullName: 'United Kingdom',
    coordinates: [-1.17, 52.37],
    flag: '🇬🇧',
    region: 'Europe',
    highlight: 'Retail Distribution & Design Studios',
    detail:
      'Partnering with UK retailers and interior designers to deliver contemporary tile collections across England, Scotland, and Wales.',
  },
  {
    id: 4,
    name: 'Australia',
    fullName: 'Australia',
    coordinates: [133.77, -25.27],
    flag: '🇦🇺',
    region: 'Oceania',
    highlight: 'Construction & Outdoor Spaces',
    detail:
      "Growing presence in Australia's thriving construction sector with a focus on full-body vitrified and outdoor-rated tile collections.",
  },
  {
    id: 5,
    name: 'Canada',
    fullName: 'Canada',
    coordinates: [-96.8, 56.1],
    flag: '🇨🇦',
    region: 'North America',
    highlight: 'Architectural & Climate-Resistant Tiles',
    detail:
      'Trusted by Canadian architects and contractors for our frost-resistant, durable tile solutions suited to extreme climates.',
  },
];

const getCountryForGeo = (geo, countriesList) => {
  const geoName = geo.properties.name;
  const nameMap = {
    'United States of America': 'USA',
    'United States': 'USA',
    'United Arab Emirates': 'UAE',
    'United Kingdom': 'UK',
    'Australia': 'Australia',
    'Canada': 'Canada'
  };
  const normalizedGeo = nameMap[geoName] || geoName;
  return countriesList.find(c => c.name.toLowerCase() === normalizedGeo.toLowerCase());
};

const WorldMap = ({ countries }) => {
  const [activeCountryName, setActiveCountryName] = useState('UAE');
  const [hoveredCountry, setHoveredCountry] = useState(null);
  const [exportCountries, setExportCountries] = useState(DEFAULT_COUNTRIES);
  const [position, setPosition] = useState({ coordinates: [15, 10], zoom: 1 });
  const [showCtrlTip, setShowCtrlTip] = useState(false);

  useEffect(() => {
    if (countries && countries.length > 0) {
      setExportCountries(countries);
    }
  }, [countries]);
  const ctrlTipTimeoutRef = React.useRef(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const updateTooltipPosition = (e) => {
    const container = document.getElementById('map-canvas-container');
    if (container) {
      const rect = container.getBoundingClientRect();
      setTooltipPos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top - 15,
      });
    }
  };

  const handleMapWheel = (e) => {
    if (e.type === 'wheel' && !e.ctrlKey) {
      setShowCtrlTip(true);
      if (ctrlTipTimeoutRef.current) {
        clearTimeout(ctrlTipTimeoutRef.current);
      }
      ctrlTipTimeoutRef.current = setTimeout(() => {
        setShowCtrlTip(false);
      }, 1800);
    }
  };

  useEffect(() => {
    const loadCountries = () => {
      try {
        const saved = localStorage.getItem('flais_export_countries');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setExportCountries(parsed);
          }
        }
      } catch (err) {
              }
    };

    loadCountries();

    const handleStorage = (e) => {
      if (e.key === 'flais_export_countries') loadCountries();
    };
    const handleCustom = () => loadCountries();

    window.addEventListener('storage', handleStorage);
    window.addEventListener('flais_export_countries_updated', handleCustom);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('flais_export_countries_updated', handleCustom);
      if (ctrlTipTimeoutRef.current) {
        clearTimeout(ctrlTipTimeoutRef.current);
      }
    };
  }, []);

  const selectedCountry = exportCountries.find(
    (c) => c.name === (hoveredCountry?.name || activeCountryName)
  ) || exportCountries[0];

  const handleZoomIn = () => {
    if (position.zoom < 4) {
      setPosition((prev) => ({ ...prev, zoom: prev.zoom + 0.5 }));
    }
  };

  const handleZoomOut = () => {
    if (position.zoom > 1) {
      setPosition((prev) => ({ ...prev, zoom: prev.zoom - 0.5 }));
    }
  };

  const handleReset = () => {
    setPosition({ coordinates: [15, 10], zoom: 1 });
  };

  const handleMoveEnd = (position) => {
    setPosition(position);
  };

  return (
    <div className="w-full space-y-6">
      {/* Map Main Box */}
      <div className="relative w-full h-[350px] sm:h-[500px] md:h-[600px] lg:h-[700px] rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[2.5rem] overflow-hidden bg-[#FAF8F5] border border-[#D2C9B1]/40 shadow-[0_25px_60px_rgba(93,64,55,0.06)]">
        
        {/* Map Canvas */}
        <div 
          id="map-canvas-container"
          className="w-full h-full relative bg-[#FAF8F5]"
          onWheel={handleMapWheel}
        >
          {/* Ctrl + Scroll Tip Overlay */}
          <AnimatePresence>
            {showCtrlTip && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/35 backdrop-blur-[2px] flex items-center justify-center z-30 pointer-events-none"
              >
                <div className="bg-white/95 text-[#5D4037] px-6 py-3 rounded-2xl shadow-xl border border-[#D2C9B1]/40 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-zinc-100 rounded-md border border-zinc-200 text-[10px] font-mono shadow-sm">Ctrl</kbd>
                  <span>+ Scroll to zoom the map</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive Pinpoint Tooltip */}
          <AnimatePresence>
            {hoveredCountry && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                style={{
                  position: 'absolute',
                  left: `${tooltipPos.x}px`,
                  top: `${tooltipPos.y}px`,
                  transform: 'translate(-50%, -100%)',
                }}
                className="pointer-events-none z-40 w-72 bg-white/95 backdrop-blur-md border border-[#D2C9B1]/40 p-4 rounded-2xl shadow-xl space-y-2.5"
              >
                {/* Arrow pointer */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-x-[8px] border-x-transparent border-t-[8px] border-t-white/95" />
                
                <div className="flex items-center gap-2">
                  <span className="text-2xl filter drop-shadow-sm select-none">{hoveredCountry.flag}</span>
                  <div>
                    <h4 className="font-display font-bold text-zinc-900 text-sm leading-tight">
                      {hoveredCountry.fullName}
                    </h4>
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#5D4037]">
                      {hoveredCountry.region}
                    </span>
                  </div>
                </div>
                
                <p className="text-zinc-600 text-xs leading-relaxed font-light">
                  {hoveredCountry.detail}
                </p>
                
                <div className="pt-2 border-t border-[#D2C9B1]/30">
                  <span className="text-[8px] font-bold uppercase tracking-wider text-zinc-400 block mb-0.5">Key Focus</span>
                  <p className="text-[11px] font-bold text-[#5D4037] leading-snug">
                    {hoveredCountry.highlight}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <ComposableMap
            projectionConfig={{ scale: 147, center: [15, 10] }}
            style={{ width: '100%', height: '100%', minHeight: '380px' }}
          >
            <defs>
              {/* Premium Dotted Grid Pattern for Ocean */}
              <pattern id="dotGrid" width="16" height="16" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.75" fill="#D2C9B1" opacity="0.25" />
              </pattern>
              
              {/* Soft drop shadow for landmasses */}
              <filter id="landShadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#5D4037" floodOpacity="0.05" />
              </filter>
            </defs>

            {/* Grid Pattern Background */}
            <rect width="100%" height="100%" fill="url(#dotGrid)" />

            <ZoomableGroup
              zoom={position.zoom}
              center={position.coordinates}
              onMoveEnd={handleMoveEnd}
              filterZoomEvent={(event) => {
                if (event.type === 'wheel') {
                  return event.ctrlKey;
                }
                return true;
              }}
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const country = getCountryForGeo(geo, exportCountries);
                    const isExport = !!country;
                    const isSelected = selectedCountry.name === country?.name;
                    
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={(e) => {
                          if (isExport) {
                            setHoveredCountry(country);
                            updateTooltipPosition(e);
                          }
                        }}
                        onMouseMove={(e) => {
                          if (isExport) updateTooltipPosition(e);
                        }}
                        onMouseLeave={() => {
                          if (isExport) setHoveredCountry(null);
                        }}
                        onClick={() => {
                          if (isExport) setActiveCountryName(country.name);
                        }}
                        filter="url(#landShadow)"
                        fill={isSelected ? '#5D4037' : isExport ? '#D2C5B1' : '#EAE4D7'}
                        stroke="#FAF8F5"
                        strokeWidth={isSelected ? 0.8 : 0.4}
                        style={{
                          default: { 
                            outline: 'none',
                            transition: 'fill 0.4s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease'
                          },
                          hover: { 
                            fill: isExport ? '#5D4037' : '#DFD6C5', 
                            outline: 'none',
                            cursor: isExport ? 'pointer' : 'default',
                            transition: 'fill 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                          },
                          pressed: { outline: 'none' },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {exportCountries.map((country, i) => {
                const isSelected = selectedCountry.name === country.name;
                return (
                  <Marker
                    key={country.id || country.name}
                    coordinates={country.coordinates}
                    onMouseEnter={(e) => {
                      setHoveredCountry(country);
                      updateTooltipPosition(e);
                    }}
                    onMouseMove={updateTooltipPosition}
                    onMouseLeave={() => setHoveredCountry(null)}
                    onClick={() => setActiveCountryName(country.name)}
                    style={{ cursor: 'pointer' }}
                  >
                    {/* Ring Pulse */}
                    <circle r={isSelected ? 18 : 12} fill="#5D4037" opacity={isSelected ? 0.3 : 0.15} style={{ transition: 'all 0.3s ease' }}>
                      <animate
                        attributeName="r"
                        values={isSelected ? "12;24;12" : "8;16;8"}
                        dur="3s"
                        begin={`${i * 0.5}s`}
                        repeatCount="indefinite"
                      />
                      <animate
                        attributeName="opacity"
                        values={isSelected ? "0.3;0;0.3" : "0.15;0;0.15"}
                        dur="3s"
                        begin={`${i * 0.5}s`}
                        repeatCount="indefinite"
                      />
                    </circle>
                    
                    {/* Core circle */}
                    <circle 
                      r={5} 
                      fill={isSelected ? "#D2C9B1" : "#5D4037"} 
                      stroke="#FAF8F5" 
                      strokeWidth={1.5} 
                      style={{ 
                        transition: 'all 0.3s ease',
                        filter: 'drop-shadow(0px 2px 4px rgba(93, 64, 55, 0.3))'
                      }} 
                    />

                    {/* Minimal text Label */}
                    <text
                      y={-14}
                      textAnchor="middle"
                      style={{
                        fontSize: '7px',
                        fontWeight: 800,
                        fill: isSelected ? '#5D4037' : '#7D6357',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        pointerEvents: 'none',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {country.name}
                    </text>
                  </Marker>
                );
              })}
            </ZoomableGroup>
          </ComposableMap>

          {/* Floating Zoom & Control Bar */}
          <div className="absolute bottom-6 right-6 flex items-center gap-1.5 p-1.5 rounded-full bg-white/70 backdrop-blur-md border border-[#D2C9B1]/30 shadow-lg">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 hover:text-[#5D4037] hover:bg-white/80 transition-all active:scale-90"
              title="Zoom In"
            >
              <Plus size={14} />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 hover:text-[#5D4037] hover:bg-white/80 transition-all active:scale-90"
              title="Zoom Out"
            >
              <Minus size={14} />
            </button>
            <div className="w-[1px] h-4 bg-[#D2C9B1]/30 mx-0.5" />
            <button
              onClick={handleReset}
              className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-600 hover:text-[#5D4037] hover:bg-white/80 transition-all active:scale-90"
              title="Reset View"
            >
              <RotateCcw size={14} />
            </button>
          </div>

          {/* Quick Info Bar */}
          <div className="absolute top-6 right-6 hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/70 backdrop-blur-md border border-[#D2C9B1]/30 text-[9px] font-bold uppercase tracking-wider text-zinc-500 select-none">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Click pins or hover to navigate
          </div>
        </div>
      </div>

      {/* Legend Pills */}
      <div className="flex flex-wrap justify-center gap-2 sm:gap-2.5">
        {exportCountries.map((c) => {
          const isSelected = selectedCountry.name === c.name;
          return (
            <motion.span
              key={c.id || c.name}
              onClick={() => setActiveCountryName(c.name)}
              className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4.5 sm:py-2 rounded-full border text-[10px] sm:text-xs font-bold transition-all duration-300 cursor-pointer shadow-sm select-none
                ${isSelected
                  ? 'bg-[#5D4037] text-[#FAF8F5] border-[#5D4037] scale-105 shadow-md shadow-[#5D4037]/10'
                  : 'bg-white border-[#D2C9B1]/30 text-zinc-700 hover:border-[#5D4037]/60 hover:bg-[#FAF8F5]'
                }`}
            >
              <span className="text-sm leading-none">{c.flag}</span>
              <span className="tracking-wide">{c.fullName}</span>
            </motion.span>
          );
        })}
      </div>
    </div>
  );
};

export default WorldMap;
