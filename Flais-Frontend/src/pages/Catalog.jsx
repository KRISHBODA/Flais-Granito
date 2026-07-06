import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, Loader2 } from 'lucide-react';
import SEO from '../components/SEO';
import catalogHeader from '../assets/catalog_header.jpg';
import api from '../utils/api';
import { getOptimizedImageUrl, getOptimizedVideoUrl } from '../utils/imageOptimizer';

const Catalog = () => {
  const [pageSettings, setPageSettings] = useState({
    heroTitle: "DOWNLOAD CATALOGS",
    heroSubtitle: "Explore and download our premium vitrified tiles collection brochures.",
    heroMedia: ""
  });
  const [catalogsList, setCatalogsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingKey, setDownloadingKey] = useState(null);

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/catalog');
        if (res.data.success && res.data.catalog) {
          const page = res.data.catalog;
          if (page.pageSettings) setPageSettings(page.pageSettings);
          if (Array.isArray(page.catalogs)) setCatalogsList(page.catalogs);
        }
      } catch (err) {
        // Silent catch
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogData();
  }, []);

  const resolveCatalogUrl = (catalog) => {
    const link = catalog.link && catalog.link !== '#' ? catalog.link : catalog.image;
    if (link && (link.startsWith('http://') || link.startsWith('https://'))) {
      return link;
    }
    return getOptimizedImageUrl(link);
  };

  const handleAction = async (e, catalog, action) => {
    e.preventDefault();
    const link = resolveCatalogUrl(catalog);
    if (!link) return;

    if (action === 'view') {
      // Open a blank tab immediately to bypass popup blocker
      const newTab = window.open('', '_blank');
      if (newTab) {
        newTab.document.title = `Loading ${catalog.title || 'Catalog'}...`;
        newTab.document.body.innerHTML = `
          <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; background-color: #f8f5f0; color: #5D4037; margin: 0;">
            <div style="border: 4px solid rgba(93, 64, 55, 0.1); border-top: 4px solid #5D4037; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
            <p style="font-size: 14px; font-weight: 600; letter-spacing: 2px; text-transform: uppercase;">Opening ${catalog.title || 'Catalog'}...</p>
            <style>
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            </style>
          </div>
        `;
      }

      try {
        const response = await fetch(link);
        if (!response.ok) {
          throw new Error(`Failed to fetch PDF (${response.status})`);
        }
        const blob = await response.blob();
        // Force the blob type to be application/pdf so the browser renders it in-viewer
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        const objectUrl = window.URL.createObjectURL(pdfBlob);
        
        if (newTab) {
          newTab.location.href = objectUrl;
        } else {
          window.open(objectUrl, '_blank');
        }
      } catch (err) {
        if (newTab) {
          newTab.location.href = link;
        } else {
          window.open(link, '_blank', 'noopener,noreferrer');
        }
      }
      return;
    }

    const downloadKey = catalog._id || catalog.id || catalog.title;
    try {
      setDownloadingKey(downloadKey);
      const response = await fetch(link);
      if (!response.ok) {
        throw new Error(`Failed to download file (${response.status})`);
      }
      const blob = await response.blob();
      const objectUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objectUrl;
      a.download = `${(catalog.title || 'catalog').replace(/[^a-z0-9_-]+/gi, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(objectUrl);
    } catch (err) {
      window.open(link, '_blank', 'noopener,noreferrer');
    } finally {
      setDownloadingKey(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f5f0] px-6">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#5D4037]/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#5D4037] border-l-[#c5a880] animate-spin" />
          </div>
          <p className="text-sm font-display font-medium tracking-widest text-[#5D4037] uppercase">Loading Catalogs</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 min-h-screen bg-zinc-50">
      <SEO 
        title={pageSettings.heroTitle}
        description={pageSettings.heroSubtitle}
        keywords="download tile catalog, tiles brochure, tile collections PDF, vitrified tiles catalog"
      />
      {/* Header */}
      <section className="relative h-[200px] sm:h-[250px] md:h-[300px] flex items-center justify-center overflow-hidden">
        {pageSettings.heroMedia ? (
          /\.(mp4|webm|ogg|mov|m4v)$/i.test(pageSettings.heroMedia) ? (
            <video 
              src={getOptimizedVideoUrl(pageSettings.heroMedia)} 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          ) : (
            <img loading="lazy" 
              src={getOptimizedImageUrl(pageSettings.heroMedia, 1200)} 
              alt="Our Catalogs" 
              className="absolute inset-0 w-full h-full object-cover" 
            />
          )
        ) : (
          <img loading="lazy" 
            src={catalogHeader} 
            alt="Our Catalogs" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="container-custom relative z-10 text-center space-y-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-white uppercase tracking-wider"
          >
            {pageSettings.heroTitle}
          </motion.h1>
          <div className="h-1 w-20 bg-beige-600 mx-auto"></div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/80 max-w-2xl mx-auto text-lg"
          >
            {pageSettings.heroSubtitle}
          </motion.p>
        </div>
      </section>

      {/* Catalog Grid */}
      <section className="py-24">
        <div className="container-custom">
          {catalogsList.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 max-w-md mx-auto bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm flex flex-col items-center">
              <svg className="w-16 h-16 text-zinc-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="font-semibold text-zinc-600 text-lg">No catalogs available</p>
              <p className="text-zinc-400 text-sm mt-1">Our team is currently preparing the digital catalogs. Please check back soon!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-12">
              {catalogsList.map((catalog, index) => {
                return (
                  <motion.div
                    key={catalog._id || catalog.id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 group ring-1 ring-zinc-200 flex flex-col h-full"
                  >
                    {/* Cover Image */}
                    <div className="relative h-80 overflow-hidden bg-zinc-100 flex items-center justify-center">
                      {catalog.image ? (
                        <img loading="lazy"
                          src={getOptimizedImageUrl(catalog.image, 600)}
                          alt={catalog.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-zinc-300">
                          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">No Cover</span>
                        </div>
                      )}

                      {/* Overlay Actions */}
                      <div className="absolute inset-0 bg-zinc-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4 backdrop-blur-sm">
                        <button onClick={(e) => handleAction(e, catalog, 'view')} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-zinc-900 hover:bg-beige-600 hover:text-white transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300">
                          <Eye size={20} />
                        </button>
                        <button
                          onClick={(e) => handleAction(e, catalog, 'download')}
                          disabled={downloadingKey === (catalog._id || catalog.id || catalog.title)}
                          className="w-12 h-12 bg-beige-600 rounded-full flex items-center justify-center text-white hover:bg-zinc-900 transition-colors shadow-lg translate-y-4 group-hover:translate-y-0 duration-300 delay-75 disabled:opacity-70 disabled:cursor-wait"
                        >
                          {downloadingKey === (catalog._id || catalog.id || catalog.title) ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : (
                            <Download size={20} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 space-y-4 flex flex-col flex-grow text-center">
                      <h3 className="font-display font-bold text-2xl text-zinc-900 group-hover:text-beige-600 transition-colors">
                        {catalog.title}
                      </h3>
                      <p className="text-zinc-500 leading-relaxed text-sm flex-grow">
                        {catalog.description}
                      </p>

                      <div className="pt-6 border-t border-zinc-100 grid grid-cols-2 gap-4">
                        <button onClick={(e) => handleAction(e, catalog, 'view')} className="flex items-center justify-center text-sm font-bold text-zinc-600 hover:text-beige-600 transition-colors">
                          <Eye size={16} className="mr-2" /> View
                        </button>
                        <button
                          onClick={(e) => handleAction(e, catalog, 'download')}
                          disabled={downloadingKey === (catalog._id || catalog.id || catalog.title)}
                          className="flex items-center justify-center text-sm font-bold text-beige-600 hover:text-zinc-900 transition-colors disabled:opacity-70 disabled:cursor-wait"
                        >
                          {downloadingKey === (catalog._id || catalog.id || catalog.title) ? (
                            <>
                              <Loader2 size={16} className="mr-2 animate-spin" /> Downloading...
                            </>
                          ) : (
                            <>
                              <Download size={16} className="mr-2" /> Download
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Catalog;
