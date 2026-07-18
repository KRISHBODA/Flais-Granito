import React, { useState, useMemo, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import ScrollReveal from '../components/ScrollReveal';
import { Shield, Award, Sparkles, ArrowRight, Leaf, Sprout, Film } from 'lucide-react';
import { /* categories, products, testimonials, blogPosts */ } from '../data/mockData';
// sustainability image not used; keep import commented for future use
// import sustainabilityImg from '../assets/michael-fortsch-bIm9salXn-g-unsplash.jpg.jpeg';
import { SoronaSymbol } from '../components/SeriesLogos';
import api from '../utils/api';
import useIntersectionVideoRef from '../hooks/useIntersectionVideoRef';
import { Loader2 } from 'lucide-react';
import { getOptimizedImageUrl, getOptimizedVideoUrl } from '../utils/imageOptimizer';

// Images removed as they are now in main.jsx

const initialHomeTexts = {
  innovationTitle: "Leading the Way in Tile Innovation",
  innovationDesc: "FLAIS GRANITO has been a trusted name in the industry for over two decades. We source only the finest materials from around the globe to ensure our customers receive products that are not only beautiful but also built to last.",
  innovationExp: "20+",
  innovationDesigns: "500+",
  innovationImage: "",
  collectionsDesc1: "Be inspired by FLAIS's new collections, designed to interpret contemporary styles and meet the needs of design projects.",
  collectionsDesc2: "Surfaces for floors, wall coverings, countertops, and furnishings that combine aesthetics, performance, and versatility for architecture and interior design.",
  collectionsImage: "",
  collectionsVideo: "",
  categoriesTitle: "Find Tiles By Category",
  categoriesDesc: "Discover our curated selection of premium tiles for every application.",
  collectionsTitle: "Make Your Choice",
  marqueeTitle: "Discover Endless Inspiration",
  sustainabilityTitle: "Our Commitment to Sustainability",
  sustainabilityDesc: "We have been producing porcelain surfaces for over 60 years with passion, innovation, and a focus on sustainability. Our processes are designed to minimize environmental impact while maximizing quality and durability.",
  sustainabilityImage: "",
  blogTitle: "New Day\nNew Inspiration"
};

const Home = () => {
  const { data: homeRes, isLoading: isHomeLoading, isError: isHomeError } = useQuery({
    queryKey: ['home'],
    queryFn: async () => {
      const res = await api.get('/home');
      return res.data?.home || {};
    }
  });

  const { data: blogsRes, isLoading: isBlogsLoading, isError: isBlogsError } = useQuery({
    queryKey: ['blogs'],
    queryFn: async () => {
      const res = await api.get('/blogs');
      return res.data?.blogs || [];
    }
  });

  const { data: heroRes, isLoading: isHeroLoading, isError: isHeroError } = useQuery({
    queryKey: ['hero'],
    queryFn: async () => {
      const res = await api.get('/hero');
      return res.data?.slides || [];
    }
  });

  const { data: logosRes, isLoading: isLogosLoading } = useQuery({
    queryKey: ['series-logos'],
    queryFn: async () => {
      const res = await api.get('/series-logos');
      return res.data?.logos || [];
    }
  });

  const loading = isHomeLoading || isBlogsLoading || isHeroLoading || isLogosLoading;
  const loadError = (isHomeError && isBlogsError && isHeroError)
    ? 'Failed to load Home page content. Please check your connection and refresh.'
    : '';

  const choicesList = useMemo(() => homeRes?.choices || [], [homeRes]);
  const sizesList = useMemo(() => homeRes?.sizes || [], [homeRes]);
  const categoriesList = useMemo(() => homeRes?.categories || [], [homeRes]);
  const flaisFilm = useMemo(() => homeRes?.video?.url || '', [homeRes]);

  const homeTexts = useMemo(() => ({
    ...initialHomeTexts,
    ...homeRes?.homeTexts
  }), [homeRes]);

  const blogs = useMemo(() => (blogsRes || []).slice(0, 3), [blogsRes]);
  const heroSlides = useMemo(() => heroRes || [], [heroRes]);
  const dynamicLogos = useMemo(() => logosRes || [], [logosRes]);
  const collectionSlides = useMemo(() => {
    const seen = new Set();
    const list = (choicesList || []).filter((item) => {
      const key = item?._id || item?.id || item?.name;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // Duplicate slides if list size is small (< 8) to ensure Swiper loop mode works perfectly with slidesPerView: 'auto'
    if (list.length > 1 && list.length < 8) {
      return [...list, ...list];
    }
    return list;
  }, [choicesList]);
  const initialCollectionSlide = collectionSlides.length > 0
    ? Math.min(Math.floor(collectionSlides.length / 2), collectionSlides.length - 1)
    : 0;


  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": "FLAIS GRANITO",
    "image": "https://www.flaisgranito.com/its_different.jpg",
    "url": "https://www.flaisgranito.com",
    "telephone": "+919586733300",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "8-A National Highway",
      "addressLocality": "Morbi",
      "addressRegion": "Gujarat",
      "postalCode": "363642",
      "addressCountry": "IN"
    }
  };

  const [collectionsSwiper, setCollectionsSwiper] = useState(null);
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [videoLoading, setVideoLoading] = useState(true);
  const [videoHasPlayed, setVideoHasPlayed] = useState(false);
  const [collectionsVideoLoading, setCollectionsVideoLoading] = useState(true);
  const [collectionsVideoHasPlayed, setCollectionsVideoHasPlayed] = useState(false);
  const [collectionsImageErrors, setCollectionsImageErrors] = useState({});
  const videoRef = useIntersectionVideoRef();
  const collectionsVideoRef = useIntersectionVideoRef();
  const handleCollectionsSwiper = (swiper) => {
    setCollectionsSwiper(swiper);
  };

  const handleCollectionsImageError = (key) => {
    setCollectionsImageErrors(prev => ({ ...prev, [key]: true }));
  };

  useLayoutEffect(() => {
    if (!collectionsSwiper || collectionSlides.length <= 1) return;

    try {
      collectionsSwiper.update();
      if (typeof collectionsSwiper.slideToLoop === 'function') {
        collectionsSwiper.slideToLoop(initialCollectionSlide, 0, false);
      }
      if (typeof collectionsSwiper.updateSlidesClasses === 'function') {
        collectionsSwiper.updateSlidesClasses();
      }
    } catch (err) {
      console.warn('Error updating collections swiper:', err);
    }
  }, [collectionsSwiper, collectionSlides.length, initialCollectionSlide]);

  const handleCollectionsPrev = () => {
    if (!collectionsSwiper || collectionSlides.length <= 1) return;
    collectionsSwiper.slidePrev();
  };

  const handleCollectionsNext = () => {
    if (!collectionsSwiper || collectionSlides.length <= 1) return;
    collectionsSwiper.slideNext();
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0] text-zinc-600 px-6">
        <div className="text-center space-y-3">
          <Loader2 className="mx-auto animate-spin text-beige-700" size={36} />
          <p className="text-sm font-semibold">Loading Home page...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f8f5f0] text-zinc-600 px-6">
        <div className="max-w-md text-center space-y-3 rounded-3xl border border-zinc-200 bg-zinc-50 p-8">
          <p className="text-lg font-bold text-zinc-900">Home page unavailable</p>
          <p className="text-sm text-zinc-600">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-page">
      <SEO
        title="Premium Tiles for Modern Living"
        description="Discover FLAIS GRANITO's exquisite collection of premium floor, wall, kitchen, and bathroom tiles. High-quality designs for modern homes and commercial spaces."
        schema={homeSchema}
      />

      {/* ── Full-Screen Brand Film ── */}
      <section className="relative w-full aspect-video md:aspect-auto md:h-[100dvh] overflow-hidden bg-black">
        {flaisFilm ? (
          <>
            {videoLoading && !videoHasPlayed && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black z-10">
                <Loader2 className="animate-spin text-beige-600 mb-4" size={40} />
                <span className="text-white/60 text-xs sm:text-sm font-medium tracking-[0.15em] uppercase">Loading brand film...</span>
              </div>
            )}
            <video
              ref={videoRef}
              key={flaisFilm}
              src={getOptimizedVideoUrl(flaisFilm)}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onLoadStart={() => setVideoLoading(true)}
              onWaiting={() => setVideoLoading(true)}
              onPlaying={() => {
                setVideoLoading(false);
                setVideoHasPlayed(true);
              }}
              onCanPlay={(e) => {
                e.currentTarget.play().catch(() => { });
              }}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                display: 'block',
              }}
            />
          </>
        ) : null}

        {!flaisFilm && (
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <div className="max-w-md rounded-3xl border border-white/15 bg-black/45 backdrop-blur-md px-6 py-8 text-white">
              <Film className="mx-auto mb-3 opacity-60" size={34} />
              <p className="text-lg font-semibold">Brand film not uploaded yet</p>
              <p className="mt-2 text-sm text-white/70">The admin can add it from Home Management.</p>
            </div>
          </div>
        )}

        {/* Subtle dark overlay for legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.55) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Mute / Unmute Toggle Button */}
        <button
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          className="absolute bottom-4 right-4 sm:bottom-10 sm:right-8 z-20 flex items-center gap-2 bg-black/45 hover:bg-black/65 backdrop-blur-md border border-white/25 rounded-full px-3 py-2 sm:px-4 sm:py-2 text-[10px] sm:text-xs font-semibold tracking-wider uppercase text-white cursor-pointer transition-all duration-200"
        >
          {isMuted ? (
            /* Speaker with X (muted) */
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            /* Speaker with waves (unmuted) */
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
          <span>{isMuted ? 'Unmute' : 'Mute'}</span>
        </button>

        {/* Scroll-down indicator */}
        <div className="hidden md:flex absolute bottom-10 left-1/2 -translate-x-1/2 flex-col items-center gap-1.5 text-white/75 text-xs tracking-widest uppercase font-medium z-10">
          <span>Scroll</span>
          <svg
            className="animate-bounce"
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </section>

      {/* ── Hero Slider (visible after scrolling) ── */}
      <section className="relative w-full aspect-[4/3] md:aspect-auto md:h-[100dvh] overflow-hidden bg-black">
        {heroSlides.length > 0 ? (
          <Swiper
            key={heroSlides.length}
            modules={[Autoplay, Navigation]}
            loop={true}
            speed={1500}
            autoplay={{ delay: 6000, disableOnInteraction: false }}




            navigation={{
              nextEl: '.swiper-button-next-custom',
              prevEl: '.swiper-button-prev-custom',
            }}
            onSlideChange={(swiper) => setActiveHeroIndex(swiper.realIndex)}
            className="h-full w-full relative group transform-gpu"
          >
            {heroSlides.map((slide, index) => {
              const isActive = activeHeroIndex === index;
              return (
                <SwiperSlide key={index} className="overflow-hidden">
                  <div className="relative h-full w-full overflow-hidden perspective-1000">
                    <img
                      src={getOptimizedImageUrl(slide.image, 1920)}
                      alt={slide.title}
                      className={`absolute inset-0 w-full h-full object-cover transition-transform duration-[7000ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${isActive ? 'scale-112' : 'scale-100'
                        }`}
                      loading="lazy"
                    />

                    {slide.title && (
                      <div className="absolute inset-0 flex items-end pb-12 sm:pb-24 md:pb-36">
                        <div className="container-custom w-full px-4 sm:px-0">
                          <div className="max-w-4xl">
                            <div className="space-y-1">
                              {slide.title.split('\n').map((line, lineIndex) => (
                                <div key={lineIndex} className="overflow-hidden">
                                  <h1
                                    className={`text-lg sm:text-3xl md:text-5xl lg:text-[4rem] font-display font-bold leading-[1.15] text-white transition-all duration-[800ms] delay-[400ms] transform-gpu ${isActive ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
                                      }`}
                                  >
                                    {line}
                                  </h1>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    <button className="hidden md:flex swiper-button-prev-custom absolute left-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                    </button>
                    <button className="hidden md:flex swiper-button-next-custom absolute right-6 top-1/2 -translate-y-1/2 z-20 w-11 h-11 bg-white/10 hover:bg-white/25 backdrop-blur-sm rounded-full items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </button>
                  </div>
                </SwiperSlide>
              );
            })}


          </Swiper>
        ) : null}

        {heroSlides.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-center px-6">
            <div className="max-w-md rounded-3xl border border-white/15 bg-black/45 backdrop-blur-md px-6 py-8 text-white">
              <Sparkles className="mx-auto mb-3 opacity-60" size={34} />
              <p className="text-lg font-semibold">No hero slides yet</p>
              <p className="mt-2 text-sm text-white/70">Add slides in the admin panel to show this section.</p>
            </div>
          </div>
        )}
      </section>

      {/* Featured Categories */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container-custom">
          <div className="text-center mb-10 md:mb-16 space-y-3">
            <h2 className="text-3xl md:text-4xl font-display font-bold">{homeTexts.categoriesTitle}</h2>
            <div className="h-1 w-20 bg-beige-600 mx-auto"></div>
            <p className="text-zinc-500 text-sm md:text-base max-w-xl mx-auto">{homeTexts.categoriesDesc}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            {categoriesList.length > 0 ? (
              categoriesList.slice(0, 3).map((cat) => (
                <Link to={`/products?cat=${cat.id}`} key={cat.id} className="group relative h-40 sm:h-64 md:h-80 rounded-2xl overflow-hidden block">
                  <img loading="lazy" src={getOptimizedImageUrl(cat.image, 600)} alt={cat.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                  <div className="absolute bottom-3 left-3 sm:bottom-6 sm:left-6 text-white">
                    <h3 className="text-xs sm:text-lg md:text-xl font-display font-bold mb-1 sm:mb-2 text-white">{cat.name}</h3>
                    <div className="flex items-center text-[10px] sm:text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Explore <ArrowRight size={12} className="ml-1 sm:ml-2" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full mx-auto max-w-2xl rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-14 text-center text-zinc-500 w-full">
                <Sparkles className="mx-auto mb-3 opacity-50 text-beige-700" size={34} />
                <p className="text-lg font-semibold text-zinc-700">No categories added yet</p>
                <p className="mt-2 text-sm text-zinc-500">Use the admin panel to add categories for this section.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Why FLAIS Section */}
      <section className="py-12 sm:py-14 md:py-16 bg-white overflow-hidden">
        <div className="container-custom grid lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
          <ScrollReveal
            variant="fade-left"
            className="relative"
          >
            {homeTexts.innovationImage ? (
              <img loading="lazy" src={getOptimizedImageUrl(homeTexts.innovationImage, 800)} alt="Why FLAIS GRANITO" className="rounded-2xl shadow-2xl relative z-10 w-full h-auto object-cover" />
            ) : (
              <div className="relative z-10 aspect-[4/3] rounded-2xl border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-center px-6 text-slate-400">
                <div>
                  <Sparkles className="mx-auto mb-3" size={34} />
                  <p className="font-semibold text-slate-500">No innovation image saved</p>
                  <p className="mt-1 text-sm">Upload one in admin to show it here.</p>
                </div>
              </div>
            )}
            <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-beige-200 rounded-2xl -z-0 hidden md:block" />
          </ScrollReveal>
          <ScrollReveal
            variant="fade-right"
            delay={200}
            className="space-y-8"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold">{homeTexts.innovationTitle}</h2>
            <p className="text-zinc-600 leading-relaxed min-h-[96px]">
              {homeTexts.innovationDesc}
            </p>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-2">
                <h4 className="text-3xl font-bold text-beige-700">{homeTexts.innovationExp}</h4>
                <p className="text-sm font-medium text-zinc-500">Years Experience</p>
              </div>
              <div className="space-y-2">
                <h4 className="text-3xl font-bold text-beige-700">{homeTexts.innovationDesigns}</h4>
                <p className="text-sm font-medium text-zinc-500">Designs Available</p>
              </div>
            </div>
            <Link to="/about" className="btn-secondary inline-flex items-center">
              Why FLAIS <ArrowRight size={18} className="ml-2" />
            </Link>
          </ScrollReveal>
        </div>
      </section>



      <section className="py-16 bg-white overflow-hidden">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 lg:gap-24 items-center">
            {/* Image (Left Column) */}
            <ScrollReveal
              variant="fade-left"
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-[4/3] lg:aspect-[4/3.5] xl:aspect-[4/3.5] overflow-hidden rounded-[2rem]">
                <img loading="lazy"
                  src={getOptimizedImageUrl(homeTexts.collectionsImage || "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80", 800)}
                  alt="Contemporary tile collections"
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                />
              </div>
            </ScrollReveal>

            {/* Text (Right Column) */}
            <ScrollReveal
              variant="fade-up"
              delay={200}
              className="space-y-8 pl-0 lg:pl-12 order-1 lg:order-2"
            >
              <div
                className="w-full rounded-2xl overflow-hidden mb-6"
                style={{ aspectRatio: '1000 / 538' }}
              >
                {homeTexts.collectionsVideo ? (
                  <div className="relative w-full h-full">
                    {collectionsVideoLoading && !collectionsVideoHasPlayed && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950 z-10">
                        <Loader2 className="animate-spin text-beige-600 mb-2" size={24} />
                      </div>
                    )}
                    <video
                      key={homeTexts.collectionsVideo}
                      ref={collectionsVideoRef}
                      src={getOptimizedVideoUrl(homeTexts.collectionsVideo)}
                      preload="auto"
                      autoPlay
                      muted
                      playsInline
                      onLoadStart={() => setCollectionsVideoLoading(true)}
                      onWaiting={() => setCollectionsVideoLoading(true)}
                      onPlaying={() => {
                        setCollectionsVideoLoading(false);
                        setCollectionsVideoHasPlayed(true);
                      }}
                      onCanPlay={(e) => {
                        e.currentTarget.play().catch(() => { });
                      }}
                      className="w-full h-full object-cover block"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-center px-6 bg-black/5 border border-dashed border-slate-300 text-slate-500">
                    <div>
                      <Film className="mx-auto mb-3 opacity-50" size={30} />
                      <p className="font-semibold">No collections video saved</p>
                      <p className="mt-1 text-sm">Add it from the admin home panel.</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-6 text-[15px] lg:text-[16px] text-zinc-600 leading-relaxed font-sans font-light min-h-[144px]">
                <p>
                  {homeTexts.collectionsDesc1}
                </p>
                <p>
                  {homeTexts.collectionsDesc2}
                </p>
              </div>
              <div className="pt-2">
                <Link to="/products" className="inline-flex items-center px-8 py-3.5 border border-zinc-300 rounded-full text-[15px] font-medium text-zinc-900 hover:bg-zinc-50 hover:border-zinc-400 transition-all">
                  Learn more <ArrowRight size={18} className="ml-3 text-zinc-600" />
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Explore The New Collections */}
      {collectionSlides.length > 0 && (
        <section className="py-12 sm:py-16 md:py-24 bg-white overflow-hidden">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-sans font-medium text-zinc-900 tracking-tight">
                {homeTexts.collectionsTitle || "Make Your Choice"}
              </h2>
            </div>

            <div className="relative group/nav w-full overflow-hidden">
              <Swiper
                key={`collections-swiper-${collectionSlides.length}-${collectionSlides.map(c => c._id || c.id || c.name).join('-')}`}
                onSwiper={handleCollectionsSwiper}
                modules={[Autoplay]}
                initialSlide={initialCollectionSlide}
                spaceBetween={28}
                slidesPerView={1}
                centeredSlides={false}
                loop={true}
                loopPreventsSliding={false}
                speed={700}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                  waitForTransition: true,
                }}
                watchSlidesProgress={true}
                grabCursor={true}
                observer={true}
                observeParents={true}
                resistanceRatio={0}
                preloadImages={true}
                breakpoints={{
                  640: { slidesPerView: 'auto', centeredSlides: true, spaceBetween: 28 },
                  1024: { slidesPerView: 'auto', centeredSlides: true, spaceBetween: 32 }
                }}
                className="collections-swiper !pb-12"
              >
                {collectionSlides.map((col, index) => (
                  <SwiperSlide key={`${col._id || col.id || col.name}-${index}`}>
                    <div className="collections-card-inner relative w-full h-full overflow-hidden group rounded-none" style={{ transform: 'translateZ(0)' }}>
                      {!collectionsImageErrors[`${col._id || col.id || col.name}-${index}`] ? (
                        <img
                          loading="eager"
                          src={getOptimizedImageUrl(col.image, 800)}
                          alt={col.name}
                          onError={() => handleCollectionsImageError(`${col._id || col.id || col.name}-${index}`)}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          style={{ backfaceVisibility: 'hidden' }}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-[#FAF8F5] flex items-center justify-center border border-zinc-200/50">
                          <span className="text-[10px] text-zinc-400 font-sans tracking-[0.25em] uppercase font-semibold">{col.name}</span>
                        </div>
                      )}

                      {/* Base overlay for inactive slide contrast */}
                      <div className="absolute inset-0 bg-black/5 transition-colors duration-500" />

                      {/* Active-only overlay and content */}
                      <div className="absolute inset-0 transition-opacity duration-500 active-only-content">
                        {/* Content Area */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          {/* Explore More Button at Bottom */}
                          <div className="absolute bottom-10 w-full flex justify-center translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                            <Link
                              to="/products"
                              className="px-10 py-3 bg-white text-zinc-900 text-[11px] font-bold uppercase tracking-[0.2em] hover:bg-zinc-100 transition-all shadow-xl rounded-full"
                            >
                              Explore Collection
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}

                {/* Navigation Arrows positioned on the active slide boundaries */}
                <div className="collections-prev-btn hidden md:block absolute top-1/2 -translate-y-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                  <button onClick={handleCollectionsPrev} className="collections-swiper-btn-prev w-8 h-12 bg-zinc-900/90 flex items-center justify-center text-white hover:bg-beige-600 transition-all duration-300 cursor-pointer disabled:opacity-35 disabled:pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                  </button>
                </div>
                <div className="collections-next-btn hidden md:block absolute top-1/2 -translate-y-1/2 translate-x-1/2 z-50 pointer-events-auto">
                  <button onClick={handleCollectionsNext} className="collections-swiper-btn-next w-8 h-12 bg-zinc-900/90 flex items-center justify-center text-white hover:bg-beige-600 transition-all duration-300 cursor-pointer disabled:opacity-35 disabled:pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                  </button>
                </div>

                {/* Mobile Arrows (Bottom Center) */}
                <div className="md:hidden absolute bottom-0 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-50 pointer-events-auto">
                  <button onClick={handleCollectionsPrev} className="collections-swiper-btn-prev w-10 h-10 rounded-full bg-zinc-900/95 flex items-center justify-center text-white hover:bg-beige-600 transition-all duration-300 cursor-pointer disabled:opacity-35 disabled:pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
                  </button>
                  <button onClick={handleCollectionsNext} className="collections-swiper-btn-next w-10 h-10 rounded-full bg-zinc-900/95 flex items-center justify-center text-white hover:bg-beige-600 transition-all duration-300 cursor-pointer disabled:opacity-35 disabled:pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                  </button>
                </div>
              </Swiper>
            </div>
          </div>
        </section>
      )}

      {/* Discover Endless Inspiration Marquee */}
      <section className="py-10 sm:py-12 md:py-16 bg-white overflow-hidden">
        <div className="container-custom text-center mb-12">
          <ScrollReveal variant="fade-up">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-medium text-zinc-800">
              {homeTexts.marqueeTitle}
            </h2>
          </ScrollReveal>
          <div className="h-1 w-20 bg-beige-600 mx-auto mt-6"></div>
        </div>

        {(() => {
          const logos = dynamicLogos.map((logo) => ({
            image: getOptimizedImageUrl(logo.image),
            name: logo.name,
          }));

          if (logos.length === 0) return null;

          // Ensure we have at least 20 logos in the list to span the screen and loop seamlessly
          const minItems = 20;
          const repetitions = Math.ceil(minItems / logos.length);
          const baseList = [];
          for (let i = 0; i < repetitions; i++) {
            baseList.push(...logos);
          }

          const top = baseList;
          const bottom = [...baseList].reverse();

          return (
            <div className="space-y-8">
              {/* TOP ROW: Moves Left */}
              <div className="marquee">
                <div className="marquee-track">
                  <div className="marquee-group">
                    {top.map((logo, index) => (
                      <div key={`top-a-${index}`} className="marquee-item">
                        <img
                          src={logo.image}
                          alt={logo.name}
                          loading="eager"
                          decoding="async"
                          draggable={false}
                          className="marquee-logo"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="marquee-group" aria-hidden="true">
                    {top.map((logo, index) => (
                      <div key={`top-b-${index}`} className="marquee-item">
                        <img
                          src={logo.image}
                          alt=""
                          loading="eager"
                          decoding="async"
                          draggable={false}
                          className="marquee-logo"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* BOTTOM ROW: Moves Right */}
              <div className="marquee">
                <div className="marquee-track marquee-track-reverse">
                  <div className="marquee-group">
                    {bottom.map((logo, index) => (
                      <div key={`bottom-a-${index}`} className="marquee-item">
                        <img
                          src={logo.image}
                          alt={logo.name}
                          loading="eager"
                          decoding="async"
                          draggable={false}
                          className="marquee-logo"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="marquee-group" aria-hidden="true">
                    {bottom.map((logo, index) => (
                      <div key={`bottom-b-${index}`} className="marquee-item">
                        <img
                          src={logo.image}
                          alt=""
                          loading="eager"
                          decoding="async"
                          draggable={false}
                          className="marquee-logo"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </section>

      {/* Luxurious Collection */}
      <section className="py-12 sm:py-16 md:py-24 bg-white">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-12 md:mb-16">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <SoronaSymbol className="w-6 h-6 text-beige-700" />
                <span className="text-zinc-800 font-medium tracking-wide">Luxurious Collection</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-medium text-zinc-900 max-w-2xl leading-tight">
                Discover Perfect Tile Sizes for Every Unique Space
              </h2>
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 h-auto">
            {sizesList.length > 0 ? (
              sizesList.map((item, index) => (
                <Link
                  to="/products"
                  key={item.id || index}
                  className="group relative w-full h-[350px] sm:h-[420px] md:h-[500px] overflow-hidden rounded-[2rem] cursor-pointer bg-zinc-100 block"
                >
                  <img loading="lazy"
                    src={getOptimizedImageUrl(item.image || item.img, 600)}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />

                  {/* Dynamic Overlay */}
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-700" />

                  {/* Content Panel */}
                  <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
                    {/* Glassmorphism Background (Reveals on hover) */}
                    <div className="absolute inset-0 bg-white/10 backdrop-blur-md border-t border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                    <div className="relative z-10">
                      <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/60 mb-2 block group-hover:text-beige-300 transition-colors duration-500">
                        Premium Dimension
                      </span>
                      <h3 className="text-2xl font-display font-bold text-white mb-3 tracking-tight">
                        {item.title}
                      </h3>

                      {/* Hidden details that slide in */}
                      <div className="max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-700 overflow-hidden">
                        <p className="text-sm text-white/80 mb-6 font-light">
                          {item.thickness}
                        </p>
                        <div className="flex items-center text-white text-[11px] font-bold tracking-[0.2em] uppercase gap-3">
                          Explore <ArrowRight size={14} className="text-beige-400 transition-transform duration-300 group-hover:translate-x-1" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="col-span-full mx-auto max-w-2xl rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-14 text-center text-zinc-500 w-full">
                <Sparkles className="mx-auto mb-3 opacity-50 text-beige-700" size={34} />
                <p className="text-lg font-semibold text-zinc-700">No tile dimensions added yet</p>
                <p className="mt-2 text-sm text-zinc-500">Use the admin panel to add dimensions for this section.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Sustainability Section */}
      <section className="pt-14 pb-8 sm:pt-20 sm:pb-12 md:pt-28 md:pb-16 bg-[#EBE7E0] overflow-hidden">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 md:gap-16 items-center">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <Sprout className="text-[#008000]" size={26} />
                <span className="text-[#008000] font-bold uppercase tracking-widest text-lg">Eco-Friendly Innovation</span>
              </div>
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-[#008000] leading-tight">
                {homeTexts.sustainabilityTitle}
              </h2>
              <p className="text-[#008000] text-lg leading-relaxed max-w-xl font-medium opacity-80">
                {homeTexts.sustainabilityDesc}
              </p>
              <div className="pt-4">
                <Link to="/about" className="inline-flex items-center gap-2 text-[#008000] font-bold uppercase tracking-widest text-xs group">
                  Learn More About Our Process
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-2" />
                </Link>
              </div>
            </div>

            <div className="relative aspect-square lg:aspect-video rounded-3xl overflow-hidden shadow-2xl">
              <div className="w-full h-full">
                {homeTexts.sustainabilityImage ? (
                  <img loading="lazy"
                    src={getOptimizedImageUrl(homeTexts.sustainabilityImage, 800)}
                    alt="Sustainable Manufacturing"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-center px-6 bg-white/70 border border-dashed border-slate-300 text-slate-500">
                    <div>
                      <Leaf className="mx-auto mb-3 opacity-50" size={30} />
                      <p className="font-semibold">No sustainability image saved</p>
                      <p className="mt-1 text-sm">Upload one in admin to show it here.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="pt-8 pb-14 sm:pt-12 sm:pb-20 md:pt-16 md:pb-28 bg-[#EBE7E0] overflow-hidden">
        <div className="container-custom">
          {/* Header */}
          <ScrollReveal
            variant="fade-up"
            className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 sm:mb-12 md:mb-16 gap-6 sm:gap-8"
          >
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 rounded-full bg-beige-700"></div>
                <span className="text-zinc-800 font-medium tracking-wide text-sm">Our Blog</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-[3.5rem] font-sans font-light text-zinc-900 leading-[1.1] tracking-tight">
                {homeTexts.blogTitle.split('\n').map((line, idx) => (
                  <React.Fragment key={idx}>
                    {idx > 0 && <br />}
                    {line}
                  </React.Fragment>
                ))}
              </h2>
            </div>
            <Link to="/blog" className="group mt-6 md:mt-0 relative flex items-center w-[180px] h-16">
              <div className="absolute left-0 w-16 h-16 bg-[#D2C9B1] rounded-full transition-all duration-500 ease-out group-hover:w-full group-hover:bg-[#5D4037]"></div>
              <span className="relative z-10 flex items-center pl-5 text-sm font-medium text-zinc-900 group-hover:text-white transition-colors duration-300">
                View All Blogs <ArrowRight size={16} className="ml-2" />
              </span>
            </Link>
          </ScrollReveal>

          {/* Blog Grid — horizontal scroll on mobile, 3-col grid on desktop */}
          <ScrollReveal variant="fade-up" delay={200}>
            <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 snap-x snap-mandatory md:snap-none scrollbar-none -mx-4 sm:-mx-6 md:mx-0 px-4 sm:px-6 md:px-0 scroll-pl-4 sm:scroll-pl-6 md:scroll-pl-0">
              {blogs.length > 0 ? (
                blogs.map((blog) => (
                  <Link
                    key={blog._id}
                    to={`/blog/${blog.slug}`}
                    className="shrink-0 w-[80vw] sm:w-[60vw] md:w-auto snap-start group flex flex-col space-y-4 md:space-y-6"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-zinc-200 rounded-2xl">
                      <img loading="lazy"
                        src={getOptimizedImageUrl(blog.image) || 'https://via.placeholder.com/600x400?text=No+Image'}
                        alt={blog.title}
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                    </div>
                    <div className="space-y-3 md:space-y-4 pr-4">
                      <p className="text-xs md:text-sm font-medium text-zinc-500 uppercase tracking-wide">{new Date(blog.createdAt).toLocaleDateString()}</p>
                      <h3 className="text-lg md:text-xl lg:text-[1.35rem] font-bold text-zinc-900 leading-[1.3] group-hover:text-beige-700 transition-colors duration-500 line-clamp-2">
                        {blog.title}
                      </h3>
                      {/* <p className="text-zinc-600 text-sm md:text-[15px] leading-relaxed line-clamp-2 md:line-clamp-3">
                        {blog.content.length > 120 ? blog.content.substring(0, 120).replace(/<[^>]+>/g, '') + '...' : blog.content.replace(/<[^>]+>/g, '')}
                      </p> */}
                      <div className="flex items-center text-beige-700 font-bold text-sm opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500">
                        Read Story <ArrowRight size={14} className="ml-2" />
                      </div>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="col-span-full mx-auto max-w-2xl rounded-3xl border border-dashed border-zinc-300 bg-zinc-50/50 px-6 py-14 text-center text-zinc-500 w-full">
                  <Sparkles className="mx-auto mb-3 opacity-50 text-beige-700" size={34} />
                  <p className="text-lg font-semibold text-zinc-700">No blog posts published yet</p>
                  <p className="mt-2 text-sm text-zinc-500">Publish articles in the admin panel to show them in this section.</p>
                </div>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
