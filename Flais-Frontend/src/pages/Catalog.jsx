import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Download, Eye, Loader2, Filter, X } from 'lucide-react';
import SEO from '../components/SEO';
import catalogHeader from '../assets/catalog_header.jpg';
import api from '../utils/api';
import {
  getOptimizedImageUrl,
  getOptimizedVideoUrl,
  getRelativeMediaPath,
} from '../utils/imageOptimizer';

const Catalog = () => {
  const [pageSettings, setPageSettings] = useState({
    heroTitle: "DOWNLOAD CATALOGS",
    heroSubtitle: "Explore and download our premium vitrified tiles collection brochures.",
    heroMedia: ""
  });
  const [catalogsList, setCatalogsList] = useState([]);
  const [selectedSize, setSelectedSize] = useState('all');
  const [selectedThickness, setSelectedThickness] = useState('all');
  const [loading, setLoading] = useState(true);
  const [downloadingKey, setDownloadingKey] = useState(null);

  const splitFilterValues = (value) => {
    if (!value || typeof value !== 'string') return [];
    return value
      .split(/[,|/\n;]/g)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  const normalizeFilterKey = (value) => value.toLowerCase().replace(/\s+/g, ' ').trim();

  useEffect(() => {
    const fetchCatalogData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/catalog');
        if (res.data.success && res.data.catalog) {
          const page = res.data.catalog;
          if (page.pageSettings) setPageSettings(page.pageSettings);
          if (Array.isArray(page.catalogs)) {
            const sorted = [...page.catalogs].sort((a, b) => (a.sequenceNumber ?? 0) - (b.sequenceNumber ?? 0));
            setCatalogsList(sorted);
          }
        }
      } catch (err) {
        // Silent catch
      } finally {
        setLoading(false);
      }
    };
    fetchCatalogData();
  }, []);

  const catalogFilters = useMemo(() => {
    const sizes = new Map();
    const thicknesses = new Map();

    catalogsList.forEach((catalog) => {
      splitFilterValues(catalog.availableSizes).forEach((size) => {
        const key = normalizeFilterKey(size);
        if (!sizes.has(key)) sizes.set(key, size);
      });

      splitFilterValues(catalog.thickness).forEach((thickness) => {
        const key = normalizeFilterKey(thickness);
        if (!thicknesses.has(key)) thicknesses.set(key, thickness);
      });
    });

    return {
      sizes: [...sizes.values()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })),
      thicknesses: [...thicknesses.values()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })),
    };
  }, [catalogsList]);

  const filteredCatalogs = useMemo(() => {
    return catalogsList.filter((catalog) => {
      const catalogSizes = splitFilterValues(catalog.availableSizes).map(normalizeFilterKey);
      const catalogThicknesses = splitFilterValues(catalog.thickness).map(normalizeFilterKey);

      const matchesSize =
        selectedSize === 'all' ||
        catalogSizes.includes(normalizeFilterKey(selectedSize));

      const matchesThickness =
        selectedThickness === 'all' ||
        catalogThicknesses.includes(normalizeFilterKey(selectedThickness));

      return matchesSize && matchesThickness;
    });
  }, [catalogsList, selectedSize, selectedThickness]);

  const hasActiveFilters = selectedSize !== 'all' || selectedThickness !== 'all';
  const clearFilters = () => {
    setSelectedSize('all');
    setSelectedThickness('all');
  };

  const resolveCatalogUrl = (catalog) => {
    const link = catalog.link && catalog.link !== '#' ? catalog.link : catalog.image;
    return getOptimizedImageUrl(link);
  };

  const handleAction = (e, catalog, action) => {
    e.preventDefault();
    const link = resolveCatalogUrl(catalog);
    if (!link) return;

    if (action === 'view') {
      const pdfSource = catalog.link && catalog.link !== '#' ? catalog.link : catalog.image;
      const viewerPdf = getRelativeMediaPath(pdfSource) || pdfSource;
      const viewerParams = new URLSearchParams({
        pdf: viewerPdf,
        title: catalog.title || 'Catalog',
      });
      if (catalog.flipPath) {
        viewerParams.set('flip', catalog.flipPath);
      }
      window.open(`/catalog/view?${viewerParams.toString()}`, '_blank', 'noopener,noreferrer');
      return;
    }

    // action === 'download'
    const downloadKey = catalog._id || catalog.id || catalog.title;
    setDownloadingKey(downloadKey);

    const filename = `${(catalog.title || 'catalog').replace(/[^a-z0-9_-]+/gi, '_')}.pdf`;

    fetch(link)
      .then((response) => {
        if (!response.ok) throw new Error('Network response was not ok');
        return response.blob();
      })
      .then((blob) => {
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => {
        console.error('Download failed:', err);
        // Fallback: open in new tab if blob fetch fails
        window.open(link, '_blank');
      })
      .finally(() => {
        setDownloadingKey(null);
      });
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
    <div className="min-h-screen bg-zinc-50">
      <SEO
        title={pageSettings.heroTitle}
        description={pageSettings.heroSubtitle}
        keywords="download tile catalog, tiles brochure, tile collections PDF, vitrified tiles catalog"
      />
      {/* Header */}
      <section className="relative h-[300px] sm:h-[350px] md:h-[400px] flex items-center justify-center overflow-hidden">
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
        <div className="container-custom relative z-10 text-center space-y-4 pt-24 sm:pt-28 md:pt-32">
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
          <div className="mb-10 rounded-3xl border border-zinc-200 bg-white/90 p-5 sm:p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex items-center gap-2 text-zinc-900">
                  <Filter size={18} className="text-beige-700" />
                  <h2 className="text-xl sm:text-2xl font-display font-bold">Catalog Filters</h2>
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  Filter catalogs by the sizes and thickness values saved in the admin panel.
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <X size={14} />
                  Clear filters
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Available Sizes</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedSize('all')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      selectedSize === 'all'
                        ? 'bg-[#5D4037] text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    All Sizes
                  </button>
                  {catalogFilters.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        selectedSize === size
                          ? 'bg-[#5D4037] text-white'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                  {catalogFilters.sizes.length === 0 && (
                    <span className="text-sm text-zinc-400">No size values found yet.</span>
                  )}
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-zinc-500">Thickness</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedThickness('all')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                      selectedThickness === 'all'
                        ? 'bg-[#5D4037] text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                    }`}
                  >
                    All Thickness
                  </button>
                  {catalogFilters.thicknesses.map((thickness) => (
                    <button
                      key={thickness}
                      onClick={() => setSelectedThickness(thickness)}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                        selectedThickness === thickness
                          ? 'bg-[#5D4037] text-white'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                      }`}
                    >
                      {thickness}
                    </button>
                  ))}
                  {catalogFilters.thicknesses.length === 0 && (
                    <span className="text-sm text-zinc-400">No thickness values found yet.</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {catalogsList.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 max-w-md mx-auto bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm flex flex-col items-center">
              <svg className="w-16 h-16 text-zinc-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="font-semibold text-zinc-600 text-lg">No catalogs available</p>
              <p className="text-zinc-400 text-sm mt-1">Our team is currently preparing the digital catalogs. Please check back soon!</p>
            </div>
          ) : filteredCatalogs.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 max-w-md mx-auto bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm flex flex-col items-center">
              <svg className="w-16 h-16 text-zinc-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="font-semibold text-zinc-600 text-lg">No matching catalogs</p>
              <p className="text-zinc-400 text-sm mt-1">
                Try clearing the selected size or thickness filter.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 rounded-full bg-[#5D4037] px-4 py-2 text-sm font-semibold text-white"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-6 md:gap-10">
              {filteredCatalogs.map((catalog, index) => {
                return (
                  <motion.div
                    key={catalog._id || catalog.id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="group cursor-pointer max-w-sm mx-auto sm:max-w-none w-full"
                  >
                    {/* Cover Image — tall, full display */}
                    <div 
                      onClick={(e) => handleAction(e, catalog, 'view')}
                      className="relative overflow-hidden bg-zinc-100 flex items-center justify-center cursor-pointer" 
                      style={{ aspectRatio: '3/4' }}
                    >
                      {catalog.image ? (
                        <img loading="lazy"
                          src={getOptimizedImageUrl(catalog.image, 600)}
                          alt={catalog.title}
                          className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex flex-col items-center text-zinc-300">
                          <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                          <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">No Cover</span>
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="pt-4 text-center px-4">
                      <h3 className="font-display font-bold text-lg sm:text-xl text-zinc-900 group-hover:text-beige-600 transition-colors mb-2 sm:mb-3 leading-tight break-all sm:break-words">
                        {catalog.title}
                      </h3>

                      <div className="flex items-center justify-center text-sm font-semibold">
                        <button
                          onClick={(e) => handleAction(e, catalog, 'view')}
                          className="text-zinc-600 hover:text-beige-600 active:text-beige-600 transition-colors px-3 py-1"
                        >
                          View
                        </button>
                        <span className="text-zinc-300">|</span>
                        <button
                          onClick={(e) => handleAction(e, catalog, 'download')}
                          disabled={downloadingKey === (catalog._id || catalog.id || catalog.title)}
                          className="text-zinc-600 hover:text-beige-600 active:text-beige-600 transition-colors px-3 py-1 disabled:opacity-70 disabled:cursor-wait"
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
