import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Target, Eye, Shield, Award, Users, Zap, ArrowRight, ChevronDown, Boxes, Layers, Component, Sparkles, Mail, Phone, Leaf, Globe, Volume2, VolumeX, Play, Pause, Droplets, Sun, Wind, Recycle, Flag, Clock, Info, Loader2 } from 'lucide-react';
import axios from 'axios';
import SEO from '../components/SEO';
import WorldMap from '../components/WorldMap';
import { getOptimizedImageUrl, getOptimizedVideoUrl } from '../utils/imageOptimizer';
const BackendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').trim();
const iconMap = { Shield, Sparkles, Layout: Layers, Layers, Flag, Clock, Globe, Info };


const About = () => {
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState('');
  const [aboutSettings, setAboutSettings] = React.useState({
    heroTitle: "GUIDED BY EXCELLENCE",
    heroSubtitle: "FLAIS GRANITO is dedicated to transforming spaces with superior craftsmanship and cutting-edge technology.",
    heroImage: "",

    narrativeTitle: "Crafting a New Benchmark",
    narrativeDesc1: "At FLAIS GRANITO, we specialize in crafting premium full body vitrified tiles, blending cutting-edge technology with artisanal craftsmanship. Our state-of-the-art facilities and innovative processes ensure tiles of the highest quality, redefining aesthetics and functionality in any space.",
    narrativeDesc2: "With a wide range of colors, textures, and sizes, we offer limitless design possibilities to architects, designers, and homeowners, transforming ordinary spaces into extraordinary environments.",
    narrativeImage: "",

    statYears: "20+",
    statDealers: "500+",
    statCountries: "45+",
    statDesigns: "1000+",

    manuTitle: "Manufacturing Excellence",
    manuDesc1: "Explore our top-notch manufacturing facility, where cutting-edge technology meets expert craftsmanship. Our state-of-the-art equipment and rigorous quality control processes ensure the highest standards in full body vitrified tile production.",
    manuDesc2: "With precision and innovation driving our operations, we transform raw materials into exceptional tiles that redefine industry standards. Our tiles stand out for their exceptional quality, innovative designs, and advanced manufacturing technology.",
    manuImage: "",

    sustainTitle: "Sustainability First",
    sustainDesc1: "At FLAIS GRANITO, sustainability isn't an afterthought — it's embedded in every step of our manufacturing process. We believe premium quality and environmental responsibility go hand in hand.",
    sustainDesc2: "From water recycling systems to solar-powered facilities, we're committed to reducing our environmental footprint while delivering world-class vitrified tiles.",
    sustainImage: "",

    filmTitle: "The Art of Modern Surfaces",
    filmDesc1: "FLAIS GRANITO tiles are more than just surfaces — they are a testament to technological innovation and architectural durability. Every tile tells the story of precision, passion, and craftsmanship.",
    filmDesc2: "Crafted with high-pressure technology and premium raw materials, our tiles offer unparalleled strength, stain resistance, and a flawless aesthetic finish that stands the test of time.",
    filmDesc3: "From intimate residential spaces to grand commercial environments, FLAIS GRANITO delivers surfaces that inspire awe — a true mark of refined luxury.",

    exportTitle: "Export Details",
    exportDesc: "FLAIS GRANITO tiles travel across continents, gracing homes and commercial spaces worldwide. Our export network spans 45+ countries with dedicated logistics ensuring on-time delivery.",
    exportStat1Value: "45+",
    exportStat1Label: "Export Countries",
    exportStat1Icon: "🌍",
    exportStat2Value: "500+",
    exportStat2Label: "International Dealers",
    exportStat2Icon: "🤝",
    exportStat3Value: "2M+",
    exportStat3Label: "Sq. Metres Exported/Yr",
    exportStat3Icon: "📦",
    exportStat4Value: "15+",
    exportStat4Label: "Years of Exports",
    exportStat4Icon: "🏆"
  });

  const [videos, setVideos] = React.useState({
    flaisFilm: "",
    exhibition: ""
  });

  const [pillars, setPillars] = React.useState([
    { id: 1, title: "Quality Excellence", desc: "Advanced technology ensures top-tier tile durability and aesthetics.", icon: <Shield /> },
    { id: 2, title: "Innovative Design", desc: "Cutting-edge designs offer endless customization and style.", icon: <Sparkles /> },
    { id: 3, title: "Manufacturing", desc: "Latest technology and craftsmanship for superior performance.", icon: <Layers /> },
  ]);

  const [countriesList, setCountriesList] = React.useState([]);
  const [isMuted, setIsMuted] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const videoRef = React.useRef(null);
  const { scrollYProgress } = useScroll();
  const scale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);

  React.useEffect(() => {
    let isMounted = true;
    const fetchAboutData = async () => {
      try {
        if (isMounted) {
          setLoading(true);
          setLoadError('');
        }
        const res = await axios.get(`${BackendUrl}/api/about`);
        if (res.data && res.data.success && res.data.about) {
          const about = res.data.about;
          try {
            if (about.aboutSettings && isMounted) {
              setAboutSettings(prev => {
                const merged = { ...prev, ...about.aboutSettings };
                if (!merged.heroImage) merged.heroImage = prev.heroImage;
                if (!merged.narrativeImage) merged.narrativeImage = prev.narrativeImage;
                if (!merged.manuImage) merged.manuImage = prev.manuImage;
                if (!merged.sustainImage) merged.sustainImage = prev.sustainImage;
                return merged;
              });
            }
          } catch (e) {
          }

          try {
            if (about.videos && isMounted) {
              setVideos(prev => {
                const merged = { ...prev, ...about.videos };
                // Only use fallback if video URL is empty or invalid
                if (!merged.flaisFilm || merged.flaisFilm.trim() === '') {
                  merged.flaisFilm = prev.flaisFilm;
                } else {
                }
                return merged;
              });
            }
          } catch (e) {
          }

          try {
            if (Array.isArray(about.pillars) && about.pillars.length > 0 && isMounted) {
              const mapped = about.pillars.map(p => {
                const IconComp = iconMap[p.icon] || Info;
                return { ...p, icon: <IconComp /> };
              });
              setPillars(mapped);
            }
          } catch (e) {
          }

          try {
            if (Array.isArray(about.exportCountries) && about.exportCountries.length > 0 && isMounted) {
              setCountriesList(about.exportCountries);
            }
          } catch (e) {
          }
        }
      } catch (err) {
        if (isMounted) {
          // Don't show error - use defaults
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchAboutData();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f5f0] px-6">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#5D4037]/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#5D4037] border-l-[#c5a880] animate-spin" />
          </div>
          <p className="text-sm font-display font-medium tracking-widest text-[#5D4037] uppercase">Loading About Page</p>
        </div>
      </div>
    );
  }

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": "About FLAIS GRANITO",
    "description": "Learn about FLAIS GRANITO's journey, our commitment to quality, eco-friendly manufacturing, and how we deliver luxury ceramic and vitrified tiles globally.",
    "publisher": {
      "@type": "Organization",
      "name": "FLAIS GRANITO",
      "logo": {
        "@type": "ImageObject",
        "url": "https://www.flaisgranito.com/favicon.svg"
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => { });
      }
    }
  };

  return (
    <div className="bg-white text-zinc-900 selection:bg-[#5D4037] selection:text-white">
      <SEO
        title="About Us"
        description="Learn about FLAIS GRANITO's journey, our commitment to quality, eco-friendly manufacturing, and how we deliver luxury ceramic and vitrified tiles globally."
        keywords="about flais granito, tile manufacturer, vitrified tiles company, tile design, premium tiles history"
        schema={aboutSchema}
      />
      {/* Immersive Cinematic Hero */}
      <section className="relative h-screen min-h-[50vh] flex items-center justify-center overflow-hidden">
        <motion.div
          style={{ scale }}
          className="absolute inset-0 z-0"
        >
          <img loading="lazy"
            src={getOptimizedImageUrl(aboutSettings.heroImage, 1200)}
            alt="FLAIS GRANITO Luxury Interior"
            className="w-full h-full object-cover"
          />
        </motion.div>

        <div className="container-custom relative z-10 text-center pt-20">
          {/* Hero text overlays removed as they are not required */}
        </div>
      </section>

      {/* Narrative Section */}
      <section className="py-14 sm:py-20 md:py-24 relative overflow-hidden bg-[#fcfaf7]">
        <div className="container-custom">
          <div className="grid lg:grid-cols-12 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="lg:col-span-5 space-y-12">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                className="space-y-6"
              >
                <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold leading-tight text-zinc-900">
                  {aboutSettings.narrativeTitle.split('\n').map((line, idx) => (
                    <React.Fragment key={idx}>
                      {idx > 0 && <br />}
                      {line}
                    </React.Fragment>
                  ))}
                </h2>
                <div className="w-20 h-1 bg-[#5D4037]" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: 0.2 }}
                className="space-y-6"
              >
                <p className="text-zinc-600 text-lg leading-relaxed font-light">
                  {aboutSettings.narrativeDesc1}
                </p>
                {aboutSettings.narrativeDesc2 && (
                  <p className="text-zinc-600 text-lg leading-relaxed font-light">
                    {aboutSettings.narrativeDesc2}
                  </p>
                )}
              </motion.div>

              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {[
                  { label: 'Years Experiences', value: aboutSettings.statYears },
                  { label: 'Happy Dealer', value: aboutSettings.statDealers },
                  { label: 'Export Country', value: aboutSettings.statCountries },
                  { label: 'Tiles Design', value: aboutSettings.statDesigns },
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 + i * 0.1 }}
                    className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl bg-white border border-[#D2C9B1] hover:border-[#5D4037]/50 transition-colors group shadow-sm"
                  >
                    <h4 className="text-2xl sm:text-3xl font-bold text-zinc-900 mb-1 sm:mb-2 group-hover:text-[#5D4037] transition-colors">{stat.value}</h4>
                    <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: 2 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1 }}
                className="relative z-10 rounded-3xl sm:rounded-[3rem] overflow-hidden shadow-2xl"
              >
                <img loading="lazy"
                  src={getOptimizedImageUrl(aboutSettings.narrativeImage, 800)}
                  alt="FLAIS Design Innovation"
                  className="w-full h-[350px] sm:h-[450px] md:h-[550px] lg:h-[650px] object-cover hover:scale-110 transition-transform duration-1000"
                />
              </motion.div>
              <div className="absolute -top-12 -right-12 w-64 h-64 bg-[#D2C9B1]/30 rounded-full blur-[100px] -z-0" />
              <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[#D2C9B1]/50 rounded-full blur-[100px] -z-0" />
            </div>
          </div>
        </div>
      </section>

      {/* Manufacturing Excellence */}
      <section className="py-14 sm:py-20 md:py-24 bg-white">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="rounded-3xl overflow-hidden shadow-2xl relative z-10"
              >
                <img loading="lazy" src={getOptimizedImageUrl(aboutSettings.manuImage, 800)} alt="Manufacturing Excellence" className="w-full h-auto object-cover" />
              </motion.div>
              <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-[#D2C9B1] rounded-2xl -z-0 hidden md:block" />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8 order-1 lg:order-2"
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-zinc-900 leading-tight">{aboutSettings.manuTitle}</h2>
              <div className="w-16 h-1 bg-[#5D4037]" />
              <div className="space-y-6">
                <p className="text-zinc-600 leading-relaxed text-lg font-light">
                  {aboutSettings.manuDesc1}
                </p>
                {aboutSettings.manuDesc2 && (
                  <p className="text-zinc-600 leading-relaxed text-lg font-light">
                    {aboutSettings.manuDesc2}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FLAIS FILM - Full Width Video + Text Below */}
      <section className="py-12 sm:py-16 lg:py-28 bg-white overflow-hidden">
        <div className="container-custom space-y-12">

          {/* Full-width Wide Video */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full rounded-2xl sm:rounded-[2rem] overflow-hidden shadow-2xl aspect-video md:aspect-[21/9] group/video cursor-pointer"
            onClick={togglePlay}
          >
            <video
              ref={videoRef}
              key={videos.flaisFilm}
              src={getOptimizedVideoUrl(videos.flaisFilm)}
              muted
              loop
              playsInline
              preload="auto"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />


            {/* Control Overlays */}
            <div
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 flex items-center gap-2 sm:gap-4 z-10"
            >
              <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] sm:tracking-[0.3em]">Flais TVC</span>
              <button
                onClick={togglePlay}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95"
                title={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Play size={16} className="sm:w-[18px] sm:h-[18px]" />}
              </button>
              <button
                onClick={toggleMute}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all active:scale-95"
                title={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? <VolumeX size={16} className="sm:w-[18px] sm:h-[18px]" /> : <Volume2 size={16} className="sm:w-[18px] sm:h-[18px]" />}
              </button>
            </div>
          </motion.div>

          {/* Text Below */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20 items-start pt-4">

            {/* Left: Heading */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <span className="text-[#5D4037] font-bold uppercase tracking-[0.3em] text-xs">Our Story in Motion</span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-zinc-900 leading-tight">
                {aboutSettings.filmTitle.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
              </h2>
              <div className="w-16 h-1 bg-[#5D4037]" />
              <p className="text-zinc-600 text-lg leading-relaxed font-light">
                {aboutSettings.filmDesc1}
              </p>
            </motion.div>

            {/* Right: More Text + Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="space-y-5">
                <p className="text-zinc-600 text-lg leading-relaxed font-light">
                  {aboutSettings.filmDesc2}
                </p>
                {aboutSettings.filmDesc3 && (
                  <p className="text-zinc-600 text-lg leading-relaxed font-light">
                    {aboutSettings.filmDesc3}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: aboutSettings.statYears, label: 'Years of Craft' },
                  { value: aboutSettings.statDesigns, label: 'Tile Designs' },
                  { value: aboutSettings.statCountries, label: 'Export Countries' },
                  { value: aboutSettings.statDealers, label: 'Happy Dealers' },
                ].map((stat, i) => (
                  <div key={i} className="p-4 sm:p-5 rounded-2xl bg-[#f4f1ec] border border-[#D2C9B1] hover:border-[#5D4037]/40 transition-colors group">
                    <h4 className="text-xl sm:text-2xl font-bold text-zinc-900 group-hover:text-[#5D4037] transition-colors">{stat.value}</h4>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-500 mt-1">{stat.label}</p>
                  </div>
                ))}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* The Pillars / Core Values */}
      <section className="py-14 sm:py-20 md:py-24 bg-[#f4f1ec] rounded-[2rem] sm:rounded-[3rem] lg:rounded-[5rem] xl:rounded-[10rem]">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 sm:mb-16 md:mb-24 gap-6 sm:gap-8">
            <div className="space-y-4 text-center md:text-left">
              <span className="text-[#5D4037] font-bold uppercase tracking-widest text-sm">Our Core</span>
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-display font-bold leading-none tracking-tighter text-zinc-900"> PILLARS</h2>
            </div>
            <p className="text-zinc-600 max-w-md text-center md:text-right font-light text-lg">
              We are committed to eco-friendly practices and global distribution, ensuring timely delivery worldwide while exceeding your expectations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pillars.map((pillar, i) => {
              const color = i === 1
                ? "bg-[#5D4037] text-white shadow-xl shadow-[#5D4037]/20"
                : i === 5
                  ? "bg-[#D2C9B1] text-zinc-900 border border-[#D2C9B1]"
                  : "bg-white text-zinc-900 border border-[#D2C9B1]/30";
              const gradient = i === 1
                ? "from-[#2C1810] to-[#5D4037]"
                : i === 5
                  ? "from-[#D2C9B1] to-[#A89F8A]"
                  : "from-[#5D4037] to-[#8D6E63]";

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  className={`group relative p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] overflow-hidden transition-all duration-700 hover:-translate-y-3 shadow-sm hover:shadow-xl ${color}`}
                >
                  <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 bg-gradient-to-br ${gradient}`} />
                  <div className="relative z-10 space-y-8">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${color.includes('bg-[#5D4037]')
                      ? 'bg-white/10 text-white border border-white/20'
                      : color.includes('bg-[#D2C9B1]')
                        ? 'bg-white/40 text-zinc-900'
                        : 'bg-[#f8f5f0] text-[#5D4037] border border-[#D2C9B1]/20'
                      } backdrop-blur-xl shadow-inner`}>
                      {React.cloneElement(pillar.icon, {
                        size: 32,
                        strokeWidth: 1.5,
                        className: "drop-shadow-sm"
                      })}
                    </div>
                    <div className="space-y-4">
                      <h3 className="text-2xl font-display font-bold tracking-tight">
                        {pillar.title}
                      </h3>
                      <div className={`w-10 h-0.5 rounded-full transition-all duration-500 group-hover:w-20 ${color.includes('bg-[#5D4037]') ? 'bg-white/30' : 'bg-[#5D4037]/30'}`} />
                      <p className={`text-base leading-relaxed font-light ${color.includes('bg-[#5D4037]') ? 'text-white/70' : 'text-zinc-600'}`}>
                        {pillar.desc}
                      </p>
                    </div>
                  </div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="py-14 sm:py-20 md:py-24 bg-white overflow-hidden">
        <div className="container-custom">
          {/* Section Header */}
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center mb-12 sm:mb-16 md:mb-20">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <span className="inline-block px-4 py-1.5 border border-emerald-200 rounded-full text-emerald-700 text-xs font-bold uppercase tracking-[0.3em] bg-emerald-50">
                Our Commitment
              </span>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold leading-tight text-zinc-900">
                {aboutSettings.sustainTitle}
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
              <p className="text-zinc-600 text-lg leading-relaxed font-light max-w-xl">
                {aboutSettings.sustainDesc1}
              </p>
              {aboutSettings.sustainDesc2 && (
                <p className="text-zinc-600 text-lg leading-relaxed font-light max-w-xl">
                  {aboutSettings.sustainDesc2}
                </p>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10 rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl">
                <img
                  loading="lazy"
                  src={getOptimizedImageUrl(aboutSettings.sustainImage, 800)}
                  alt="Sustainable Manufacturing at FLAIS GRANITO"
                  className="w-full h-[350px] sm:h-[400px] md:h-[500px] object-cover hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-8 sm:left-8 sm:right-8">
                  <span className="inline-flex max-w-full items-center justify-center px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-[10px] sm:text-xs font-bold uppercase tracking-[0.18em] sm:tracking-[0.3em] leading-tight text-center whitespace-nowrap">
                    Eco-Conscious Production
                  </span>
                </div>
              </div>
              <div className="absolute -top-8 -right-8 w-48 h-48 bg-emerald-100 rounded-full blur-[80px] -z-0" />
              <div className="absolute -bottom-8 -left-8 w-48 h-48 bg-teal-100 rounded-full blur-[80px] -z-0" />
            </motion.div>
          </div>

          {/* Sustainability Pillars */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Droplets />,
                title: "Water Recycling",
                desc: "Advanced water treatment systems recycle up to 95% of water used in our tile manufacturing process.",
                accent: "from-blue-500 to-cyan-400",
                bg: "bg-blue-50",
                iconBg: "bg-blue-100 text-blue-600",
                border: "border-blue-100 hover:border-blue-300"
              },
              {
                icon: <Sun />,
                title: "Solar Energy",
                desc: "Our facility harnesses solar power to reduce carbon emissions and dependency on non-renewable energy sources.",
                accent: "from-amber-500 to-orange-400",
                bg: "bg-amber-50",
                iconBg: "bg-amber-100 text-amber-600",
                border: "border-amber-100 hover:border-amber-300"
              },
              {
                icon: <Wind />,
                title: "Low Emissions",
                desc: "State-of-the-art filtration and emission control systems ensure minimal impact on air quality and the environment.",
                accent: "from-emerald-500 to-green-400",
                bg: "bg-emerald-50",
                iconBg: "bg-emerald-100 text-emerald-600",
                border: "border-emerald-100 hover:border-emerald-300"
              },
              {
                icon: <Recycle />,
                title: "Recycled Materials",
                desc: "We incorporate recycled raw materials into our production cycle, minimizing waste and promoting a circular economy.",
                accent: "from-teal-500 to-cyan-400",
                bg: "bg-teal-50",
                iconBg: "bg-teal-100 text-teal-600",
                border: "border-teal-100 hover:border-teal-300"
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                className={`group relative p-6 sm:p-8 rounded-[2rem] sm:rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-sm hover:shadow-xl bg-white border ${item.border}`}
              >
                {/* Subtle gradient glow on hover */}
                <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 bg-gradient-to-br ${item.accent}`} />

                <div className="relative z-10 space-y-6">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 ${item.iconBg} backdrop-blur-xl shadow-inner`}>
                    {React.cloneElement(item.icon, {
                      size: 28,
                      strokeWidth: 1.5,
                      className: "drop-shadow-sm"
                    })}
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-display font-bold tracking-tight text-zinc-900">
                      {item.title}
                    </h3>
                    <div className={`w-8 h-0.5 rounded-full transition-all duration-500 group-hover:w-16 bg-gradient-to-r ${item.accent}`} />
                    <p className="text-sm leading-relaxed font-light text-zinc-600">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Export Details & World Map ── */}
      <section className="py-24 bg-[#f4f1ec] overflow-hidden">
        <div className="container-custom">

          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16 space-y-4"
          >
            <span className="inline-block px-4 py-1.5 border border-[#5D4037]/30 rounded-full text-[#5D4037] text-xs font-bold uppercase tracking-[0.3em] bg-[#5D4037]/5">
              Global Presence
            </span>
            <h2 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-zinc-900 leading-none tracking-tighter">
              {aboutSettings.exportTitle || "Export Details"}
            </h2>
            <div className="w-20 h-1 bg-[#5D4037] mx-auto rounded-full" />
            <p className="text-zinc-600 text-lg leading-relaxed font-light max-w-2xl mx-auto">
              {aboutSettings.exportDesc || "FLAIS GRANITO tiles travel across continents, gracing homes and commercial spaces worldwide. Our export network spans 45+ countries with dedicated logistics ensuring on-time delivery."}
            </p>
          </motion.div>

          {/* Export Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {[
              { value: aboutSettings.exportStat1Value || "45+", label: aboutSettings.exportStat1Label || "Export Countries", icon: aboutSettings.exportStat1Icon || "🌍" },
              { value: aboutSettings.exportStat3Value || "2M+", label: aboutSettings.exportStat3Label || "Sq. Metres Exported/Yr", icon: aboutSettings.exportStat3Icon || "📦" },
              { value: aboutSettings.exportStat4Value || "15+", label: aboutSettings.exportStat4Label || "Years of Exports", icon: aboutSettings.exportStat4Icon || "🏆" },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="p-6 rounded-3xl bg-white border border-[#D2C9B1] hover:border-[#5D4037]/50 transition-all duration-300 shadow-sm hover:shadow-md group text-center"
              >
                <div className="text-3xl mb-3">{stat.icon}</div>
                <h4 className="text-3xl font-bold text-zinc-900 mb-1 group-hover:text-[#5D4037] transition-colors">{stat.value}</h4>
                <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* World Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <WorldMap countries={countriesList} />
          </motion.div>

        </div>
      </section>
    </div>
  );
};

export default About;
