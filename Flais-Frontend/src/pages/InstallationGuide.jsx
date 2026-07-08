import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Move, Scissors, Layers, Grid, Construction, Ruler, FileText } from 'lucide-react';
import SEO from '../components/SEO';
import api from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';
import installationHero from '../assets/catalog_header.jpg';

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
  const [openItems, setOpenItems] = useState([]);
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
        title: 'Cutting',
        icon: 'Scissors',
        content: 'For straight cuts, use a professional manual rail cutter designed for thin slabs. For complex or curved cuts, L-shaped cutouts, or internal corners, use a wet diamond saw or dry angle grinder with a continuous rim diamond blade. Smooth all cut edges with a diamond sanding pad to avoid micro-cracks.'
      },
      {
        title: 'Laying With Adhesives (Class C2TE S1/S2)',
        icon: 'Layers',
        content: 'Always use a high-performance cementitious adhesive classified as C2TE S1 or S2 (highly deformable). Apply the adhesive using the double-coating (back-buttering) method: use a 10-15mm slanted-notch trowel on the substrate (floor/wall) and a 3-4mm flat trowel on the back of the porcelain slab. Ensure the adhesive ribs run parallel to prevent air pockets.'
      },
      {
        title: 'Joint Size',
        icon: 'Grid',
        content: 'Never butt-joint porcelain slabs. A minimum grout joint of 2mm is required for indoor floor and wall applications, and 3mm or more for outdoor installations or areas subjected to high thermal expansion. Use high-performance, polymer-modified cementitious or epoxy grouts.'
      },
      {
        title: 'Substrate / Base / Screed',
        icon: 'Construction',
        content: 'The substrate must be perfectly flat (deviation < 2mm over a 2m straight edge), clean, dry, stable, and completely cured. Level any uneven areas with a self-levelling compound prior to installation. Any residual moisture or dust will compromise the adhesive bond.'
      },
      {
        title: 'Move & Handle with Care',
        icon: 'Move',
        content: 'Thin porcelain slabs are flexible and fragile before installation. Always handle them using a suction cup frame system with structural reinforcing bars. Do not bend or twist the slabs, and always lift them vertically. Protect the corners and edges from direct impacts at all times.'
      }
    ],
    pdfUrl: ""
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    const fetchGuideData = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const res = await api.get('/flais-guide');
        if (res.data && res.data.success && res.data.flaisGuide && res.data.flaisGuide.installationGuide) {
          const data = res.data.flaisGuide.installationGuide;
          setSettings({
            title: data.title || "Process for Flais Granito",
            subtitle: data.subtitle || "Installation Guide",
            heroImage: data.heroImage || "",
            steps: Array.isArray(data.steps) && data.steps.length > 0 ? data.steps : settings.steps,
            pdfUrl: data.pdfUrl || ""
          });
        }
      } catch (err) {
        setLoadError('Failed to load installation guide data.');
      } finally {
        setLoading(false);
      }
    };
    fetchGuideData();
  }, []);

  const toggleItem = (index) => {
    if (openItems.includes(index)) {
      setOpenItems(openItems.filter((i) => i !== index));
    } else {
      setOpenItems([...openItems, index]);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      <SEO 
        title="Tile Installation Guide & Best Practices"
        description="Step-by-step guide for tile installation. Learn about substrate preparation, laying with Class C2TE S1/S2 adhesives, joint sizes, cutting porcelain, and levelling systems."
        keywords="tile installation guide, how to lay tiles, tile levelling system, vitrified tiles installation, tile cutting"
      />
      <section className="relative h-[40vh] sm:h-[50vh] md:h-[50vh] min-h-[340px] sm:min-h-[380px] md:min-h-[420px] flex items-center overflow-hidden mb-12 sm:mb-16 md:mb-20">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${settings.heroImage ? getOptimizedImageUrl(settings.heroImage) : installationHero})` }}></div>

        <div className="relative z-10 container-custom pt-24 sm:pt-28 md:pt-32">
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
                  window.open(getOptimizedImageUrl(settings.pdfUrl), '_blank');
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
