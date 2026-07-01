import React from 'react';
import { motion } from 'framer-motion';
import { Globe, MapPin, Calendar, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import SEO from '../components/SEO';

const defaultExhibitions = [
  {
    id: 1,
    name: 'CERSAIE',
    location: 'Bologna, Italy',
    year: '2025',
    description: 'Showcasing our futuristic large-format slabs and bio-active surfaces to the European architecture and design community.'
  },
  {
    id: 2,
    name: 'COVERINGS',
    location: 'Atlanta, USA',
    year: '2024',
    description: 'Unveiling eco-friendly porcelain stoneware and high-durability outdoor tile collections to the North American market.'
  },
  {
    id: 3,
    name: 'ACETECH',
    location: 'Mumbai, India',
    year: '2024',
    description: 'Award-winning stall design featuring premium marble-gloss and electra series tiles for luxury residential projects.'
  },
  {
    id: 4,
    name: 'VIBRANT CERAMIC EXPO',
    location: 'Gujarat, India',
    year: '2024',
    description: 'Highlighting green manufacturing practices and large-scale industrial surface solutions for global distributors.'
  },
  {
    id: 5,
    name: 'BATIMAT',
    location: 'Paris, France',
    year: '2023',
    description: 'Presenting our high-performance facade cladding systems and thin porcelain panels to European contractors.'
  },
  {
    id: 6,
    name: 'BIG 5 SHOW',
    location: 'Dubai, UAE',
    year: '2023',
    description: 'Introducing heat-reflective outdoor slabs and heavy-duty tiles specifically engineered for the Middle Eastern climate.'
  },
  {
    id: 7,
    name: 'CEVISAMA',
    location: 'Valencia, Spain',
    year: '2023',
    description: 'Demonstrating our ultra-thin format tiles and slip-resistant grip technologies for modern European commercial developments.'
  },
  {
    id: 8,
    name: 'INDEX DUBAI',
    location: 'Dubai, UAE',
    year: '2022',
    description: 'Exhibiting high-end interior solutions, designer slabs, and custom vanity collections for luxury hospitality projects in the Gulf.'
  },
  {
    id: 9,
    name: 'KBC SHANGHAI',
    location: 'Shanghai, China',
    year: '2022',
    description: 'Unveiling our high-gloss polished series and anti-bacterial bathroom surface integrations for global designers.'
  },
  {
    id: 10,
    name: 'MOSBUILD',
    location: 'Moscow, Russia',
    year: '2022',
    description: 'Presenting frost-resistant external facades and structural heavy-duty floor slabs to architects of the region.'
  }
];

const Exhibitions = () => {
  const exhibitionVideoRef = React.useRef(null);

  const [exhibitions] = React.useState(defaultExhibitions);

  const [exhibitionVideoSrc, setExhibitionVideoSrc] = React.useState('');

  const [isMuted, setIsMuted] = React.useState(true);

  // Pagination states - set itemsPerPage to 8 (showing 8 cards in two rows of 4 on desktop)
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 8; 

  const totalPages = Math.ceil(exhibitions.length / itemsPerPage);

  const paginatedExhibitions = React.useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return exhibitions.slice(start, start + itemsPerPage);
  }, [exhibitions, currentPage, itemsPerPage]);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Smooth scroll back to top of the grid list section when moving pages
      const target = document.getElementById('exhibitions-grid-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  React.useEffect(() => {
    setExhibitionVideoSrc(new URL('../assets/FLAISVIDEO2.m4v', import.meta.url).href);
  }, []);

  React.useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const handleVideoIntersection = (entries) => {
      entries.forEach(entry => {
        const video = entry.target;
        if (entry.isIntersecting) {
        } else {
          video.pause();
        }
      });
    };

    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(handleVideoIntersection, observerOptions);
      if (exhibitionVideoRef.current) {
        observer.observe(exhibitionVideoRef.current);
      }
      return () => observer.disconnect();
    }, 300);

    return () => clearTimeout(timer);
  }, [exhibitionVideoSrc]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-32 pb-20 font-sans selection:bg-[#c5a880] selection:text-zinc-950">
      <SEO
        title="Global Exhibition Highlights | Flais Granito"
        description="Explore Flais Granito's premium presence at major global tile, architecture, and surface exhibitions such as CERSAIE, Coverings, and ACETECH."
        keywords="tile exhibition, CERSAIE Flais, coverings exhibition, tile design expo, surface design events"
      />

      {/* Hero Section */}
      <section className="relative h-[35vh] sm:h-[40vh] md:h-[45vh] min-h-[280px] sm:min-h-[320px] md:min-h-[350px] flex items-center justify-center overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] mx-2 sm:mx-4 mb-10 sm:mb-12 md:mb-16 bg-zinc-900 border border-white/5">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-[0.08] mix-blend-luminosity"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/70 to-transparent"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-[#c5a880] text-xs font-semibold mb-2">
              <Globe size={14} />
              <span className="uppercase tracking-widest text-[10px]">International Architecture Expos</span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-display font-bold text-white leading-tight">
              Exhibition Highlights
            </h1>
            <p className="text-sm md:text-base text-zinc-400 font-light leading-relaxed max-w-xl mx-auto">
              Step inside our masterfully designed spaces where craftsmanship meets futuristic technology on the world's most prestigious exhibition stages.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Global Exhibition Showcase Video */}
      <section className="pb-24 pt-8">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -45 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="space-y-3">
                <span className="text-[#c5a880] font-bold uppercase tracking-[0.3em] text-xs">Exhibition Showcase</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight text-white">
                  Where Innovation <br />
                  <span className="italic font-classic font-normal text-[#c5a880]">Meets the World</span>
                </h2>
              </div>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed font-light max-w-xl">
                FLAIS GRANITO continues to redefine architectural standards on the global stage. Our exhibition presence showcases a masterclass in surface design, where we unveil pioneering textures and sustainable solutions to industry leaders worldwide.
              </p>
              <div className="flex items-center space-x-8 pt-2">
                <div>
                  <h4 className="text-2xl font-bold text-white">Global</h4>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1">Presence</p>
                </div>
                <div className="w-px h-10 bg-zinc-800" />
                <div>
                  <h4 className="text-2xl font-bold text-white">Futuristic</h4>
                  <p className="text-zinc-500 text-[10px] uppercase tracking-widest mt-1">Focused</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="relative aspect-video rounded-[2rem] overflow-hidden shadow-2xl border border-white/5 bg-zinc-900 group"
            >
              <video
                key={exhibitionVideoSrc}
                ref={exhibitionVideoRef}
                autoPlay
                muted={isMuted}
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              >
                <source src={exhibitionVideoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              
              {/* Mute/Unmute Control Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 z-20 flex items-center justify-center p-3 rounded-full bg-zinc-950/75 hover:bg-zinc-950/90 text-white border border-white/10 hover:border-[#c5a880]/30 shadow-lg hover:scale-105 active:scale-95 transition-all duration-300"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? <VolumeX size={18} className="text-[#c5a880]" /> : <Volume2 size={18} className="text-white" />}
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Exhibition Highlights Paginated Grid - Matches the dark aesthetic of the user screenshot */}
      <section id="exhibitions-grid-section" className="container-custom pt-16 border-t border-zinc-900 scroll-mt-32">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between pb-4"
        >
          <div>
            <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">Exhibition Highlights</h3>
            <p className="text-zinc-400 text-xs md:text-sm font-light">Explore our flagship pavilions and global showcases across the years.</p>
          </div>
          {totalPages > 1 && (
            <div className="mt-4 md:mt-0 text-[10px] text-zinc-400 font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
              Page {currentPage} of {totalPages}
            </div>
          )}
        </motion.div>

        {/* Grid cards: exactly 4 columns matching the user's screenshot layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {paginatedExhibitions.map((exh, index) => (
            <motion.div
              key={exh.id}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06, duration: 0.45 }}
              className="group relative bg-zinc-900/50 border border-zinc-800/85 rounded-2xl p-6 hover:bg-zinc-900 hover:border-[#c5a880]/30 transition-all duration-300 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[#c5a880] text-[10px] font-bold uppercase tracking-wider bg-[#c5a880]/10 px-2.5 py-1 rounded-md border border-[#c5a880]/20">
                    <Calendar size={11} />
                    {exh.year}
                  </div>
                  <span className="text-zinc-600 group-hover:text-[#c5a880]/80 transition-colors duration-300">
                    <Globe size={18} />
                  </span>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-lg font-bold text-white group-hover:text-[#c5a880] transition-colors duration-300">{exh.name}</h4>
                  <div className="flex items-center gap-1.5 text-zinc-500 text-xs">
                    <MapPin size={11} className="text-[#c5a880]" />
                    {exh.location}
                  </div>
                </div>

                <p className="text-zinc-400 text-[11px] leading-relaxed font-light font-sans pt-2">
                  {exh.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-[#c5a880] transition-colors duration-300">
                <span>Premium Pavilion</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#c5a880] animate-pulse"></span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pagination buttons: Capsule styling matching user's custom design */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-16">
            <div className="inline-flex items-center bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`w-10 h-10 flex items-center justify-center border-r border-zinc-200 transition-colors duration-200 ${
                  currentPage === 1
                    ? 'text-zinc-300 bg-zinc-50/50 cursor-not-allowed'
                    : 'text-[#c5a880] hover:bg-zinc-50 active:bg-zinc-100'
                }`}
                aria-label="Previous Page"
              >
                <ChevronLeft size={16} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 flex items-center justify-center font-bold text-sm transition-colors duration-200 border-r border-zinc-200 ${
                    currentPage === page
                      ? 'bg-[#c5a880] text-white font-bold'
                      : 'text-[#c5a880] hover:bg-zinc-50 active:bg-zinc-100'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`w-10 h-10 flex items-center justify-center transition-colors duration-200 ${
                  currentPage === totalPages
                    ? 'text-zinc-300 bg-zinc-50/50 cursor-not-allowed'
                    : 'text-[#c5a880] hover:bg-zinc-50 active:bg-zinc-100'
                }`}
                aria-label="Next Page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default Exhibitions;
