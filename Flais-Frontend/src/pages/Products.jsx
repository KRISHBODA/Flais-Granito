import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import collectionsVideo from '../assets/Its_different_motion_logo.mp4';
import SEO from '../components/SEO';
import api from '../utils/api';
import useIntersectionVideoRef from '../hooks/useIntersectionVideoRef';
import { getOptimizedImageUrl, getOptimizedVideoUrl } from '../utils/imageOptimizer';

const ProductSkeleton = () => (
  <div className="p-4 pb-8 rounded-tl-[3.5rem] rounded-br-[3.5rem] rounded-tr-[1.25rem] rounded-bl-[1.25rem] bg-[#FAF8F5] border border-[#D2C9B1]/30 flex flex-col h-full animate-pulse">
    <div className="relative aspect-[3/4] overflow-hidden rounded-tl-[2.75rem] rounded-br-[2.75rem] rounded-tr-[0.85rem] rounded-bl-[0.85rem] bg-zinc-200" />
    <div className="pt-6 px-2 flex flex-col flex-1 space-y-4">
      <div className="h-4 w-20 bg-zinc-200 rounded" />
      <div className="h-8 w-3/4 bg-zinc-200 rounded" />
      <div className="h-10 w-28 bg-zinc-200 rounded mt-auto" />
    </div>
  </div>
);

const ProductImage = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`w-full h-full transition-all duration-300 ${!loaded ? 'animate-pulse bg-zinc-200' : ''}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      />
    </div>
  );
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState(searchParams.get('cat') || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const videoRef = useIntersectionVideoRef();

  const categoryParam = filter === 'all' ? '' : filter;

  // React Query hooks
  const { data: productsData = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', categoryParam, debouncedSearchQuery],
    queryFn: async () => {
      const res = await api.get(`/products?category=${categoryParam}&search=${debouncedSearchQuery}`);
      return res.data.products || [];
    }
  });

  const { data: categoriesData = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data.categories || [];
    }
  });

  const { data: collectionSettingsData } = useQuery({
    queryKey: ['collection-settings'],
    queryFn: async () => {
      const res = await api.get('/collection');
      return res.data.collection || {
        bannerVideo: "",
        title: "Our Tile Collection",
        desc: "Explore FLAIS GRANITO's premium tile catalog. Discover high-quality vitrified, glazed, and ceramic tiles with multiple sizing, looks, and finishes."
      };
    }
  });

  const { data: filterOptionsData = [] } = useQuery({
    queryKey: ['filter-options'],
    queryFn: async () => {
      const res = await api.get('/filter-options');
      return res.data.options || [];
    }
  });

  // Derived states
  const products = productsData;
  const categories = categoriesData;
  const loading = productsLoading;
  const collectionSettings = useMemo(() => {
    return collectionSettingsData || {
      bannerVideo: "",
      title: "Our Tile Collection",
      desc: "Explore FLAIS GRANITO's premium tile catalog. Discover high-quality vitrified, glazed, and ceramic tiles with multiple sizing, looks, and finishes."
    };
  }, [collectionSettingsData]);

  const dbThicknessOptions = useMemo(() => filterOptionsData.filter(o => o.type === 'thickness'), [filterOptionsData]);
  const dbSizeOptions = useMemo(() => filterOptionsData.filter(o => o.type === 'size'), [filterOptionsData]);
  const dbApplicationOptions = useMemo(() => filterOptionsData.filter(o => o.type === 'application'), [filterOptionsData]);

  const [visibleCount, setVisibleCount] = useState(20);

  // Additional frontend-only filters (mocked/optional based on backend schema)
  const [thicknessFilter, setThicknessFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [appFilter, setAppFilter] = useState('all');
  const [lookFilter, setLookFilter] = useState('all');

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    const cat = searchParams.get('cat');
    if (cat) setFilter(cat);
  }, [searchParams]);

  useEffect(() => {
    setVisibleCount(20);
  }, [filter, debouncedSearchQuery, thicknessFilter, sizeFilter, appFilter, lookFilter]);

  // Keep local filtering for custom UI attributes not in backend schema yet
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      // product.title handles search and category handles category already via API,
      // but we apply local filters if they happen to have these properties (or mock them)
      const matchesThickness = thicknessFilter === 'all' || product.thickness?.toLowerCase() === thicknessFilter.toLowerCase();
      const matchesSize = sizeFilter === 'all' || product.size?.toLowerCase().includes(sizeFilter.toLowerCase());
      const matchesApp = appFilter === 'all' || 
        product.application?.toLowerCase() === appFilter.toLowerCase() ||
        (appFilter.toLowerCase() === 'floor' && product.application?.toLowerCase().includes('floor')) ||
        (appFilter.toLowerCase() === 'wall' && product.application?.toLowerCase().includes('wall'));
      const matchesLook = lookFilter === 'all' || product.look?.toLowerCase() === lookFilter.toLowerCase();

      return matchesThickness && matchesSize && matchesApp && matchesLook;
    });
  }, [products, thicknessFilter, sizeFilter, appFilter, lookFilter]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const observer = useRef();
  const sentinelRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        setVisibleCount(prev => prev + 20);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setSearchParams(newFilter === 'all' ? {} : { cat: newFilter });
  };

  const clearAllFilters = () => {
    setFilter('all');
    setThicknessFilter('all');
    setSizeFilter('all');
    setAppFilter('all');
    setLookFilter('all');
    setSearchQuery('');
    setSearchParams({});
  };

  // Loaded dynamically from MongoDB API

  const isVideo = useMemo(() => {
    const media = collectionSettings.bannerVideo;
    if (!media) return true; // fallback is default mp4 video
    return (
      /^data:video\//i.test(media) ||
      /\.(mp4|webm|ogg|mov|m4v|avi|mkv)(\?.*)?$/i.test(media)
    );
  }, [collectionSettings.bannerVideo]);

  const isImage = useMemo(() => {
    const media = collectionSettings.bannerVideo;
    if (!media) return false;
    return (
      /^data:image\//i.test(media) ||
      /\.(png|jpe?g|webp|gif|avif|bmp|svg)(\?.*)?$/i.test(media)
    );
  }, [collectionSettings.bannerVideo]);

  const bannerMedia = collectionSettings.bannerVideo 
    ? (isImage ? getOptimizedImageUrl(collectionSettings.bannerVideo, 1200) : getOptimizedVideoUrl(collectionSettings.bannerVideo))
    : collectionsVideo;

  return (
    <div className="pt-24 min-h-screen bg-white">
      <SEO 
        title={filter === 'all' ? collectionSettings.title : `${filter} Collection`}
        description={filter === 'all' ? collectionSettings.desc : `Explore FLAIS GRANITO's premium ${filter} tile catalog. Discover high-quality vitrified, glazed, and ceramic tiles with multiple sizing, looks, and finishes.`}
        keywords={`flais granito, tiles catalog, vitrified tiles catalog, ${filter} tiles, floor tiles, wall tiles, Porcelain Slabs, Large Format Slabs, 1600x3200 Porcelain Slabs, 1200x2400 Porcelain Slabs, Sintered Stone Slabs, Book Match Porcelain Slabs, Marble Look Porcelain Slabs, High Gloss Porcelain Slabs, Matte Finish Porcelain Slabs, Calacatta Porcelain Slabs, Statuario Porcelain Slabs, Onyx Porcelain Slabs`}
      />
      {/* Hero Section */}
      <section className="bg-white py-2 flex items-center justify-center overflow-hidden">
        <div className="container-custom text-center">
          <div
            className="w-full mx-auto rounded-2xl overflow-hidden animate-fade-in-scale"
            style={{
              willChange: 'transform, opacity',
              aspectRatio: '1000 / 538',
              maxWidth: '836px',
            }}
          >
            {isVideo ? (
              <video ref={videoRef}
                preload="none"
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover block"
                key={collectionSettings.bannerVideo}
              >
                <source src={bannerMedia} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : isImage ? (
              <img
                src={getOptimizedImageUrl(bannerMedia, 1200)}
                alt={collectionSettings.title}
                className="w-full h-full object-cover block"
              />
            ) : (
              <video ref={videoRef}
                preload="none"
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover block"
                key={bannerMedia}
              >
                <source src={bannerMedia} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      </section>

      {/* Main Layout */}
      <section className="py-6 md:py-10">
        <div className="container-custom flex flex-col lg:flex-row gap-12 lg:gap-16">

          {/* Sidebar */}
          <aside className="w-full lg:w-[280px] flex-shrink-0">
            <div className="sticky top-32 space-y-12">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-zinc-900">Filters</h2>
                {(filter !== 'all' || thicknessFilter !== 'all' || sizeFilter !== 'all' || appFilter !== 'all' || lookFilter !== 'all' || searchQuery !== '') && (
                  <button onClick={clearAllFilters} className="text-xs font-bold text-beige-700 hover:underline uppercase tracking-widest">
                    Clear All
                  </button>
                )}
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-zinc-200 rounded-lg pl-10 py-2 focus:outline-none focus:border-zinc-400"
                />
                <Search size={18} className="absolute left-3 top-2.5 text-zinc-400" />
              </div>

              {/* Category Filter from Backend */}
              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-6 border-b-2 border-zinc-900 pb-1 inline-block">
                  Category
                </h3>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => handleFilterChange('all')}
                      className={`flex items-center text-left w-full px-4 py-2 transition-all text-[14px] group rounded-lg ${filter === 'all' ? 'bg-[#5D4037] text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                    >
                      <span className={`mr-3 transition-colors ${filter === 'all' ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-500'}`}>→</span> All Collections
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat._id || cat.slug}>
                      <button
                        onClick={() => handleFilterChange(cat.name)}
                        className={`flex items-center text-left w-full px-4 py-2 transition-all text-[14px] group rounded-lg ${filter === cat.name ? 'bg-[#5D4037] text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                      >
                        <span className={`mr-3 transition-colors ${filter === cat.name ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-500'}`}>→</span> {cat.name}
                      </button>
                    </li>
                  ))}
                  {/* Fallback local categories just in case DB is empty */}
                  {categories.length === 0 && ['GVT/PGVT', 'Color body', 'Full body'].map((catName) => (
                    <li key={catName}>
                      <button
                        onClick={() => handleFilterChange(catName)}
                        className={`flex items-center text-left w-full px-4 py-2 transition-all text-[14px] group rounded-lg ${filter === catName ? 'bg-[#5D4037] text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                      >
                        <span className={`mr-3 transition-colors ${filter === catName ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-500'}`}>→</span> {catName}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Other Static Filters... */}
              {/* Thickness Filter */}
              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-6 border-b-2 border-zinc-900 pb-1 inline-block">
                  Thickness
                </h3>
                <ul className="space-y-1">
                  {[
                    { value: 'all', label: 'All Thickness' },
                    ...dbThicknessOptions.map(opt => ({ value: opt.value, label: opt.label }))
                  ].map((thick) => (
                    <li key={thick.value}>
                      <button
                        onClick={() => setThicknessFilter(thick.value)}
                        className={`flex items-center text-left w-full px-4 py-2 transition-all text-[14px] group rounded-lg ${thicknessFilter === thick.value ? 'bg-[#5D4037] text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                      >
                        <span className={`mr-3 transition-colors ${thicknessFilter === thick.value ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-500'}`}>→</span> {thick.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-6 border-b-2 border-zinc-900 pb-1 inline-block">
                  Available Size
                </h3>
                <ul className="space-y-1">
                  {[
                    { value: 'all', label: 'All Sizes' },
                    ...dbSizeOptions.map(opt => ({ value: opt.value, label: opt.label }))
                  ].map((size) => (
                    <li key={size.value}>
                      <button
                        onClick={() => setSizeFilter(size.value)}
                        className={`flex items-center text-left w-full px-4 py-2 transition-all text-[14px] group rounded-lg ${sizeFilter === size.value ? 'bg-[#5D4037] text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                      >
                        <span className={`mr-3 transition-colors ${sizeFilter === size.value ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-500'}`}>→</span> {size.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Application Filter */}
              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-6 border-b-2 border-zinc-900 pb-1 inline-block">
                  Application
                </h3>
                <ul className="space-y-1">
                  {[
                    { value: 'all', label: 'All Applications' },
                    ...dbApplicationOptions.map(opt => ({ value: opt.value, label: opt.label }))
                  ].map((app) => (
                    <li key={app.value}>
                      <button
                        onClick={() => setAppFilter(app.value)}
                        className={`flex items-center text-left w-full px-4 py-2 transition-all text-[14px] group rounded-lg ${appFilter === app.value ? 'bg-[#5D4037] text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                      >
                        <span className={`mr-3 transition-colors ${appFilter === app.value ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-500'}`}>→</span> {app.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </aside>

          {/* Product Grid */}
          <div className="w-full lg:flex-1">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, idx) => (
                  <ProductSkeleton key={idx} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {visibleProducts.map((product, index) => (
                    <div
                      key={product._id}
                      className="p-4 pb-8 rounded-tl-[3.5rem] rounded-br-[3.5rem] rounded-tr-[1.25rem] rounded-bl-[1.25rem] bg-[#FAF8F5] border border-[#D2C9B1]/30 group flex flex-col h-full transform-gpu animate-slide-up transition-all duration-500 hover:shadow-xl hover:border-[#5D4037]/30"
                      style={{
                        animationFillMode: 'both',
                        animationDelay: `${(index % 6) * 100}ms`
                      }}
                    >
                      <Link to={`/products/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden rounded-tl-[2.75rem] rounded-br-[2.75rem] rounded-tr-[0.85rem] rounded-bl-[0.85rem] bg-zinc-100 transform-gpu">
                        <ProductImage
                          src={getOptimizedImageUrl(product.images && product.images.length > 0 ? product.images[0] : (product.image || 'https://via.placeholder.com/400x400?text=No+Image'), 600)}
                          alt={product.title || product.name}
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                      </Link>
                      <div className="pt-6 px-2 flex flex-col flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#5D4037] bg-[#5D4037]/5 px-2.5 py-0.5 rounded border border-[#5D4037]/10">{product.category || 'Standard'}</span>
                        </div>
                        <h3 className="font-sans font-bold text-2xl text-zinc-900 mb-6">
                          {product.title || product.name}
                        </h3>


                        {/* View More Button */}
                        <div className="mt-auto">
                          <Link to={`/products/${product.slug || product._id}`} className="inline-flex items-center group/btn relative py-2">
                            <div className="absolute left-[-12px] w-10 h-10 bg-[#D2C9B1] rounded-full transition-all duration-500 ease-out group-hover/btn:w-[calc(100%+24px)] group-hover/btn:bg-[#5D4037]"></div>
                            <span className="relative z-10 flex items-center text-sm font-medium text-zinc-900 group-hover/btn:text-white transition-colors duration-300 pl-4">
                              View More <ArrowRight size={16} className="ml-3 transition-transform duration-300 group-hover/btn:translate-x-1" />
                            </span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {visibleCount < filteredProducts.length && (
                  <div ref={sentinelRef} className="w-full h-20 flex items-center justify-center mt-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-beige-600"></div>
                  </div>
                )}

                {filteredProducts.length === 0 && (
                  <div className="text-center py-32 bg-zinc-50 mt-8 rounded-3xl border-2 border-dashed border-zinc-100">
                    <p className="text-zinc-400 text-xl font-medium">No pieces found matching your criteria.</p>
                    <button
                      onClick={clearAllFilters}
                      className="mt-6 text-[#5D4037] font-bold tracking-widest uppercase text-sm hover:underline"
                    >
                      Clear all filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Products;
