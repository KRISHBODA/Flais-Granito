import React, { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, Phone, Mail, Navigation, ChevronDown, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import api from '../utils/api';
import { getOptimizedImageUrl, getOptimizedVideoUrl } from '../utils/imageOptimizer';

const WhereToBuy = () => {
  const [dealers, setDealers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [isStateOpen, setIsStateOpen] = useState(false);
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [selectedDealer, setSelectedDealer] = useState(null);

  const getMapQuery = (dealer) => {
    if (!dealer) return '';
    const latLngPattern = /^-?\d+(\.\d+)?,\s*-?\d+(\.\d+)?$/;
    if (dealer.coordinates && latLngPattern.test(dealer.coordinates.trim())) {
      return dealer.coordinates.trim();
    }
    if (dealer.coordinates && !dealer.coordinates.startsWith('http') && dealer.coordinates.length < 100) {
      return `${dealer.coordinates}, ${dealer.city}, ${dealer.state}`;
    }
    return `${dealer.name}, ${dealer.address}, ${dealer.city}, ${dealer.state}`;
  };

  const [pageSettings, setPageSettings] = useState({
    heroTitle: "Where to Buy",
    heroSubtitle: "Find our premium tiles at a showroom near you. Experience the quality and elegance of Sorona in person.",
    heroMedia: "",
    introTitle: "Step Into a World of Luxury and Grandeur",
    introDescription: "Explore our exclusive showrooms and authorized dealer network. Flais Park showcases our full collection of premium vitrified tiles in real-world layouts, giving you the inspiration to transform your architectural visions into reality."
  });

  useEffect(() => {
    const fetchFlaisParkData = async () => {
      try {
        setLoading(true);
        setLoadError('');
        const res = await api.get('/flais-park');
        if (res.data.success && res.data.flaisPark) {
          const page = res.data.flaisPark;
          if (page.pageSettings) setPageSettings(page.pageSettings);
          if (Array.isArray(page.dealers)) setDealers(page.dealers);
        }
      } catch (err) {
                setLoadError('Failed to load showroom locations.');
      } finally {
        setLoading(false);
      }
    };
    fetchFlaisParkData();
  }, []);

  const isVideo = useMemo(() => {
    const media = pageSettings.heroMedia;
    if (!media) return false;
    return /\.(mp4|webm|ogg|mov|m4v)/i.test(media) || media.includes('video') || media.includes('stream');
  }, [pageSettings.heroMedia]);

  const STATES = useMemo(() => [...new Set(dealers.map(d => d.state))].filter(Boolean), [dealers]);

  const availableCities = useMemo(() => {
    return selectedState 
      ? [...new Set(dealers.filter(d => d.state === selectedState).map(d => d.city))].filter(Boolean)
      : [];
  }, [dealers, selectedState]);

  const filteredDealers = useMemo(() => {
    return dealers.filter(dealer => {
      if (selectedState && dealer.state !== selectedState) return false;
      if (selectedCity && dealer.city !== selectedCity) return false;
      return true;
    });
  }, [dealers, selectedState, selectedCity]);

  useEffect(() => {
    if (filteredDealers.length > 0) {
      setSelectedDealer(prev => {
        if (!prev) return filteredDealers[0];
        const stillExists = filteredDealers.find(
          d => (d._id || d.id) === (prev._id || prev.id)
        );
        return stillExists || filteredDealers[0];
      });
    } else {
      setSelectedDealer(null);
    }
  }, [filteredDealers]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f5f0] px-6">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#5D4037]/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#5D4037] border-l-[#c5a880] animate-spin" />
          </div>
          <p className="text-sm font-display font-medium tracking-widest text-[#5D4037] uppercase">Loading Showrooms</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="pt-24 min-h-screen bg-[#FDFBF7] flex items-center justify-center px-6 text-zinc-600">
        <div className="max-w-md text-center space-y-3 rounded-3xl border border-zinc-200 bg-white p-8">
          <p className="text-lg font-bold text-zinc-900">Where to Buy unavailable</p>
          <p className="text-sm">{loadError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7]">
      <SEO 
        title={`${pageSettings.heroTitle} - Find Showrooms & Dealers`}
        description={pageSettings.heroSubtitle}
        keywords="buy tiles near me, tile showroom, flais granito dealer, tile store locator"
      />
      {/* Hero Section */}
      <section className="relative h-[45vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {pageSettings.heroMedia ? (
            isVideo ? (
              <video
                autoPlay
                muted
                playsInline
                loop
                className="w-full h-full object-cover filter brightness-[0.6]"
                key={pageSettings.heroMedia}
              >
                <source src={getOptimizedVideoUrl(pageSettings.heroMedia)} />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img loading="lazy" 
                src={getOptimizedImageUrl(pageSettings.heroMedia)} 
                alt={pageSettings.heroTitle} 
                className="w-full h-full object-cover filter brightness-[0.6]"
              />
            )
          ) : (
            <img loading="lazy" 
              src="https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=2000&q=80" 
              alt={pageSettings.heroTitle} 
              className="w-full h-full object-cover filter brightness-[0.6]"
            />
          )}
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto mt-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 uppercase tracking-wider"
          >
            {pageSettings.heroTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/90 font-light max-w-2xl mx-auto"
          >
            {pageSettings.heroSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Main Content */}
      <section className="pt-20 pb-4 relative z-20 -translate-y-16">
        <div className="container-custom">
          
          {/* Intro Section */}
          <div className="text-center max-w-3xl mx-auto mb-16 bg-white rounded-3xl p-8 shadow-sm border border-zinc-100/50">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 mb-4">{pageSettings.introTitle}</h2>
            <p className="text-zinc-600 font-light leading-relaxed">{pageSettings.introDescription}</p>
          </div>

          {/* Search Box */}
          <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 md:p-8 mb-12 max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
              <Search className="text-[#5D4037]" size={20} />
              Find a Dealer
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* State Dropdown */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Select State</label>
                <div 
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-[#5D4037] transition-colors"
                  onClick={() => { setIsStateOpen(!isStateOpen); setIsCityOpen(false); }}
                >
                  <span className={selectedState ? 'text-zinc-900 font-medium' : 'text-zinc-400'}>
                    {selectedState || 'All States'}
                  </span>
                  <ChevronDown size={18} className={`text-zinc-500 transition-transform ${isStateOpen ? 'rotate-180' : ''}`} />
                </div>
                <AnimatePresence>
                  {isStateOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-white border border-zinc-100 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="max-h-60 overflow-y-auto">
                        <div 
                          className="p-3 hover:bg-beige-50 cursor-pointer flex items-center justify-between transition-colors"
                          onClick={() => { setSelectedState(''); setSelectedCity(''); setIsStateOpen(false); }}
                        >
                          <span className="text-zinc-700">All States</span>
                          {!selectedState && <Check size={16} className="text-[#5D4037]" />}
                        </div>
                        {STATES.map(state => (
                          <div 
                            key={state}
                            className="p-3 hover:bg-beige-50 cursor-pointer flex items-center justify-between transition-colors"
                            onClick={() => { setSelectedState(state); setSelectedCity(''); setIsStateOpen(false); }}
                          >
                            <span className="text-zinc-700">{state}</span>
                            {selectedState === state && <Check size={16} className="text-[#5D4037]" />}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* City Dropdown */}
              <div className="relative">
                <label className="block text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Select City</label>
                <div 
                  className={`w-full bg-zinc-50 border border-zinc-200 rounded-xl p-4 flex justify-between items-center transition-colors ${!selectedState ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-[#5D4037]'}`}
                  onClick={() => { if(selectedState) setIsCityOpen(!isCityOpen); setIsStateOpen(false); }}
                >
                  <span className={selectedCity ? 'text-zinc-900 font-medium' : 'text-zinc-400'}>
                    {selectedCity || 'All Cities'}
                  </span>
                  <ChevronDown size={18} className={`text-zinc-500 transition-transform ${isCityOpen ? 'rotate-180' : ''}`} />
                </div>
                <AnimatePresence>
                  {isCityOpen && selectedState && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 w-full mt-2 bg-white border border-zinc-100 rounded-xl shadow-xl z-50 overflow-hidden"
                    >
                      <div className="max-h-60 overflow-y-auto">
                        <div 
                          className="p-3 hover:bg-beige-50 cursor-pointer flex items-center justify-between transition-colors"
                          onClick={() => { setSelectedCity(''); setIsCityOpen(false); }}
                        >
                          <span className="text-zinc-700">All Cities</span>
                          {!selectedCity && <Check size={16} className="text-[#5D4037]" />}
                        </div>
                        {availableCities.map(city => (
                          <div 
                            key={city}
                            className="p-3 hover:bg-beige-50 cursor-pointer flex items-center justify-between transition-colors"
                            onClick={() => { setSelectedCity(city); setIsCityOpen(false); }}
                          >
                            <span className="text-zinc-700">{city}</span>
                            {selectedCity === city && <Check size={16} className="text-[#5D4037]" />}
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* Results Layout */}
          <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 max-w-7xl mx-auto lg:h-[600px]">
            
            {/* Dealer List */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-zinc-100 overflow-hidden flex flex-col h-[400px] lg:h-full">
              <div className="p-6 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center">
                <h3 className="font-bold text-zinc-900">
                  {filteredDealers.length} {filteredDealers.length === 1 ? 'Dealer' : 'Dealers'} Found
                </h3>
                {selectedState && (
                  <button 
                    onClick={() => { setSelectedState(''); setSelectedCity(''); }}
                    className="text-xs font-semibold text-[#5D4037] hover:underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
                {filteredDealers.map(dealer => {
                  const dId = dealer._id || dealer.id;
                  const isSelected = selectedDealer && (selectedDealer._id === dId || selectedDealer.id === dId);
                  return (
                    <div 
                      key={dId} 
                      onClick={() => setSelectedDealer(dealer)}
                      className={`p-5 rounded-xl border transition-all duration-300 bg-white group cursor-pointer ${
                        isSelected 
                          ? 'border-[#5D4037] ring-1 ring-[#5D4037] shadow-md bg-beige-50/20' 
                          : 'border-zinc-100 hover:border-[#5D4037]/30 hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h4 className={`font-bold text-lg transition-colors ${
                          isSelected ? 'text-[#5D4037]' : 'text-zinc-900 group-hover:text-[#5D4037]'
                        }`}>{dealer.name}</h4>
                        <span className={`text-[10px] uppercase font-bold tracking-widest py-1 px-2 rounded transition-colors ${
                          isSelected ? 'bg-[#5D4037] text-white' : 'bg-beige-100 text-[#5D4037]'
                        }`}>
                          {dealer.type}
                        </span>
                      </div>
                      
                      <div className="space-y-3 text-sm text-zinc-600">
                        <div className="flex items-start gap-3">
                          <MapPin size={16} className={`mt-0.5 shrink-0 transition-colors ${
                            isSelected ? 'text-[#5D4037]' : 'text-zinc-400'
                          }`} />
                          <p className="leading-relaxed">{dealer.address}</p>
                        </div>
                        {dealer.phone && (
                          <div className="flex items-center gap-3">
                            <Phone size={16} className={`shrink-0 transition-colors ${
                              isSelected ? 'text-[#5D4037]' : 'text-zinc-400'
                            }`} />
                            <a href={`tel:${dealer.phone}`} className="hover:text-[#5D4037]">{dealer.phone}</a>
                          </div>
                        )}
                        {dealer.email && (
                          <div className="flex items-center gap-3">
                            <Mail size={16} className={`shrink-0 transition-colors ${
                              isSelected ? 'text-[#5D4037]' : 'text-zinc-400'
                            }`} />
                            <a href={`mailto:${dealer.email}`} className="hover:text-[#5D4037]">{dealer.email}</a>
                          </div>
                        )}
                      </div>

                      {dealer.coordinates && (
                        <a 
                          href={dealer.coordinates.startsWith('http') ? dealer.coordinates : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(dealer.coordinates)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`mt-5 w-full py-2.5 font-semibold text-sm rounded-lg flex items-center justify-center gap-2 transition-colors ${
                            isSelected 
                              ? 'bg-[#5D4037] text-white hover:bg-[#4E342E]' 
                              : 'bg-zinc-50 text-zinc-700 hover:bg-[#5D4037] hover:text-white'
                          }`}
                        >
                          <Navigation size={14} /> Get Directions
                        </a>
                      )}
                    </div>
                  );
                })}
                
                {filteredDealers.length === 0 && (
                  <div className="text-center py-12 px-4">
                    <MapPin size={40} className="mx-auto text-zinc-300 mb-4" />
                    <h4 className="font-bold text-zinc-900 mb-2">No Dealers Found</h4>
                    <p className="text-sm text-zinc-500">We couldn't find any dealers matching your selection. Please try a different location.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Map Area */}
            <div className="lg:col-span-3 bg-zinc-100 rounded-2xl overflow-hidden relative border border-zinc-200 min-h-[300px] lg:min-h-0">
              {selectedDealer ? (
                <iframe
                  title="Dealer Location Map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    getMapQuery(selectedDealer)
                  )}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  className="w-full h-full border-0 absolute inset-0"
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              ) : (
                <>
                  <div className="absolute inset-0 bg-[#E8EAED]">
                    <img loading="lazy" 
                      src="https://media.wired.com/photos/59269cd37034dc5f91bec0f1/master/pass/GoogleMapTA.jpg" 
                      alt="Map View" 
                      className="w-full h-full object-cover opacity-60"
                    />
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-8 text-center">
                    <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-xl max-w-sm pointer-events-auto border border-zinc-100">
                      <MapPin size={32} className="text-[#5D4037] mx-auto mb-3" />
                      <h3 className="font-bold text-zinc-900 mb-2">Interactive Map</h3>
                      <p className="text-sm text-zinc-600 mb-4">
                        Explore showrooms globally. Select state and city details to pinpoint the nearest outlet for FLAIS GRANITO premium surfaces.
                      </p>
                      <div className="text-xs font-semibold text-[#5D4037] uppercase tracking-widest bg-beige-50 inline-block py-2 px-4 rounded-lg">
                        {filteredDealers.length} Locations Mapped
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default WhereToBuy;
