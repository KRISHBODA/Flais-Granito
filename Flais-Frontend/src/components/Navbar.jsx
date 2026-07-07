import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Globe, ChevronDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import logoBlack from '../assets/Flais_black.png';
import logoWhite from '../assets/Flais White.png';
import api from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const handleTechnicalGuideClick = async (e) => {
    if (e) e.preventDefault();
    setIsOpen(false);

    // Open a blank tab immediately to bypass popup blocker
    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.document.title = "Loading Technical Guide...";
      newTab.document.body.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8f5f0; color: #5D4037; margin: 0;">
          <div style="border: 4px solid rgba(93, 64, 55, 0.1); border-top: 4px solid #5D4037; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
          <p style="font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">Opening Technical Guide...</p>
          <style>
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          </style>
        </div>
      `;
    }

    let resolvedUrl = '';
    try {
      // Fetch latest guide configuration from backend dynamically to avoid stale state
      const response = await api.get('/flais-guide');
      if (!response.data || !response.data.success) {
        throw new Error("Failed to load guide configurations");
      }
      
      const data = response.data.flaisGuide || {};
      const latestPdfUrl = data.technicalGuide?.pdfUrl;

      if (!latestPdfUrl) {
        if (newTab) {
          newTab.document.body.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; background-color: #f8f5f0; color: #5D4037; padding: 20px; text-align: center;">
              <p style="font-size: 16px; font-weight: 600;">Technical Guide PDF is not available yet.</p>
              <button onclick="window.close()" style="margin-top: 15px; padding: 8px 16px; background-color: #5D4037; color: white; border: none; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: bold;">Close Tab</button>
            </div>
          `;
        } else {
          alert("Technical Guide PDF is not available yet.");
        }
        return;
      }

      // Resolve URL
      resolvedUrl = getOptimizedImageUrl(latestPdfUrl);

      // Fetch PDF binary with cache-busting to prevent browser caching of Cloudinary contents
      const fetchUrl = resolvedUrl.includes('?') ? `${resolvedUrl}&t=${Date.now()}` : `${resolvedUrl}?t=${Date.now()}`;
      const pdfRes = await fetch(fetchUrl);
      if (!pdfRes.ok) {
        throw new Error("Failed to fetch PDF");
      }
      const blob = await pdfRes.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const objectUrl = window.URL.createObjectURL(pdfBlob);
      
      if (newTab) {
        newTab.location.href = objectUrl;
      } else {
        window.open(objectUrl, '_blank');
      }
    } catch (err) {
      if (newTab) {
        if (resolvedUrl) {
          newTab.location.href = resolvedUrl;
        } else {
          newTab.document.body.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, sans-serif; background-color: #f8f5f0; color: #5D4037; padding: 20px; text-align: center;">
              <p style="font-size: 16px; font-weight: 600;">Failed to load the Technical Guide.</p>
              <button onclick="window.close()" style="margin-top: 15px; padding: 8px 16px; background-color: #5D4037; color: white; border: none; border-radius: 20px; cursor: pointer; font-size: 14px; font-weight: bold;">Close Tab</button>
            </div>
          `;
        }
      } else if (resolvedUrl) {
        window.open(resolvedUrl, '_blank');
      }
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      // Use requestAnimationFrame to debounce slightly and avoid layout thrashing
      window.requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
      });
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location]);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Why FLAIS', path: '/about' },
    { name: 'Collection', path: '/products' },
    { name: 'Catalogues', path: '/catalog' },
    {
      name: 'Flais Guide',
      path: '#',
      subItems: [
        { name: 'Achievement', path: '/certifications' },
        { name: 'Technical Guide', path: '#', isTechnicalGuide: true },
        { name: 'Installation Guide', path: '/installation-guide' },
        { name: 'Tile Calculator', path: '/calculator' },
      ]
    },
    { name: 'Flais Park', path: '/where-to-buy' },
    { name: 'Blog', path: '/blog' },
  ];

  const [activeDropdown, setActiveDropdown] = useState(null);

  const [availableLanguages, setAvailableLanguages] = useState([
    { code: 'af', label: 'Afrikaans' }, { code: 'sq', label: 'Albanian' }, { code: 'am', label: 'Amharic' }, { code: 'ar', label: 'Arabic' }, { code: 'hy', label: 'Armenian' },
    { code: 'az', label: 'Azerbaijani' }, { code: 'eu', label: 'Basque' }, { code: 'be', label: 'Belarusian' }, { code: 'bn', label: 'Bengali' }, { code: 'bs', label: 'Bosnian' },
    { code: 'bg', label: 'Bulgarian' }, { code: 'ca', label: 'Catalan' }, { code: 'ceb', label: 'Cebuano' }, { code: 'ny', label: 'Chichewa' }, { code: 'zh-CN', label: 'Chinese (Simplified)' },
    { code: 'zh-TW', label: 'Chinese (Traditional)' }, { code: 'co', label: 'Corsican' }, { code: 'hr', label: 'Croatian' }, { code: 'cs', label: 'Czech' }, { code: 'da', label: 'Danish' },
    { code: 'nl', label: 'Dutch' }, { code: 'en', label: 'English' }, { code: 'eo', label: 'Esperanto' }, { code: 'et', label: 'Estonian' }, { code: 'tl', label: 'Filipino' },
    { code: 'fi', label: 'Finnish' }, { code: 'fr', label: 'French' }, { code: 'fy', label: 'Frisian' }, { code: 'gl', label: 'Galician' }, { code: 'ka', label: 'Georgian' },
    { code: 'de', label: 'German' }, { code: 'el', label: 'Greek' }, { code: 'gu', label: 'Gujarati' }, { code: 'ht', label: 'Haitian Creole' }, { code: 'ha', label: 'Hausa' },
    { code: 'haw', label: 'Hawaiian' }, { code: 'iw', label: 'Hebrew' }, { code: 'hi', label: 'Hindi' }, { code: 'hmn', label: 'Hmong' }, { code: 'hu', label: 'Hungarian' },
    { code: 'is', label: 'Icelandic' }, { code: 'ig', label: 'Igbo' }, { code: 'id', label: 'Indonesian' }, { code: 'ga', label: 'Irish' }, { code: 'it', label: 'Italian' },
    { code: 'ja', label: 'Japanese' }, { code: 'jw', label: 'Javanese' }, { code: 'kn', label: 'Kannada' }, { code: 'kk', label: 'Kazakh' }, { code: 'km', label: 'Khmer' },
    { code: 'ko', label: 'Korean' }, { code: 'ku', label: 'Kurdish (Kurmanji)' }, { code: 'ky', label: 'Kyrgyz' }, { code: 'lo', label: 'Lao' }, { code: 'la', label: 'Latin' },
    { code: 'lv', label: 'Latvian' }, { code: 'lt', label: 'Lithuanian' }, { code: 'lb', label: 'Luxembourgish' }, { code: 'mk', label: 'Macedonian' }, { code: 'mg', label: 'Malagasy' },
    { code: 'ms', label: 'Malay' }, { code: 'ml', label: 'Malayalam' }, { code: 'mt', label: 'Maltese' }, { code: 'mi', label: 'Maori' }, { code: 'mr', label: 'Marathi' },
    { code: 'mn', label: 'Mongolian' }, { code: 'my', label: 'Myanmar (Burmese)' }, { code: 'ne', label: 'Nepali' }, { code: 'no', label: 'Norwegian' }, { code: 'ps', label: 'Pashto' },
    { code: 'fa', label: 'Persian' }, { code: 'pl', label: 'Polish' }, { code: 'pt', label: 'Portuguese' }, { code: 'pa', label: 'Punjabi' }, { code: 'ro', label: 'Romanian' },
    { code: 'ru', label: 'Russian' }, { code: 'sm', label: 'Samoan' }, { code: 'gd', label: 'Scots Gaelic' }, { code: 'sr', label: 'Serbian' }, { code: 'st', label: 'Sesotho' },
    { code: 'sn', label: 'Shona' }, { code: 'sd', label: 'Sindhi' }, { code: 'si', label: 'Sinhala' }, { code: 'sk', label: 'Slovak' }, { code: 'sl', label: 'Slovenian' },
    { code: 'so', label: 'Somali' }, { code: 'es', label: 'Spanish' }, { code: 'su', label: 'Sundanese' }, { code: 'sw', label: 'Swahili' }, { code: 'sv', label: 'Swedish' },
    { code: 'tg', label: 'Tajik' }, { code: 'ta', label: 'Tamil' }, { code: 'te', label: 'Telugu' }, { code: 'th', label: 'Thai' }, { code: 'tr', label: 'Turkish' },
    { code: 'uk', label: 'Ukrainian' }, { code: 'ur', label: 'Urdu' }, { code: 'uz', label: 'Uzbek' }, { code: 'vi', label: 'Vietnamese' }, { code: 'cy', label: 'Welsh' },
    { code: 'xh', label: 'Xhosa' }, { code: 'yi', label: 'Yiddish' }, { code: 'yo', label: 'Yoruba' }, { code: 'zu', label: 'Zulu' }
  ]);
  const [showLangs, setShowLangs] = useState(false);
  const [langSearch, setLangSearch] = useState('');

  useEffect(() => {
    window.googleTranslateElementInit = () => {
      try {
        if (window.google && window.google.translate && window.google.translate.TranslateElement) {
          const layout = window.google.translate.TranslateElement.InlineLayout?.SIMPLE || 0;
          new window.google.translate.TranslateElement(
            { pageLanguage: 'en', includedLanguages: '', layout: layout, autoDisplay: false },
            'google_translate_element'
          );
        }
      } catch (err) {
              }
    };
    if (window.google && window.google.translate) {
      try {
        window.googleTranslateElementInit();
      } catch (err) {
              }
    }

    const style = document.createElement('style');
    style.id = 'hide-gt-banner';
    style.innerHTML = `.goog-te-banner-frame, #goog-gt-tt, .goog-te-balloon-frame { display: none !important; } body { top: 0 !important; } .skiptranslate { display: none !important; }`;
    document.head.appendChild(style);
    return () => { const el = document.getElementById('hide-gt-banner'); if (el) el.remove(); };
  }, []);

  const selectLanguage = (code) => {
    // Set cookies for both main domain and subdomains to persist translation across routing
    const cookieValue = code === 'en' ? '/en/en' : `/en/${code}`;
    document.cookie = `googtrans=${cookieValue}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; domain=${window.location.hostname}; path=/;`;
    document.cookie = `googtrans=${cookieValue}; domain=.${window.location.hostname}; path=/;`;

    // Dispatch native Google combo box translation change if loaded
    const select = document.querySelector('.goog-te-combo');
    if (select) {
      select.value = code;
      select.dispatchEvent(new Event('change'));
    }

    // Refresh to force the Google Translate script to translate immediately
    window.location.reload();
  };

  const filteredLanguages = availableLanguages.filter(lang =>
    lang.label.toLowerCase().includes(langSearch.toLowerCase())
  );

  const isHome = location.pathname === '/';
  const shouldShowBg = scrolled || !isHome || isOpen;

  const navClass = isOpen
    ? 'top-0 w-full bg-white shadow-md rounded-none'
    : shouldShowBg
      ? 'top-4 md:top-6 w-[95%] lg:w-[90%] max-w-7xl bg-white/95 backdrop-blur-md shadow-xl rounded-full'
      : 'top-0 w-full bg-transparent border-transparent shadow-none rounded-none';

const rowPadding = isOpen
  ? 'py-4 px-6 md:px-12'
  : shouldShowBg
    ? 'py-2.5 px-5 sm:px-6 lg:py-3 lg:px-10'
    : 'py-5 px-6 md:px-12 lg:py-7 lg:px-20';

  return (
    <nav className={`fixed left-1/2 -translate-x-1/2 z-50 transition-[background-color,border-color,box-shadow,transform,top,border-radius,width] duration-500 ease-in-out ${navClass}`}>
      <div className={`flex items-center justify-between w-full ${rowPadding}`}>

        {/* LEFT: Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link to="/" className="flex items-center">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            >
              <img loading="lazy"
                src={!shouldShowBg ? logoWhite : logoBlack}
                alt="FLAIS GRANITO"
                className="h-6 md:h-7 lg:h-8 w-[120px] md:w-[140px] lg:w-[160px] object-contain transition-all duration-500 origin-left"
              />
            </motion.div>
          </Link>
        </div>

        {/* CENTER: Nav Links */}
        <div className="hidden lg:flex items-center justify-between flex-1 mx-4 xl:mx-8">
          {navLinks.map((link) => (
            <div
              key={link.name}
              className="relative group py-3"
              onMouseEnter={() => link.subItems && setActiveDropdown(link.name)}
              onMouseLeave={() => link.subItems && setActiveDropdown(null)}
            >
              {link.subItems ? (
                <button
                  className={`flex items-center gap-0.5 text-xs xl:text-sm font-semibold tracking-wide py-1 whitespace-nowrap transition-colors duration-200 ${shouldShowBg ? 'text-zinc-500 hover:text-zinc-900' : 'text-white/75 hover:text-white'
                    }`}
                >
                  {link.name}
                  <ChevronDown size={12} className={`transition-transform duration-300 ${activeDropdown === link.name ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <Link
                  to={link.path}
                  className={`relative text-xs xl:text-sm font-semibold tracking-wide py-1 whitespace-nowrap transition-colors duration-200 ${location.pathname === link.path
                    ? shouldShowBg ? 'text-[#5D4037]' : 'text-white'
                    : shouldShowBg ? 'text-zinc-500 hover:text-zinc-900' : 'text-white/75 hover:text-white'
                    }`}
                >
                  {link.name}
                  <span className={`absolute -bottom-0.5 left-0 h-[2px] bg-[#5D4037] transition-all duration-300 ${location.pathname === link.path ? 'w-full' : 'w-0 group-hover:w-full'
                    }`} />
                </Link>
              )}

              {/* Dropdown Menu */}
              {link.subItems && (
                <AnimatePresence>
                  {activeDropdown === link.name && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-1/2 -translate-x-1/2 w-56 bg-white rounded-2xl shadow-2xl border border-zinc-100 py-3 overflow-hidden"
                    >
                      {link.subItems.map((sub) =>
                        sub.isTechnicalGuide ? (
                          <button
                            key={sub.name}
                            onClick={handleTechnicalGuideClick}
                            className="w-full text-left block px-6 py-2.5 text-sm font-medium text-zinc-600 hover:text-[#5D4037] hover:bg-beige-50 transition-colors cursor-pointer"
                          >
                            {sub.name}
                          </button>
                        ) : (
                          <Link
                            key={sub.name}
                            to={sub.path}
                            className="block px-6 py-2.5 text-sm font-medium text-zinc-600 hover:text-[#5D4037] hover:bg-beige-50 transition-colors"
                          >
                            {sub.name}
                          </Link>
                        )
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          ))}
        </div>

        {/* RIGHT: Enquire + Language + Mobile Toggle */}
        <div className="flex items-center justify-end gap-4 flex-shrink-0">

          {/* Enquire Now — Desktop */}
          <Link
            to="/contact"
            className={`hidden lg:inline-flex items-center justify-center w-[120px] h-[36px] xl:w-[130px] xl:h-[40px] text-[10px] xl:text-xs font-bold border transition-all duration-300 rounded-full uppercase tracking-wider ${shouldShowBg
              ? 'border-zinc-900 text-zinc-900 hover:bg-zinc-900 hover:text-white'
              : 'border-white/70 text-white hover:bg-white hover:text-zinc-900'
              }`}
          >
            Enquire Now
          </Link>

          {/* Divider */}
          <div className={`hidden lg:block w-px h-5 ${shouldShowBg ? 'bg-zinc-200' : 'bg-white/30'}`} />

          <div 
            className="relative z-50 flex items-center h-full py-2"
            onMouseEnter={() => setShowLangs(true)}
            onMouseLeave={() => { setShowLangs(false); setLangSearch(''); }}
          >
            <button
              onClick={() => setShowLangs(!showLangs)}
              className="flex items-center gap-1.5 cursor-pointer h-full"
              aria-label="Select language"
            >
              <Globe size={18} className={`${shouldShowBg ? 'text-zinc-600' : 'text-white/80'}`} />
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${shouldShowBg ? 'text-zinc-600' : 'text-white/80'} ${showLangs ? 'rotate-180' : ''}`}
              />
            </button>

            {/* Language Dropdown */}
            <AnimatePresence>
              {showLangs && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[99] lg:hidden"
                    onClick={() => { setShowLangs(false); setLangSearch(''); }}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.18 }}
                    className="fixed inset-x-4 top-[10vh] lg:absolute lg:top-full lg:right-0 lg:left-auto lg:w-[800px] lg:inset-x-auto bg-white rounded-3xl lg:rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-[100] max-h-[80vh] flex flex-col"
                  >
                    <div className="p-5 md:p-8 flex flex-col h-full overflow-hidden">
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Select Language</h3>
                        <button onClick={() => { setShowLangs(false); setLangSearch(''); }} className="text-zinc-400 hover:text-zinc-900 transition-colors p-1">
                          <X size={20} />
                        </button>
                      </div>

                      {/* Search Bar */}
                      <div className="mb-4 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                        <input
                          type="text"
                          placeholder="Search language..."
                          value={langSearch}
                          onChange={(e) => setLangSearch(e.target.value)}
                          className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#5D4037]/20 focus:border-[#5D4037] transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-2 gap-y-1 overflow-y-auto overscroll-contain custom-scrollbar pr-2 pb-2 notranslate">
                        {filteredLanguages.length > 0 ? (
                          filteredLanguages.map((lang) => (
                            <button
                              key={lang.code}
                              onClick={() => selectLanguage(lang.code)}
                              className="text-left py-2 px-3 text-[14px] leading-normal text-zinc-600 hover:bg-beige-50 hover:text-[#5D4037] rounded-lg transition-colors block w-full whitespace-nowrap overflow-visible"
                            >
                              {lang.label}
                            </button>
                          ))
                        ) : (
                          <div className="col-span-full py-10 text-center text-zinc-400 text-sm">
                            No languages found matching "{langSearch}"
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile Toggle */}
          <button
            className={`lg:hidden transition-colors ${shouldShowBg ? 'text-zinc-900' : 'text-white'}`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="lg:hidden bg-white overflow-hidden w-full"
          >
            <div className="py-6 px-6 md:px-12 flex flex-col space-y-6">
              {navLinks.map((link) => (
                <div key={link.name} className="flex flex-col space-y-3">
                  {link.subItems ? (
                    <>
                      <span className="text-xs font-bold uppercase tracking-widest text-zinc-400 px-1">
                        {link.name}
                      </span>
                      <div className="flex flex-col space-y-3 pl-4 border-l border-zinc-100">
                        {link.subItems.map((sub) =>
                          sub.isTechnicalGuide ? (
                            <button
                              key={sub.name}
                              onClick={handleTechnicalGuideClick}
                              className="text-left w-full text-base font-semibold text-zinc-700 hover:text-[#5D4037] cursor-pointer"
                            >
                              {sub.name}
                            </button>
                          ) : (
                            <Link
                              key={sub.name}
                              to={sub.path}
                              onClick={() => setIsOpen(false)}
                              className={`text-base font-semibold ${location.pathname === sub.path ? 'text-[#5D4037]' : 'text-zinc-700'}`}
                            >
                              {sub.name}
                            </Link>
                          )
                        )}
                      </div>
                    </>
                  ) : (
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`text-base font-semibold ${location.pathname === link.path ? 'text-[#5D4037]' : 'text-zinc-700'}`}
                    >
                      {link.name}
                    </Link>
                  )}
                </div>
              ))}
              <div className="pt-4 border-t border-zinc-100">
                <Link to="/contact" onClick={() => setIsOpen(false)} className="btn-primary w-full text-center block">
                  Enquire Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
