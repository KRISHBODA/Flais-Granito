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

  const handleAction = (e, catalog, action) => {
    e.preventDefault();
    const link = resolveCatalogUrl(catalog);
    if (!link) return;

    if (action === 'view') {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }

    // action === 'download'
    const downloadKey = catalog._id || catalog.id || catalog.title;
    setDownloadingKey(downloadKey);
    setTimeout(() => {
      setDownloadingKey(null);
    }, 1500); // 1.5s temporary feedback

    const a = document.createElement('a');
    a.href = link;
    a.download = `${(catalog.title || 'catalog').replace(/[^a-z0-9_-]+/gi, '_')}.pdf`;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
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
                    className="group cursor-pointer"
                  >
                    {/* Cover Image — tall, full display */}
                    <div className="relative overflow-hidden bg-zinc-100 flex items-center justify-center" style={{ aspectRatio: '3/4' }}>
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

                      {/* Hover Overlay */}
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
                    <div className="pt-5 text-center">
                      <h3 className="font-display font-bold text-xl text-zinc-900 group-hover:text-beige-600 transition-colors mb-3">
                        {catalog.title}
                      </h3>

                      <div className="flex items-center justify-center gap-0 text-sm font-semibold">
                        <button
                          onClick={(e) => handleAction(e, catalog, 'view')}
                          className="text-zinc-600 hover:text-beige-600 transition-colors px-3"
                        >
                          View
                        </button>
                        <span className="text-zinc-300">|</span>
                        <button
                          onClick={(e) => handleAction(e, catalog, 'download')}
                          disabled={downloadingKey === (catalog._id || catalog.id || catalog.title)}
                          className="text-zinc-600 hover:text-beige-600 transition-colors px-3 disabled:opacity-70 disabled:cursor-wait"
                        >
                          {downloadingKey === (catalog._id || catalog.id || catalog.title) ? 'Downloading...' : 'Download'}
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
