import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Move, Scissors, Layers, Grid, Construction, Ruler, FileText } from 'lucide-react';
import SEO from '../components/SEO';
import api from '../utils/api';

const AccordionItem = ({ title, icon: Icon, content, isOpen, onClick }) => {
  return (
    <div className="bg-zinc-50 mb-4 transition-all duration-300">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-6 md:p-8 cursor-pointer focus:outline-none group"
      >
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-zinc-300 flex items-center justify-center group-hover:border-[#5D4037] group-hover:bg-[#5D4037]/5 transition-colors">
            <Icon size={28} className="text-zinc-600 group-hover:text-[#5D4037] transition-colors" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-zinc-900 text-left">{title}</h3>
        </div>
        <ChevronDown
          size={24}
          className={`text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#5D4037]' : ''}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 md:p-8 pt-0 text-zinc-600 leading-relaxed text-lg border-t border-zinc-200/50 mx-6 md:mx-8">
              {content}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const ICON_MAP = { Ruler, Scissors, Layers, Grid, Construction, Move };

const InstallationGuide = () => {
  const [openItems, setOpenItems] = useState([]); // All items closed by default
  const [settings, setSettings] = useState({
    title: "Process for Flais Granito",
    subtitle: "Installation Guide",
    heroImage: "",
    steps: [
      {
        title: 'Use of Tile Levelling System During the Installation',
        icon: 'Ruler',
        content: 'To ensure a perfectly flat surface, especially for large format slabs, we strongly recommend using a high-quality tile levelling system (wedges and clips). This prevents lippage during the adhesive curing process and ensures that adjacent tiles are perfectly flush with one another. Apply the clips near the corners and along the edges as per the manufacturer\'s spacing guidelines.'
      },
      {
        title: 'Joints',
        icon: 'Grid',
        content: 'Never install tiles butt-jointed. A minimum grout joint of 2mm to 3mm is mandatory for indoor installations, and 3mm to 5mm for outdoor or high-stress areas. Joints accommodate structural movements, thermal expansion, and dimensional tolerances. Use high-quality, flexible epoxy or cementitious grout that matches the tile color for a seamless look.'
      },
      {
        title: 'Laying With Adhesives',
        icon: 'Layers',
        content: 'Always use the double-spreading (back-buttering) technique for large formats. Apply the adhesive to both the substrate using a notched trowel and to the back of the tile using a flat trowel. This ensures 100% coverage and eliminates voids that could cause cracking upon impact. Choose a highly deformable adhesive (Class C2TE S1 or S2) suitable for porcelain stoneware.'
      },
      {
        title: 'Substrate / Base / Screed',
        icon: 'Construction',
        content: 'The substrate must be perfectly level, fully cured, structurally sound, dry, and clean from dust, grease, or paint. Any unevenness in the base will reflect on the final surface. For large formats, the acceptable tolerance is typically less than 3mm over a 2-meter straightedge. Use self-levelling compounds if necessary before installation.'
      },
      {
        title: 'Cutting',
        icon: 'Scissors',
        content: 'Use professional-grade cutting tools designed for porcelain stoneware. For straight cuts, a high-quality manual tile cutter with a sharp scoring wheel is sufficient. For L-cuts, holes, or complex shapes, use a wet saw with a continuous rim diamond blade. Always handle cut edges carefully and use a diamond polishing pad to smooth any sharp or chipped edges.'
      },
      {
        title: 'Handling',
        icon: 'Move',
        content: 'Large format tiles require special care during handling to prevent breakage. Always carry the slabs vertically, never horizontally. For very large slabs (e.g., 1200x2400mm or larger), use professional handling equipment such as suction cup frames and carrying bars. Ensure the work area is clear of debris to prevent accidental chipping of the edges.'
      }
    ]
  });

  useEffect(() => {
    const fetchInstallationData = async () => {
      try {
        const response = await api.get('/flais-guide');
        if (response.data && response.data.success) {
          const data = response.data.flaisGuide || {};
          if (data.installationGuide) {
            setSettings({
              title: data.installationGuide.title || "Process for Flais Granito",
              subtitle: data.installationGuide.subtitle || "Installation Guide",
              heroImage: data.installationGuide.heroImage || "",
              pdfUrl: data.installationGuide.pdfUrl || "",
              steps: data.installationGuide.steps && data.installationGuide.steps.length > 0 
                ? data.installationGuide.steps 
                : settings.steps
            });
          }
        }
      } catch (err) {
              }
    };
    fetchInstallationData();
  }, []);

  const toggleItem = (index) => {
    if (openItems.includes(index)) {
      setOpenItems(openItems.filter((i) => i !== index));
    } else {
      setOpenItems([...openItems, index]);
    }
  };

  return (
    <div className="min-h-screen bg-white pt-24 font-sans">
      <SEO 
        title="Tile Installation Guide & Best Practices"
        description="Step-by-step guide for tile installation. Learn about substrate preparation, laying with Class C2TE S1/S2 adhesives, joint sizes, cutting porcelain, and levelling systems."
        keywords="tile installation guide, how to lay tiles, tile levelling system, vitrified tiles installation, tile cutting"
      />
      {/* Hero Section */}
      <section className="relative h-[35vh] sm:h-[40vh] md:h-[50vh] min-h-[280px] sm:min-h-[350px] md:min-h-[400px] flex items-center overflow-hidden mb-12 sm:mb-16 md:mb-20">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${settings.heroImage})` }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent"></div>

        <div className="relative z-10 container-custom">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl"
          >
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-display font-bold text-zinc-900 mb-2">
              {settings.title}
            </h1>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-medium text-zinc-700 mb-6 sm:mb-8 md:mb-10">
              {settings.subtitle}
            </h2>
            {settings.pdfUrl ? (
              <button
                onClick={() => {
                  let resolvedUrl = settings.pdfUrl;
                  const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').trim();
                  if (settings.pdfUrl.includes('/uploads/')) {
                    const parts = settings.pdfUrl.split('/uploads/');
                    resolvedUrl = `${backendUrl}/uploads/${parts[parts.length - 1]}`;
                  } else if (!settings.pdfUrl.startsWith('http')) {
                    resolvedUrl = `${backendUrl}${settings.pdfUrl.startsWith('/') ? '' : '/'}${settings.pdfUrl}`;
                  }
                  window.open(resolvedUrl, '_blank');
                }}
                className="inline-block bg-black hover:bg-zinc-800 text-white font-bold tracking-[0.2em] uppercase py-4 px-10 text-sm shadow-md transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer mt-6"
              >
                {settings.subtitle}
              </button>
            ) : (
              <span
                className="inline-block bg-black text-white font-bold tracking-[0.2em] uppercase py-4 px-10 text-sm mt-6"
              >
                {settings.subtitle}
              </span>
            )}
          </motion.div>
        </div>
      </section>

      {/* Accordion Grid Section */}
      <section className="container-custom pb-16 sm:pb-24 md:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-4">
          {settings.steps.map((step, index) => {
            const StepIcon = ICON_MAP[step.icon] || Ruler;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="h-fit"
              >
                <AccordionItem
                  title={step.title}
                  icon={StepIcon}
                  content={step.content}
                  isOpen={openItems.includes(index)}
                  onClick={() => toggleItem(index)}
                />
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default InstallationGuide;
