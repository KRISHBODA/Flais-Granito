import React from 'react';
import { motion } from 'framer-motion';
import { Award, ShieldCheck, Globe, Leaf, Star, CheckCircle2, TrendingUp, Trophy, MapPin, Calendar, ChevronLeft, ChevronRight, Volume2, VolumeX, Play, Pause } from 'lucide-react';
import SEO from '../components/SEO';
import api from '../utils/api';
import { getOptimizedImageUrl, getOptimizedVideoUrl } from '../utils/imageOptimizer';

const certificateDocs = [];

const ICON_MAP = {
  Award,
  ShieldCheck,
  Globe,
  Leaf,
  Star,
  TrendingUp,
  Trophy
};

// Database Helper function for loading locally uploaded binary storage (exhibition video)
const loadVideoFromDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FlaisVideoDB', 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('videos')) {
        db.createObjectStore('videos');
      }
    };
    request.onsuccess = (e) => {
      const db = e.target.result;
      const transaction = db.transaction('videos', 'readonly');
      const store = transaction.objectStore('videos');
      const getRequest = store.get('exhibition_video');
      getRequest.onsuccess = () => resolve(getRequest.result);
      getRequest.onerror = (err) => reject(err);
    };
    request.onerror = (err) => reject(err);
  });
};

const defaultCertifications = [
  {
    id: 1,
    title: 'ISO 9001:2015',
    desc: 'Quality Management Systems',
    icon: ShieldCheck,
    details: 'Demonstrating our ability to consistently provide products and services that meet customer and regulatory requirements.',
  },
  {
    id: 2,
    title: 'ISO 14001:2015',
    desc: 'Environmental Management',
    icon: Leaf,
    details: 'Commitment to enhancing our environmental performance and fulfilling our compliance obligations with sustainable practices.',
  },
  {
    id: 3,
    title: 'CE Marking',
    desc: 'European Conformity',
    icon: Globe,
    details: 'Compliance with health, safety, and environmental protection standards for products sold within the European Economic Area.',
  },
  {
    id: 4,
    title: 'Green Building Council',
    desc: 'Eco-Friendly Manufacturing',
    icon: Star,
    details: 'Recognized for contributing to sustainable building practices and reducing the carbon footprint in our manufacturing processes.',
  },
];



const Certifications = () => {
  const exhibitionVideoRef = React.useRef(null);
  const [selectedDoc, setSelectedDoc] = React.useState(null);
  const [isMuted, setIsMuted] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const togglePlay = () => {
    if (exhibitionVideoRef.current) {
      if (isPlaying) {
        exhibitionVideoRef.current.pause();
      } else {
        exhibitionVideoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };
  const [loadError, setLoadError] = React.useState('');

  const [pageSettings, setPageSettings] = React.useState({
    heroTitle: "Certifications",
    heroSubtitle: "Flais Granito is a brand that believes in continuous development and growth. We always try to innovate and bring something new to reform the approach of the market, and the certificates we have achieved over the years are proof of our creativity and credibility.",
    heroMedia: "",
    introTitle: "Our Commitment to Quality",
    introDescription: "Quality is not just a standard at Flais Granito; it's our signature. Every tile that leaves our state-of-the-art manufacturing facility carries the weight of rigorous testing, meticulous craftsmanship, and an unwavering dedication to perfection. Our global certifications are a testament to our promise of delivering uncompromised excellence to homes and commercial spaces worldwide."
  });

  const isHeroVideo = React.useMemo(() => {
    const media = pageSettings.heroMedia;
    if (!media) return false;
    return /\.(mp4|webm|ogg|mov)/i.test(media) || media.includes('video') || media.includes('stream');
  }, [pageSettings.heroMedia]);

  const [exhibitions, setExhibitions] = React.useState([]);

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
      const target = document.getElementById('certifications-exhibitions-grid-section');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const [certifications, setCertifications] = React.useState(defaultCertifications.map(c => ({
      ...c,
      icon: ICON_MAP[c.icon] || ShieldCheck
  })));

  const [verificationDocs, setVerificationDocs] = React.useState(certificateDocs);

  const [awardsSettings, setAwardsSettings] = React.useState({
    badge: "Awards & Achievements",
    title: "Accolades of\nInnovation & Excellence",
    desc: "Our awards gallery is a testament to the dedication, hard work, and industry-leading standards we maintain across our manufacturing processes and design achievements. From national exporter recognitions to design excellence certificates, each milestone represents our promise of delivering premium surfaces.",
    stat1Val: "50+",
    stat1Label: "Industrial Awards",
    stat2Val: "Global",
    stat2Label: "Design Standard",
    image: ""
  });

  const [exhibitionVideoSrc, setExhibitionVideoSrc] = React.useState('');

  // Video observer hook - MUST be before any early returns
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

    // Delay observer attachment to ensure ref is mounted after motion animation
    const timer = setTimeout(() => {
      const observer = new IntersectionObserver(handleVideoIntersection, observerOptions);
      if (exhibitionVideoRef.current) {
        observer.observe(exhibitionVideoRef.current);
      }
      return () => observer.disconnect();
    }, 300);

    return () => clearTimeout(timer);
  }, [exhibitionVideoSrc]);

  // Data fetching hook
  React.useEffect(() => {
    const loadFlaisGuideData = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const response = await api.get('/flais-guide');
        if (response.data && response.data.success) {
          const data = response.data.flaisGuide || {};
          
          if (data.achievementsSettings) setPageSettings(data.achievementsSettings);
          if (data.exhibitions && data.exhibitions.length > 0) setExhibitions(data.exhibitions);
          if (data.certifications && data.certifications.length > 0) {
            setCertifications(data.certifications.map(c => ({
              ...c,
              icon: ICON_MAP[c.icon] || ShieldCheck
            })));
          }
          if (data.verificationDocs && data.verificationDocs.length > 0) setVerificationDocs(data.verificationDocs);
          if (data.awardsSettings) {
            setAwardsSettings({
              ...data.awardsSettings,
              image: data.awardsSettings.image || ""
            });
          }
          if (data.exhibitionVideo) {
            setExhibitionVideoSrc(data.exhibitionVideo);
          }
        }
      } catch (err) {
                setLoadError('Failed to load Certifications page content.');
      } finally {
        setLoading(false);
      }
    };
    loadFlaisGuideData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f5f0] px-6">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#5D4037]/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#5D4037] border-l-[#c5a880] animate-spin" />
          </div>
          <p className="text-sm font-display font-medium tracking-widest text-[#5D4037] uppercase">Loading Certifications</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-zinc-600 px-6">
        <div className="max-w-md text-center space-y-3 rounded-3xl border border-zinc-200 bg-white p-8">
          <p className="text-lg font-bold text-zinc-900">Certifications page unavailable</p>
          <p className="text-sm text-zinc-600">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 font-sans">
      <SEO
        title="Our Quality Certifications"
        description="FLAIS GRANITO is ISO certified and complies with international quality standards. Read about our ISO 9001, ISO 14001, CE markings, GBC awards, and global quality standards."
        keywords="ISO certified tile manufacturer, tile quality standards, green tiles certification, CE marking, Flais Granito awards"
      />
      {/* Global Exhibition Showcase */}
      <section className="py-12 sm:py-16 md:py-24 bg-zinc-950 text-white overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] mx-2 sm:mx-4 mb-10 sm:mb-16 md:mb-20 shadow-xl border border-white/5">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-14 md:gap-20 items-center mb-10 sm:mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <span className="text-[#D2C9B1] font-bold uppercase tracking-[0.3em] text-xs">Exhibition Showcase</span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-display font-bold leading-tight text-white">
                  Where Innovation <br />
                  <span className="italic font-classic font-normal text-[#D2C9B1]">Meets the World</span>
                </h2>
              </div>
              <p className="text-zinc-400 text-lg leading-relaxed font-light max-w-xl">
                FLAIS GRANITO continues to redefine architectural standards on the global stage. Our exhibition presence showcases a masterclass in surface design, where we unveil pioneering textures and sustainable solutions to industry leaders worldwide.
              </p>
              <div className="flex items-center space-x-8 pt-4">
                <div>
                  <h4 className="text-3xl font-bold text-white">Global</h4>
                  <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Presence</p>
                </div>
                <div className="w-px h-12 bg-zinc-800" />
                <div>
                  <h4 className="text-3xl font-bold text-white">Futuristic</h4>
                  <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">Focused</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              onClick={togglePlay}
              className="relative aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/5 group/video cursor-pointer"
            >
              <video
                key={exhibitionVideoSrc}
                ref={exhibitionVideoRef}
                muted={isMuted}
                loop
                playsInline
                preload="auto"
                className="w-full h-full object-cover"
              >
                <source src={getOptimizedVideoUrl(exhibitionVideoSrc)} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              

              {/* Control Overlays */}
              <div 
                onClick={(e) => e.stopPropagation()} 
                className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-2 sm:gap-4 z-10"
              >
                <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em]">Exhibition</span>
                <button
                  onClick={togglePlay}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Play size={16} className="sm:w-[18px] sm:h-[18px]" />}
                </button>
                <button
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Volume2 size={16} className="sm:w-[18px] sm:h-[18px]" />}
                </button>
              </div>
            </motion.div>
          </div>

          {/* Exhibition Highlights */}
          {exhibitions.length > 0 && (
            <div id="certifications-exhibitions-grid-section" className="pt-16 border-t border-zinc-900 scroll-mt-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between pb-4"
              >
                <div>
                  <h3 className="text-2xl md:text-3xl font-display font-bold text-white mb-2">Exhibition Highlights</h3>
                  <p className="text-zinc-400 text-sm md:text-base font-light">Explore our flagship pavilions and global showcases across the years.</p>
                </div>
                {totalPages > 1 && (
                  <div className="mt-4 md:mt-0 text-[10px] text-zinc-400 font-bold uppercase tracking-wider bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-lg">
                    Page {currentPage} of {totalPages}
                  </div>
                )}
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginatedExhibitions.map((exh, index) => (
                  <motion.div
                    key={exh.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.06, duration: 0.45 }}
                    className="group relative bg-zinc-900/50 border border-zinc-800/85 rounded-2xl p-6 hover:bg-zinc-900 hover:border-[#c5a880]/30 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-[#c5a880] text-xs font-bold uppercase tracking-wider bg-[#c5a880]/10 px-2.5 py-1 rounded-md border border-[#c5a880]/20">
                          <Calendar size={12} />
                          {exh.year}
                        </div>
                        <span className="text-zinc-600 group-hover:text-[#c5a880]/80 transition-colors">
                          <Globe size={18} />
                        </span>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-xl font-bold text-white group-hover:text-[#c5a880] transition-colors">{exh.name}</h4>
                        <div className="flex items-center gap-1 text-zinc-300 text-xs">
                          <MapPin size={12} className="text-[#c5a880]" />
                          {exh.location}
                        </div>
                      </div>

                      <p className="text-zinc-400 text-xs leading-relaxed font-light font-sans pt-2">
                        {exh.description}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-500 group-hover:text-[#c5a880] transition-colors">
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
            </div>
          )}
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative h-[40vh] sm:h-[50vh] md:h-[60vh] min-h-[300px] sm:min-h-[400px] md:min-h-[500px] flex items-center justify-center overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] md:rounded-[3rem] mx-2 sm:mx-4 mb-10 sm:mb-16 md:mb-20 bg-[#f8f5f0]">
        <div className="absolute inset-0 z-0">
          {isHeroVideo ? (
            <video
              autoPlay
              muted
              playsInline
              loop
              className="w-full h-full object-cover opacity-80"
              key={pageSettings.heroMedia}
            >
              <source src={getOptimizedVideoUrl(pageSettings.heroMedia)} type="video/mp4" />
            </video>
          ) : (
            <img
              src={getOptimizedImageUrl(pageSettings.heroMedia) || ''}
              alt={pageSettings.heroTitle}
              className="w-full h-full object-cover opacity-80"
            />
          )}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#f8f5f0] via-[#f8f5f0]/80 to-transparent"></div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-[#5D4037]/20 text-[#5D4037] text-sm font-semibold mb-6">
              <ShieldCheck size={16} />
              <span>Global Standards of Excellence</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold text-zinc-900 mb-4 sm:mb-6 uppercase tracking-wider">
              {pageSettings.heroTitle}
            </h1>
            <p className="text-xl text-zinc-600 font-light leading-relaxed">
              {pageSettings.heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Intro Text Section */}
      <section className="container-custom mb-12 sm:mb-16 md:mb-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-display font-bold text-zinc-900"
          >
            {pageSettings.introTitle}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-zinc-600 leading-relaxed"
          >
            {pageSettings.introDescription}
          </motion.p>
        </div>
      </section>

      {/* Certifications Grid */}
      <section className="container-custom mb-16 sm:mb-24 md:mb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-zinc-900">Global <span className="text-[#5D4037]">Certifications</span></h2>
          <div className="hidden md:block h-px flex-1 bg-zinc-200 ml-8"></div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {certifications.map((cert, index) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group flex flex-col h-full bg-white rounded-3xl p-8 shadow-xl shadow-zinc-200/40 border border-zinc-100 hover:border-[#5D4037]/30 transition-all duration-300 hover:-translate-y-2 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#5D4037]/5 to-transparent rounded-bl-full -z-10 group-hover:scale-150 transition-transform duration-500"></div>

              <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#5D4037] group-hover:text-white transition-colors duration-300">
                <cert.icon size={32} className="text-[#5D4037] group-hover:text-white transition-colors" />
              </div>

              <h3 className="text-2xl font-bold text-zinc-900 mb-2">{cert.title}</h3>
              <p className="text-sm font-semibold text-[#5D4037] mb-4 uppercase tracking-wider">{cert.desc}</p>
              <p className="text-zinc-600 leading-relaxed text-sm mb-8">
                {cert.details}
              </p>

              <div className="mt-auto pt-6 border-t border-zinc-100 flex items-center text-sm font-medium text-zinc-900">
                <CheckCircle2 size={18} className="text-green-500 mr-2" />
                Verified & Active
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Certification Documents Section */}
      <section className="container-custom pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex items-center justify-between mb-12"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-zinc-900">Verification <span className="text-[#5D4037]">Certificates</span></h2>
          <div className="hidden md:block h-px flex-1 bg-zinc-200 ml-8"></div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {verificationDocs.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group cursor-pointer bg-white rounded-2xl p-4 shadow-md border border-zinc-100 hover:border-[#5D4037]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
              onClick={() => setSelectedDoc(doc)}
            >
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-zinc-50 border border-zinc-100 mb-4 relative flex items-center justify-center p-2">
                <img loading="lazy" src={getOptimizedImageUrl(doc.image, 600)} alt={doc.title} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-black/5 opacity-100 group-hover:bg-black/0 transition-colors duration-300" />
              </div>
              <h4 className="text-xs md:text-sm font-bold text-zinc-900 text-center line-clamp-2 mt-auto">{doc.title}</h4>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Awards & Recognition Section */}
      <section className="container-custom pb-16 sm:pb-20 md:pb-28 border-t border-zinc-200/80 pt-12 sm:pt-16 md:pt-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <span className="text-[#5D4037] font-bold uppercase tracking-[0.25em] text-xs px-3 py-1 rounded-full bg-[#5D4037]/5 w-fit inline-block">
                {awardsSettings.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold leading-tight text-zinc-900">
                {awardsSettings.title.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
              </h2>
            </div>
            <p className="text-zinc-600 text-lg leading-relaxed font-light">
              {awardsSettings.desc}
            </p>
            <div className="flex items-center space-x-8 pt-4">
              <div>
                <h4 className="text-3xl font-bold text-zinc-950">{awardsSettings.stat1Val}</h4>
                <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">{awardsSettings.stat1Label}</p>
              </div>
              <div className="w-px h-12 bg-zinc-200" />
              <div>
                <h4 className="text-3xl font-bold text-zinc-950">{awardsSettings.stat2Val}</h4>
                <p className="text-zinc-500 text-xs uppercase tracking-widest mt-1">{awardsSettings.stat2Label}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group cursor-pointer aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border border-zinc-200/50 bg-white p-4"
            onClick={() => setSelectedDoc({
              title: awardsSettings.title.replace('\n', ' '),
              image: awardsSettings.image,
              desc: awardsSettings.desc
            })}
          >
            <div className="w-full h-full rounded-[2rem] overflow-hidden relative">
              <img loading="lazy" src={getOptimizedImageUrl(awardsSettings.image, 800)} alt="Awards Showcase" className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700" />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
              {/* Zoom Overlay indicator on hover */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/20 transition-opacity duration-300 text-white font-bold uppercase tracking-wider text-xs">
                Click to View Gallery
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Lightbox / Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in" onClick={() => setSelectedDoc(null)}>
          <div className="relative max-w-4xl w-full max-h-[90vh] bg-white rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 overflow-y-auto" onClick={e => e.stopPropagation()}>
            <button 
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 text-2xl transition-colors cursor-pointer"
              onClick={() => setSelectedDoc(null)}
            >
              &times;
            </button>
            <div className="flex-1 aspect-[3/4] max-h-[70vh] bg-zinc-50 rounded-2xl overflow-hidden border border-zinc-100 flex items-center justify-center p-2">
              <img src={getOptimizedImageUrl(selectedDoc.image, 1200)} alt={selectedDoc.title} className="max-w-full max-h-full object-contain" />
            </div>
            <div className="md:w-80 flex flex-col justify-center space-y-4">
              <span className="text-[#5D4037] text-xs font-bold uppercase tracking-wider bg-[#5D4037]/5 px-3 py-1 rounded-full w-fit">
                Official Certification
              </span>
              <h3 className="text-2xl font-bold text-zinc-900 leading-tight">{selectedDoc.title}</h3>
              <p className="text-sm text-zinc-600 leading-relaxed font-light">{selectedDoc.desc}</p>
              <div className="pt-4 border-t border-zinc-100">
                <p className="text-xs text-zinc-400">Registered Entity:</p>
                <p className="text-sm font-semibold text-zinc-700">KEVAL GRANITO LLP</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Certifications;
