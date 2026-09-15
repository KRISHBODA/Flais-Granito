import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [filter, setFilter] = useState('all');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [thicknessFilter, setThicknessFilter] = useState('all');
  const [sizeFilter, setSizeFilter] = useState('all');
  const [appFilter, setAppFilter] = useState('all');
  const [lookFilter, setLookFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(20);
  const videoRef = useIntersectionVideoRef();

  // React Query hooks - fetch products (filtered by search if any)
  const { data: productsData = [], isLoading: productsLoading } = useQuery({
    queryKey: ['products', debouncedSearchQuery],
    queryFn: async () => {
      const res = await api.get(`/products?search=${debouncedSearchQuery}&limit=all`);
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

  const normalizeFilterString = useCallback((value, removeSpaces = false) => {
    let str = (value || '')
      .toString()
      .toLowerCase()
      .replace(/×/g, 'x')
      .replace(/&/g, ' and ')
      .replace(/(mm|cm|inches|inch|in)/gi, '');
    
    if (removeSpaces) {
      return str.replace(/[^a-z0-9x]+/g, '');
    }
    
    return str
      .replace(/[^a-z0-9x ]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }, []);

  const resolveCategoryFromParam = useCallback((catParam) => {
    if (!catParam) return { name: 'all', slug: 'all' };
    const match = categories.find(
      (cat) => cat.slug === catParam || cat.name.toLowerCase() === catParam.toLowerCase()
    );
    if (match) return { name: match.name, slug: match.slug };
    return { name: catParam, slug: catParam };
  }, [categories]);

  const updateQueryParams = useCallback((newValues) => {
    setSearchParams((prevParams) => {
      const nextParams = new URLSearchParams(prevParams);
      Object.entries(newValues).forEach(([key, val]) => {
        if (!val || val === 'all') {
          nextParams.delete(key);
        } else {
          nextParams.set(key, val);
        }
      });
      return nextParams;
    });
  }, [setSearchParams]);

  // Restore saved query params from sessionStorage on initial load if URL search is empty
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const currentSearch = searchParams.toString();
    const savedQuery = sessionStorage.getItem('flais:products-query');
    if (!currentSearch && savedQuery) {
      setSearchParams(new URLSearchParams(savedQuery), { replace: true });
    }
  }, []);

  // Sync states with URL searchParams
  useEffect(() => {
    const catParam = searchParams.get('cat');
    const { name, slug } = resolveCategoryFromParam(catParam);
    setFilter(name);
    setSelectedCategorySlug(slug);

    const sizeParam = searchParams.get('size');
    setSizeFilter(sizeParam || 'all');

    const thicknessParam = searchParams.get('thickness');
    setThicknessFilter(thicknessParam || 'all');

    const appParam = searchParams.get('app');
    setAppFilter(appParam || 'all');

    const lookParam = searchParams.get('look');
    setLookFilter(lookParam || 'all');

    const searchParam = searchParams.get('search');
    if (searchParam !== null) {
      setSearchQuery(searchParam);
      setDebouncedSearchQuery(searchParam);
    } else if (searchParams.toString() === '') {
      setSearchQuery('');
      setDebouncedSearchQuery('');
    }
  }, [searchParams, resolveCategoryFromParam]);

  const selectedCategoryName = filter === 'all' ? null : filter;

  const dbThicknessOptions = useMemo(() => filterOptionsData.filter(o => o.type === 'thickness'), [filterOptionsData]);
  const dbSizeOptions = useMemo(() => filterOptionsData.filter(o => o.type === 'size'), [filterOptionsData]);
  const dbApplicationOptions = useMemo(() => filterOptionsData.filter(o => o.type === 'application'), [filterOptionsData]);

  // Matching helper functions
  const productMatchesCategory = useCallback((product, targetCat) => {
    if (!targetCat || targetCat === 'all') return true;
    if (!product || !product.category) return false;
    const pCat = product.category.trim().toLowerCase();
    const tCat = targetCat.trim().toLowerCase();
    if (pCat === tCat) return true;
    const catObj = categories.find(c => (c.slug && c.slug.toLowerCase() === tCat) || (c.name && c.name.toLowerCase() === tCat));
    if (catObj && catObj.name.toLowerCase() === pCat) return true;
    return false;
  }, [categories]);

  const productMatchesThickness = useCallback((productThickness, optValue) => {
    if (!optValue || optValue === 'all') return true;
    const pNorm = normalizeFilterString(productThickness, true);
    const optNorm = normalizeFilterString(optValue, true);
    if (!pNorm || !optNorm) return false;
    return pNorm === optNorm || pNorm.includes(optNorm) || optNorm.includes(pNorm);
  }, [normalizeFilterString]);

  const productMatchesSize = useCallback((productSize, optValue) => {
    if (!optValue || optValue === 'all') return true;
    const pNorm = normalizeFilterString(productSize, true);
    const optNorm = normalizeFilterString(optValue, true);
    if (!pNorm || !optNorm) return false;
    return pNorm === optNorm || pNorm.includes(optNorm) || optNorm.includes(pNorm);
  }, [normalizeFilterString]);

  const productMatchesApp = useCallback((productApp, optValue) => {
    if (!optValue || optValue === 'all') return true;
    const pNorm = normalizeFilterString(productApp, false);
    const optNorm = normalizeFilterString(optValue, false);
    if (!pNorm || !optNorm) return false;
    return pNorm.includes(optNorm) || optNorm.includes(pNorm);
  }, [normalizeFilterString]);

  // Dynamic Faceted Calculations
  // Facet 1: Available Categories (evaluated against active Size, Thickness, Application)
  const productsForCategoryFacet = useMemo(() => {
    return products.filter(p => {
      const matchesSize = sizeFilter === 'all' || productMatchesSize(p.size, sizeFilter);
      const matchesThickness = thicknessFilter === 'all' || productMatchesThickness(p.thickness, thicknessFilter);
      const matchesApp = appFilter === 'all' || productMatchesApp(p.application, appFilter);
      return matchesSize && matchesThickness && matchesApp;
    });
  }, [products, sizeFilter, thicknessFilter, appFilter, productMatchesSize, productMatchesThickness, productMatchesApp]);

  const availableCategories = useMemo(() => {
    if (!productsForCategoryFacet || productsForCategoryFacet.length === 0) return [];
    
    // Categories from DB that have at least 1 matching product
    const matched = categories.filter(cat =>
      productsForCategoryFacet.some(p => productMatchesCategory(p, cat.name) || productMatchesCategory(p, cat.slug))
    );
    if (matched.length > 0) return matched;
    
    // Fallback if DB categories empty
    const uniqueCatNames = [...new Set(productsForCategoryFacet.map(p => p.category).filter(Boolean))];
    return uniqueCatNames.map(name => ({
      _id: name,
      name,
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    }));
  }, [productsForCategoryFacet, categories, productMatchesCategory]);

  // Facet 2: Available Thickness (evaluated against active Category, Size, Application)
  const productsForThicknessFacet = useMemo(() => {
    return products.filter(p => {
      const matchesCat = filter === 'all' || productMatchesCategory(p, filter);
      const matchesSize = sizeFilter === 'all' || productMatchesSize(p.size, sizeFilter);
      const matchesApp = appFilter === 'all' || productMatchesApp(p.application, appFilter);
      return matchesCat && matchesSize && matchesApp;
    });
  }, [products, filter, sizeFilter, appFilter, productMatchesCategory, productMatchesSize, productMatchesApp]);

  const availableThicknessOptions = useMemo(() => {
    if (!productsForThicknessFacet || productsForThicknessFacet.length === 0) return [];
    
    const matched = dbThicknessOptions.filter(opt =>
      productsForThicknessFacet.some(p => productMatchesThickness(p.thickness, opt.value))
    );
    if (matched.length > 0) return matched;

    const unique = [...new Set(productsForThicknessFacet.map(p => p.thickness).filter(Boolean))];
    return unique.map(t => ({ value: t, label: t }));
  }, [productsForThicknessFacet, dbThicknessOptions, productMatchesThickness]);

  // Facet 3: Available Size (evaluated against active Category, Thickness, Application)
  const productsForSizeFacet = useMemo(() => {
    return products.filter(p => {
      const matchesCat = filter === 'all' || productMatchesCategory(p, filter);
      const matchesThickness = thicknessFilter === 'all' || productMatchesThickness(p.thickness, thicknessFilter);
      const matchesApp = appFilter === 'all' || productMatchesApp(p.application, appFilter);
      return matchesCat && matchesThickness && matchesApp;
    });
  }, [products, filter, thicknessFilter, appFilter, productMatchesCategory, productMatchesThickness, productMatchesApp]);

  const availableSizeOptions = useMemo(() => {
    if (!productsForSizeFacet || productsForSizeFacet.length === 0) return [];
    
    const matched = dbSizeOptions.filter(opt =>
      productsForSizeFacet.some(p => productMatchesSize(p.size, opt.value))
    );
    if (matched.length > 0) return matched;

    const unique = [...new Set(productsForSizeFacet.map(p => p.size).filter(Boolean))];
    return unique.map(s => ({ value: s, label: s }));
  }, [productsForSizeFacet, dbSizeOptions, productMatchesSize]);

  // Facet 4: Available Application (evaluated against active Category, Size, Thickness)
  const productsForAppFacet = useMemo(() => {
    return products.filter(p => {
      const matchesCat = filter === 'all' || productMatchesCategory(p, filter);
      const matchesSize = sizeFilter === 'all' || productMatchesSize(p.size, sizeFilter);
      const matchesThickness = thicknessFilter === 'all' || productMatchesThickness(p.thickness, thicknessFilter);
      return matchesCat && matchesSize && matchesThickness;
    });
  }, [products, filter, sizeFilter, thicknessFilter, productMatchesCategory, productMatchesSize, productMatchesThickness]);

  const availableApplicationOptions = useMemo(() => {
    if (!productsForAppFacet || productsForAppFacet.length === 0) return [];
    
    const matched = dbApplicationOptions.filter(opt =>
      productsForAppFacet.some(p => productMatchesApp(p.application, opt.value))
    );
    if (matched.length > 0) return matched;

    const unique = [...new Set(productsForAppFacet.map(p => p.application).filter(Boolean))];
    return unique.map(a => ({ value: a, label: a }));
  }, [productsForAppFacet, dbApplicationOptions, productMatchesApp]);

  const thicknessOptionsToRender = useMemo(() => {
    if (availableThicknessOptions.length > 0) {
      return [
        { value: 'all', label: 'All Thickness' },
        ...availableThicknessOptions
      ];
    }
    return [];
  }, [availableThicknessOptions]);

  const sizeOptionsToRender = useMemo(() => {
    if (availableSizeOptions.length > 0) {
      return [
        { value: 'all', label: 'All Sizes' },
        ...availableSizeOptions
      ];
    }
    return [];
  }, [availableSizeOptions]);

  const appOptionsToRender = useMemo(() => {
    if (availableApplicationOptions.length > 0) {
      return [
        { value: 'all', label: 'All Applications' },
        ...availableApplicationOptions
      ];
    }
    return [];
  }, [availableApplicationOptions]);

  // Active option checkers
  const isCategoryActive = useCallback((catName, catSlug) => {
    if (catName === 'all' || catSlug === 'all') {
      return filter === 'all' || !availableCategories.some(c => 
        (c.name && c.name.toLowerCase() === filter.toLowerCase()) || (c.slug && c.slug === selectedCategorySlug)
      );
    }
    if (filter === 'all') return false;
    return (
      (filter && filter.toLowerCase() === catName.toLowerCase()) ||
      (selectedCategorySlug && selectedCategorySlug === catSlug)
    );
  }, [availableCategories, filter, selectedCategorySlug]);

  const isThicknessActive = useCallback((thickVal) => {
    const currentNorm = normalizeFilterString(thicknessFilter, true);
    const valNorm = normalizeFilterString(thickVal, true);
    if (thickVal === 'all') {
      return thicknessFilter === 'all' || !availableThicknessOptions.some(opt => 
        normalizeFilterString(opt.value, true) === currentNorm
      );
    }
    if (thicknessFilter === 'all') return false;
    return currentNorm === valNorm || currentNorm.includes(valNorm) || valNorm.includes(currentNorm);
  }, [availableThicknessOptions, thicknessFilter, normalizeFilterString]);

  const isSizeActive = useCallback((sizeVal) => {
    const currentNorm = normalizeFilterString(sizeFilter, true);
    const valNorm = normalizeFilterString(sizeVal, true);
    if (sizeVal === 'all') {
      return sizeFilter === 'all' || !availableSizeOptions.some(opt => 
        normalizeFilterString(opt.value, true) === currentNorm
      );
    }
    if (sizeFilter === 'all') return false;
    return currentNorm === valNorm || currentNorm.includes(valNorm) || valNorm.includes(currentNorm);
  }, [availableSizeOptions, sizeFilter, normalizeFilterString]);

  const isAppActive = useCallback((appVal) => {
    const currentNorm = normalizeFilterString(appFilter, false);
    const valNorm = normalizeFilterString(appVal, false);
    if (appVal === 'all') {
      return appFilter === 'all' || !availableApplicationOptions.some(opt => 
        normalizeFilterString(opt.value, false) === currentNorm
      );
    }
    if (appFilter === 'all') return false;
    return currentNorm === valNorm || currentNorm.includes(valNorm) || valNorm.includes(currentNorm);
  }, [availableApplicationOptions, appFilter, normalizeFilterString]);

  const savePageState = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('flais:products-scroll-y', String(window.scrollY || 0));
    sessionStorage.setItem('flais:products-query', searchParams.toString());
  };

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Sync debounced search query with URL query params
  useEffect(() => {
    const currentSearchParam = searchParams.get('search') || '';
    if (debouncedSearchQuery !== currentSearchParam) {
      updateQueryParams({ search: debouncedSearchQuery || null });
    }
  }, [debouncedSearchQuery, searchParams, updateQueryParams]);

  useEffect(() => {
    setVisibleCount(20);
  }, [filter, debouncedSearchQuery, thicknessFilter, sizeFilter, appFilter, lookFilter]);

  // Local filtering for all criteria
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const matchesCategory = filter === 'all' || productMatchesCategory(product, filter);
      const matchesThickness = thicknessFilter === 'all' || productMatchesThickness(product.thickness, thicknessFilter);
      const matchesSize = sizeFilter === 'all' || productMatchesSize(product.size, sizeFilter);
      const matchesApp = appFilter === 'all' || productMatchesApp(product.application, appFilter);
      const matchesLook = lookFilter === 'all' || (
        product.look && (
          normalizeFilterString(product.look, false).includes(normalizeFilterString(lookFilter, false))
        )
      );

      return matchesCategory && matchesThickness && matchesSize && matchesApp && matchesLook;
    });
  }, [products, filter, thicknessFilter, sizeFilter, appFilter, lookFilter, productMatchesCategory, productMatchesThickness, productMatchesSize, productMatchesApp, normalizeFilterString]);

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

  // Intelligent click handlers with toggle support and cross-facet compatibility
  const handleFilterChange = (categoryName, categorySlug) => {
    const slugToUse = categorySlug ?? categoryName;
    const isCurrentlyActive = (filter === categoryName) || (selectedCategorySlug === slugToUse);
    const newCat = isCurrentlyActive || slugToUse === 'all' ? null : slugToUse;

    let newSize = sizeFilter === 'all' ? null : sizeFilter;
    let newThick = thicknessFilter === 'all' ? null : thicknessFilter;
    let newApp = appFilter === 'all' ? null : appFilter;

    if (newCat) {
      const prodsInNewCat = products.filter(p => productMatchesCategory(p, newCat));
      if (newSize && !prodsInNewCat.some(p => productMatchesSize(p.size, newSize))) {
        newSize = null;
      }
      if (newThick && !prodsInNewCat.some(p => productMatchesThickness(p.thickness, newThick))) {
        newThick = null;
      }
      if (newApp && !prodsInNewCat.some(p => productMatchesApp(p.application, newApp))) {
        newApp = null;
      }
    }

    updateQueryParams({
      cat: newCat,
      size: newSize,
      thickness: newThick,
      app: newApp
    });
  };

  const handleThicknessChange = (thickVal) => {
    const isCurrentlyActive = isThicknessActive(thickVal);
    const newThick = isCurrentlyActive || thickVal === 'all' ? null : thickVal;

    let newCat = selectedCategorySlug === 'all' || filter === 'all' ? null : selectedCategorySlug;
    let newSize = sizeFilter === 'all' ? null : sizeFilter;
    let newApp = appFilter === 'all' ? null : appFilter;

    if (newThick) {
      const prodsInNewThick = products.filter(p => productMatchesThickness(p.thickness, newThick));
      if (newCat && !prodsInNewThick.some(p => productMatchesCategory(p, newCat))) {
        newCat = null;
      }
      if (newSize && !prodsInNewThick.some(p => productMatchesSize(p.size, newSize))) {
        newSize = null;
      }
      if (newApp && !prodsInNewThick.some(p => productMatchesApp(p.application, newApp))) {
        newApp = null;
      }
    }

    updateQueryParams({
      thickness: newThick,
      cat: newCat,
      size: newSize,
      app: newApp
    });
  };

  const handleSizeChange = (sizeVal) => {
    const isCurrentlyActive = isSizeActive(sizeVal);
    const newSize = isCurrentlyActive || sizeVal === 'all' ? null : sizeVal;

    let newCat = selectedCategorySlug === 'all' || filter === 'all' ? null : selectedCategorySlug;
    let newThick = thicknessFilter === 'all' ? null : thicknessFilter;
    let newApp = appFilter === 'all' ? null : appFilter;

    if (newSize) {
      const prodsInNewSize = products.filter(p => productMatchesSize(p.size, newSize));
      if (newCat && !prodsInNewSize.some(p => productMatchesCategory(p, newCat))) {
        newCat = null;
      }
      if (newThick && !prodsInNewSize.some(p => productMatchesThickness(p.thickness, newThick))) {
        newThick = null;
      }
      if (newApp && !prodsInNewSize.some(p => productMatchesApp(p.application, newApp))) {
        newApp = null;
      }
    }

    updateQueryParams({
      size: newSize,
      cat: newCat,
      thickness: newThick,
      app: newApp
    });
  };

  const handleAppChange = (appVal) => {
    const isCurrentlyActive = isAppActive(appVal);
    const newApp = isCurrentlyActive || appVal === 'all' ? null : appVal;

    let newCat = selectedCategorySlug === 'all' || filter === 'all' ? null : selectedCategorySlug;
    let newSize = sizeFilter === 'all' ? null : sizeFilter;
    let newThick = thicknessFilter === 'all' ? null : thicknessFilter;

    if (newApp) {
      const prodsInNewApp = products.filter(p => productMatchesApp(p.application, newApp));
      if (newCat && !prodsInNewApp.some(p => productMatchesCategory(p, newCat))) {
        newCat = null;
      }
      if (newSize && !prodsInNewApp.some(p => productMatchesSize(p.size, newSize))) {
        newSize = null;
      }
      if (newThick && !prodsInNewApp.some(p => productMatchesThickness(p.thickness, newThick))) {
        newThick = null;
      }
    }

    updateQueryParams({
      app: newApp,
      cat: newCat,
      size: newSize,
      thickness: newThick
    });
  };

  const clearAllFilters = () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('flais:products-query');
    }
    setFilter('all');
    setSelectedCategorySlug('all');
    setThicknessFilter('all');
    setSizeFilter('all');
    setAppFilter('all');
    setLookFilter('all');
    setSearchQuery('');
    setDebouncedSearchQuery('');
    setSearchParams({}, { replace: true });
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
        title={filter === 'all' ? collectionSettings.title : `${selectedCategoryName || filter} Collection`}
        description={filter === 'all' ? collectionSettings.desc : `Explore FLAIS GRANITO's premium ${selectedCategoryName || filter} tile catalog. Discover high-quality vitrified, glazed, and ceramic tiles with multiple sizing, looks, and finishes.`}
        keywords={`flais granito, tiles catalog, vitrified tiles catalog, ${selectedCategoryName || filter} tiles, floor tiles, wall tiles, Porcelain Slabs, Large Format Slabs, 1600x3200 Porcelain Slabs, 1200x2400 Porcelain Slabs, Sintered Stone Slabs, Book Match Porcelain Slabs, Marble Look Porcelain Slabs, High Gloss Porcelain Slabs, Matte Finish Porcelain Slabs, Calacatta Porcelain Slabs, Statuario Porcelain Slabs, Onyx Porcelain Slabs`}
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
                      onClick={() => handleFilterChange('all','all')}
                      className={`flex items-center text-left w-full px-4 py-2 transition-all text-[14px] group rounded-lg ${isCategoryActive('all', 'all') ? 'bg-[#5D4037] text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                    >
                      <span className={`mr-3 transition-colors ${isCategoryActive('all', 'all') ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-500'}`}>→</span> All Collections
                    </button>
                  </li>
                  <AnimatePresence>
                    {availableCategories.map((cat) => (
                      <motion.li
                        key={cat._id || cat.slug || cat.name}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <button
                          onClick={() => handleFilterChange(cat.name, cat.slug)}
                          className={`flex items-center text-left w-full px-4 py-2 transition-all text-[14px] group rounded-lg ${isCategoryActive(cat.name, cat.slug) ? 'bg-[#5D4037] text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                        >
                          <span className={`mr-3 transition-colors ${isCategoryActive(cat.name, cat.slug) ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-500'}`}>→</span> {cat.name}
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                  {availableCategories.length === 0 && (
                    <li className="text-sm text-zinc-400 px-4 py-1">No collections available.</li>
                  )}
                </ul>
              </div>

              {/* Thickness Filter */}
              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-6 border-b-2 border-zinc-900 pb-1 inline-block">
                  Thickness
                </h3>
                <ul className="space-y-1">
                  <AnimatePresence>
                    {thicknessOptionsToRender.map((thick) => {
                      const active = isThicknessActive(thick.value);
                      return (
                        <motion.li
                          key={thick.value}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <button
                            onClick={() => handleThicknessChange(thick.value)}
                            className={`flex items-center text-left w-full px-4 py-2 transition-all text-[14px] group rounded-lg ${active ? 'bg-[#5D4037] text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                          >
                            <span className={`mr-3 transition-colors ${active ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-500'}`}>→</span> {thick.label}
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                  {thicknessOptionsToRender.length === 0 && (
                    <li className="text-sm text-zinc-400 px-4 py-1">No thickness options available.</li>
                  )}
                </ul>
              </div>

              {/* Size Filter */}
              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-6 border-b-2 border-zinc-900 pb-1 inline-block">
                  Available Size
                </h3>
                <ul className="space-y-1">
                  <AnimatePresence>
                    {sizeOptionsToRender.map((size) => {
                      const active = isSizeActive(size.value);
                      return (
                        <motion.li
                          key={size.value}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <button
                            onClick={() => handleSizeChange(size.value)}
                            className={`flex items-center text-left w-full px-4 py-2 transition-all text-[14px] group rounded-lg ${active ? 'bg-[#5D4037] text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                          >
                            <span className={`mr-3 transition-colors ${active ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-500'}`}>→</span> {size.label}
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                  {sizeOptionsToRender.length === 0 && (
                    <li className="text-sm text-zinc-400 px-4 py-1">No size options available.</li>
                  )}
                </ul>
              </div>

              {/* Application Filter */}
              <div>
                <h3 className="text-lg font-bold text-zinc-900 mb-6 border-b-2 border-zinc-900 pb-1 inline-block">
                  Application
                </h3>
                <ul className="space-y-1">
                  <AnimatePresence>
                    {appOptionsToRender.map((app) => {
                      const active = isAppActive(app.value);
                      return (
                        <motion.li
                          key={app.value}
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <button
                            onClick={() => handleAppChange(app.value)}
                            className={`flex items-center text-left w-full px-4 py-2 transition-all text-[14px] group rounded-lg ${active ? 'bg-[#5D4037] text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'}`}
                          >
                            <span className={`mr-3 transition-colors ${active ? 'text-white' : 'text-zinc-300 group-hover:text-zinc-500'}`}>→</span> {app.label}
                          </button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                  {appOptionsToRender.length === 0 && (
                    <li className="text-sm text-zinc-400 px-4 py-1">No application options available.</li>
                  )}
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
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  <AnimatePresence mode="popLayout">
                    {visibleProducts.map((product, index) => (
                      <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        transition={{ 
                          type: "spring", 
                          stiffness: 300, 
                          damping: 30,
                          opacity: { duration: 0.25 }
                        }}
                        key={product._id}
                        className="p-4 pb-8 rounded-tl-[3.5rem] rounded-br-[3.5rem] rounded-tr-[1.25rem] rounded-bl-[1.25rem] bg-[#FAF8F5] border border-[#D2C9B1]/30 group flex flex-col h-full hover:shadow-xl hover:border-[#5D4037]/30"
                      >
                        <Link to={`/products/${product.slug}`} onClick={savePageState} className="block relative aspect-[3/4] overflow-hidden rounded-tl-[2.75rem] rounded-br-[2.75rem] rounded-tr-[0.85rem] rounded-bl-[0.85rem] bg-zinc-100 transform-gpu">
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
                            <Link
                              to={`/products/${product.slug || product._id}`}
                              onClick={savePageState}
                              className="inline-flex items-center group/btn relative py-2"
                            >
                              <div className="absolute left-[-12px] w-10 h-10 bg-[#D2C9B1] rounded-full transition-all duration-500 ease-out group-hover/btn:w-[calc(100%+24px)] group-hover/btn:bg-[#5D4037]"></div>
                              <span className="relative z-10 flex items-center text-sm font-medium text-zinc-900 group-hover/btn:text-white transition-colors duration-300 pl-4">
                                View More <ArrowRight size={16} className="ml-3 transition-transform duration-300 group-hover/btn:translate-x-1" />
                              </span>
                            </Link>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>

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
