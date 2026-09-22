import React, { useEffect, useState, useMemo } from 'react';
import { Link, useSearchParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Plus, Search, Filter, MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight, 
  Layers, FileText, Package, Save, X, Compass, Sparkles, Images, AlertCircle, 
  ExternalLink, CheckCircle2, Tag 
} from 'lucide-react';
import toast from 'react-hot-toast';
import CatalogFilters from './CatalogFilters.jsx';
import { getImageUrl } from '../utils/api';

const ProductsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const API = import.meta.env.VITE_BACKEND_URL;
  const [collectionSettings, setCollectionSettings] = useState({
    bannerVideo: "",
    title: "Our Tile Collection",
    desc: "Explore FLAIS GRANITO's premium tile catalog. Discover high-quality vitrified, glazed, and ceramic tiles with multiple sizing, looks, and finishes."
  });

  const fetchCollectionSettings = async () => {
    try {
      const res = await axios.get(`${API}/api/collection`);
      if (res.data.success && res.data.collection) {
        setCollectionSettings(res.data.collection);
      }
    } catch (error) {
    }
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${API}/api/collection`, { collection: collectionSettings }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Collection page settings saved!');
    } catch (error) {
      toast.error("Failed to save collection settings");
    }
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [mediaStats, setMediaStats] = useState(null);
  
  // Read initial filter values from URL first, fallback to sessionStorage
  const getInitialFilters = () => {
    const urlCategory = searchParams.get('category');
    const urlSearch = searchParams.get('search');
    const urlPage = searchParams.get('page');
    const urlTab = searchParams.get('tab');
    const urlFilter360 = searchParams.get('filter360');
    const urlFilter3d = searchParams.get('filter3d');
    const urlFilterTag = searchParams.get('filterTag');

    if (
      urlCategory !== null || 
      urlSearch !== null || 
      urlPage !== null || 
      urlTab !== null || 
      urlFilter360 !== null || 
      urlFilter3d !== null ||
      urlFilterTag !== null
    ) {
      return {
        category: urlCategory || 'All',
        search: urlSearch || '',
        page: urlPage ? parseInt(urlPage, 10) || 1 : 1,
        tab: urlTab || 'inventory',
        filter360: urlFilter360 || 'all',
        filter3d: urlFilter3d || 'all',
        filterTag: urlFilterTag || 'all'
      };
    }

    try {
      const saved = sessionStorage.getItem('admin_products_filter');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          category: parsed.category || 'All',
          search: parsed.search || '',
          page: parsed.page || 1,
          tab: parsed.tab || 'inventory',
          filter360: parsed.filter360 || 'all',
          filter3d: parsed.filter3d || 'all',
          filterTag: parsed.filterTag || 'all'
        };
      }
    } catch (e) {}

    return { 
      category: 'All', 
      search: '', 
      page: 1, 
      tab: 'inventory', 
      filter360: 'all', 
      filter3d: 'all',
      filterTag: 'all'
    };
  };

  const initialFilters = useMemo(getInitialFilters, []);

  // Filter States
  const [activeTab, setActiveTab] = useState(initialFilters.tab);
  const [searchTerm, setSearchTerm] = useState(initialFilters.search);
  const [selectedCategory, setSelectedCategory] = useState(initialFilters.category);
  const [filter360, setFilter360] = useState(initialFilters.filter360);
  const [filter3d, setFilter3d] = useState(initialFilters.filter3d);
  const [filterTag, setFilterTag] = useState(initialFilters.filterTag);
  const [currentPage, setCurrentPage] = useState(initialFilters.page);
  const [paginationData, setPaginationData] = useState({
    totalProducts: 0,
    totalPages: 1
  });

  // Sync state to URL search parameters & sessionStorage
  useEffect(() => {
    const params = new URLSearchParams();
    if (activeTab !== 'inventory') params.set('tab', activeTab);
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    if (searchTerm) params.set('search', searchTerm);
    if (filter360 && filter360 !== 'all') params.set('filter360', filter360);
    if (filter3d && filter3d !== 'all') params.set('filter3d', filter3d);
    if (filterTag && filterTag !== 'all') params.set('filterTag', filterTag);
    if (currentPage > 1) params.set('page', currentPage.toString());

    if (params.toString() !== searchParams.toString()) {
      setSearchParams(params, { replace: true });
    }

    try {
      sessionStorage.setItem('admin_products_filter', JSON.stringify({
        category: selectedCategory,
        search: searchTerm,
        page: currentPage,
        tab: activeTab,
        filter360,
        filter3d,
        filterTag
      }));
    } catch (e) {}
  }, [activeTab, selectedCategory, searchTerm, currentPage, filter360, filter3d, filterTag]);

  // Handle browser Back / Forward history navigation
  useEffect(() => {
    const urlCategory = searchParams.get('category') || 'All';
    const urlSearch = searchParams.get('search') || '';
    const urlPage = searchParams.get('page') ? parseInt(searchParams.get('page'), 10) || 1 : 1;
    const urlTab = searchParams.get('tab') || 'inventory';
    const urlFilter360 = searchParams.get('filter360') || 'all';
    const urlFilter3d = searchParams.get('filter3d') || 'all';
    const urlFilterTag = searchParams.get('filterTag') || 'all';

    setSelectedCategory(prev => prev !== urlCategory ? urlCategory : prev);
    setSearchTerm(prev => prev !== urlSearch ? urlSearch : prev);
    setCurrentPage(prev => prev !== urlPage ? urlPage : prev);
    setActiveTab(prev => prev !== urlTab ? urlTab : prev);
    setFilter360(prev => prev !== urlFilter360 ? urlFilter360 : prev);
    setFilter3d(prev => prev !== urlFilter3d ? urlFilter3d : prev);
    setFilterTag(prev => prev !== urlFilterTag ? urlFilterTag : prev);
  }, [searchParams]);

  const isFiltered = (
    selectedCategory !== 'All' || 
    Boolean(searchTerm) || 
    filter360 !== 'all' || 
    filter3d !== 'all' ||
    filterTag !== 'all'
  );

  const activeFilterCount = [
    selectedCategory !== 'All',
    Boolean(searchTerm),
    filter360 !== 'all',
    filter3d !== 'all',
    filterTag !== 'all'
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSearchTerm('');
    setFilter360('all');
    setFilter3d('all');
    setFilterTag('all');
    setCurrentPage(1);
    const params = new URLSearchParams();
    if (activeTab !== 'inventory') params.set('tab', activeTab);
    setSearchParams(params, { replace: true });
    try {
      sessionStorage.removeItem('admin_products_filter');
    } catch (e) {}
  };

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${API}/api/categories`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchCollectionSettings();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/api/products`, {
        params: {
          page: currentPage,
          search: searchTerm,
          category: selectedCategory,
          filter360,
          filter3d,
          filterTag
        }
      });
      
      setProducts(response.data.products);
      setPaginationData({
        totalProducts: response.data.totalProducts,
        totalPages: response.data.totalPages
      });
      if (response.data.mediaStats) {
        setMediaStats(response.data.mediaStats);
      }
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when page, category, search, or media filters change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 400); // 400ms debounce for search

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, selectedCategory, searchTerm, filter360, filter3d, filterTag]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${API}/api/products/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Product deleted successfully');
        fetchProducts(); // Refresh list
      } catch (error) {
        toast.error("Delete failed");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Collection Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {activeTab === 'inventory' ? (
              <span>
                Total: <strong className="text-slate-800 font-semibold">{paginationData.totalProducts}</strong> pieces matching filters
                {isFiltered && <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">Filtered</span>}
              </span>
            ) : 
             activeTab === 'filters' ? 'Manage dynamic catalog sidebar filters (Category, Thickness, Size, Application)' :
             'Edit banner media and description for the collection page'}
          </p>
        </div>
        {activeTab === 'inventory' && (
          <Link 
            to="/admin/products/add" 
            state={{ from: location.search }}
            className="flex items-center gap-2 rounded-lg bg-[#0145F2] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700 shadow-sm shadow-blue-500/20"
          >
            <Plus size={18} /> Add Piece
          </Link>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'inventory'
              ? 'border-[#0145F2] text-[#0145F2]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Package size={18} />
          Product Inventory
        </button>
        <button
          onClick={() => setActiveTab('filters')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'filters'
              ? 'border-[#0145F2] text-[#0145F2]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Filter size={18} />
          Catalog Filters
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'settings'
              ? 'border-[#0145F2] text-[#0145F2]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText size={18} />
          Page Settings
        </button>
      </div>

      {activeTab === 'inventory' && (
        <>
          {/* Search & Media Filter Controls */}
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              {/* Search Bar */}
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Search size={18} />
                </span>
                <input
                  type="text"
                  placeholder="Search by tile title or ID..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-[#0145F2] focus:outline-none transition-colors"
                />
              </div>

              {/* Collection Dropdown */}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 shrink-0">
                <Filter size={16} className="text-slate-400 shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent focus:outline-none cursor-pointer text-sm pr-2"
                >
                  <option value="All">All Collections</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* 360° View Filter Dropdown */}
              <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors shrink-0 ${
                filter360 !== 'all' 
                  ? filter360 === 'uploaded' ? 'border-emerald-300 bg-emerald-50 text-emerald-800' : 'border-rose-300 bg-rose-50 text-rose-800'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}>
                <Compass size={16} className={filter360 !== 'all' ? (filter360 === 'uploaded' ? 'text-emerald-600' : 'text-rose-600') : 'text-slate-400'} />
                <select
                  value={filter360}
                  onChange={(e) => { setFilter360(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent focus:outline-none cursor-pointer text-sm pr-2"
                >
                  <option value="all">360° Link: All</option>
                  <option value="uploaded">🌐 360° Uploaded ({mediaStats?.has360Count ?? '...'})</option>
                  <option value="missing">⚠️ 360° Missing ({mediaStats?.missing360Count ?? '...'})</option>
                </select>
              </div>

              {/* 3D Preview Filter Dropdown */}
              <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors shrink-0 ${
                filter3d !== 'all' 
                  ? filter3d === 'uploaded' ? 'border-blue-300 bg-blue-50 text-blue-800' : 'border-amber-300 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}>
                <Sparkles size={16} className={filter3d !== 'all' ? (filter3d === 'uploaded' ? 'text-blue-600' : 'text-amber-600') : 'text-slate-400'} />
                <select
                  value={filter3d}
                  onChange={(e) => { setFilter3d(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent focus:outline-none cursor-pointer text-sm pr-2"
                >
                  <option value="all">3D Preview: All</option>
                  <option value="uploaded">✨ 3D Uploaded ({mediaStats?.has3dCount ?? '...'})</option>
                  <option value="missing">⚠️ 3D Missing ({mediaStats?.missing3dCount ?? '0'})</option>
                </select>
              </div>

              {/* Tag/Review Filter Dropdown */}
              <div className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors shrink-0 ${
                filterTag !== 'all' 
                  ? /best\s*selling/i.test(filterTag)
                    ? 'border-amber-300 bg-amber-50 text-amber-900'
                    : /new\s*arrival/i.test(filterTag)
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                    : filterTag === 'missing'
                    ? 'border-rose-300 bg-rose-50 text-rose-800'
                    : 'border-purple-300 bg-purple-50 text-purple-800'
                  : 'border-slate-200 bg-slate-50 text-slate-700'
              }`}>
                <Tag size={16} className={
                  filterTag !== 'all' 
                    ? /best\s*selling/i.test(filterTag)
                      ? 'text-amber-600'
                      : /new\s*arrival/i.test(filterTag)
                      ? 'text-emerald-600'
                      : filterTag === 'missing'
                      ? 'text-rose-600'
                      : 'text-purple-600'
                    : 'text-slate-400'
                } />
                <select
                  value={filterTag}
                  onChange={(e) => { setFilterTag(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent focus:outline-none cursor-pointer text-sm pr-2"
                >
                  <option value="all">Tag/Review: All</option>
                  <option value="Best Selling">🔥 Best Selling ({mediaStats?.bestSellingCount ?? 0})</option>
                  <option value="New Arrival">✨ New Arrival ({mediaStats?.newArrivalCount ?? 0})</option>
                  <option value="uploaded">🏷️ Any Tag ({mediaStats?.hasTagCount ?? 0})</option>
                  <option value="missing">⚠️ Missing Tag ({mediaStats?.missingTagCount ?? 0})</option>
                  {mediaStats?.distinctTags && mediaStats.distinctTags.filter(t => !/^(best\s*selling|new\s*arrival)$/i.test(t)).length > 0 && (
                    <optgroup label="Other Specific Tags">
                      {mediaStats.distinctTags
                        .filter(t => !/^(best\s*selling|new\s*arrival)$/i.test(t))
                        .map((tag) => (
                          <option key={tag} value={tag}>Tag: &quot;{tag}&quot;</option>
                        ))}
                    </optgroup>
                  )}
                </select>
              </div>

              {/* Clear All Filters */}
              {isFiltered && (
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors shrink-0"
                  title="Reset all filters"
                >
                  <X size={14} /> Clear ({activeFilterCount})
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm min-h-[400px]">
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center gap-2 text-slate-500">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#0145F2] border-t-transparent"></div>
                <span className="text-sm font-medium">Loading collection products...</span>
              </div>
            ) : products.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-500">
                <Package size={40} className="text-slate-300" />
                <p className="font-semibold text-slate-700">No pieces match the selected filters</p>
                {isFiltered && (
                  <button
                    onClick={handleClearFilters}
                    className="text-xs font-semibold text-[#0145F2] hover:underline"
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                      <th className="px-6 py-4">Product Details</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Media Status</th>
                      <th className="px-6 py-4">Application</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => {
                      const has360 = Boolean(
                        product.link360 && 
                        String(product.link360).trim() !== '' && 
                        String(product.link360).trim() !== 'null' && 
                        String(product.link360).trim() !== 'undefined'
                      );
                      const has3dPreview = Boolean(
                        product.has3dPreview !== false && 
                        product.images && 
                        product.images.length > 0 && 
                        product.images[0]
                      );
                      const jpgCount = product.has3dPreview === false 
                        ? (product.images ? product.images.length : 0)
                        : (product.images && product.images.length > 1 ? product.images.length - 1 : 0);

                      return (
                        <tr key={product._id} className="transition-colors hover:bg-slate-50/50">
                          {/* Product Details Column */}
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-4">
                              <div className="relative h-14 w-14 shrink-0 rounded-xl object-cover border bg-slate-100 flex items-center justify-center overflow-hidden">
                                {product.images?.[0] ? (
                                  <img 
                                    loading="lazy" 
                                    src={getImageUrl(product.images[0])} 
                                    alt={product.title} 
                                    className="h-full w-full rounded-xl object-cover" 
                                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }} 
                                  />
                                ) : null}
                                <div className={`h-full w-full rounded-xl flex items-center justify-center text-slate-300 ${product.images?.[0] ? 'hidden' : 'flex'}`}>
                                  <Package className="w-6 h-6 text-slate-300" />
                                </div>
                                {has360 && (
                                  <span className="absolute top-1 left-1 bg-emerald-600 text-white rounded-full p-0.5 shadow-sm" title="360° Available">
                                    <Compass size={10} />
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-slate-900">{product.title || product.name}</h4>
                                  {product.tagReview && String(product.tagReview).trim() !== '' && (
                                    <span 
                                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold border ${
                                        /best\s*selling/i.test(product.tagReview)
                                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                                          : /new\s*arrival/i.test(product.tagReview)
                                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                          : 'bg-purple-50 text-purple-700 border-purple-200'
                                      }`}
                                      title={`Tag/Review: ${product.tagReview}`}
                                    >
                                      <Tag size={11} className={
                                        /best\s*selling/i.test(product.tagReview)
                                          ? 'text-amber-600 shrink-0'
                                          : /new\s*arrival/i.test(product.tagReview)
                                          ? 'text-emerald-600 shrink-0'
                                          : 'text-purple-600 shrink-0'
                                      } />
                                      {product.tagReview}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 font-mono">ID: {product._id.slice(-6).toUpperCase()}</p>
                                <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[10px] text-slate-500 font-semibold uppercase">
                                  <span>Size: {product.size || '-'}</span>
                                  <span>•</span>
                                  <span>Thick: {product.thickness || '-'}</span>
                                  <span>•</span>
                                  <span>Finish: {product.finishes || '-'}</span>
                                  <span>•</span>
                                  <span>Body: {product.color || '-'}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category Column */}
                          <td className="px-6 py-4 text-sm font-medium text-slate-700">
                            {product.category}
                          </td>

                          {/* Media Status Column (360 Link, 3D Preview, Tile JPGs) */}
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1.5">
                              {/* 360 Link Status */}
                              {has360 ? (
                                <a
                                  href={product.link360}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors w-fit"
                                  title={`Open 360° Link: ${product.link360}`}
                                >
                                  <Compass size={13} className="text-emerald-600 shrink-0" />
                                  <span>360° Uploaded</span>
                                  <ExternalLink size={10} className="text-emerald-500 shrink-0 ml-0.5" />
                                </a>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-600 border border-rose-200 w-fit">
                                  <AlertCircle size={13} className="text-rose-500 shrink-0" />
                                  <span>No 360° Link</span>
                                </span>
                              )}

                              {/* 3D Preview and JPG Count Badges */}
                              <div className="flex flex-wrap items-center gap-1.5">
                                {has3dPreview ? (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-blue-700 border border-blue-200" title="#1 Photo is 3D Preview">
                                    <Sparkles size={11} className="text-blue-600 shrink-0" />
                                    3D Preview (#1)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-medium text-amber-700 border border-amber-200">
                                    <AlertCircle size={11} className="text-amber-500 shrink-0" />
                                    No 3D Preview
                                  </span>
                                )}

                                {jpgCount > 0 ? (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-[11px] font-semibold text-purple-700 border border-purple-200" title={`${jpgCount} simple tile JPG photos uploaded`}>
                                    <Images size={11} className="text-purple-600 shrink-0" />
                                    {jpgCount} Tile JPG{jpgCount > 1 ? 's' : ''}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 border border-slate-200">
                                    <AlertCircle size={11} className="text-slate-400 shrink-0" />
                                    No Tile JPGs
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* Application Column */}
                          <td className="px-6 py-4">
                            <span className="rounded-full bg-slate-100 text-slate-700 px-2.5 py-1 text-xs font-semibold">
                              {product.application || 'Not Specified'}
                            </span>
                          </td>

                          {/* Actions Column */}
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Link 
                                to={`/admin/products/edit/${product._id}`} 
                                state={{ from: location.search }}
                                className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors"
                                title="Edit Piece"
                              >
                                <Edit size={18} />
                              </Link>
                              <button 
                                onClick={() => handleDelete(product._id)} 
                                className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors"
                                title="Delete Piece"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {paginationData.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-100 px-6 py-4 gap-3">
                <p className="text-sm text-slate-500">
                  Page <span className="font-medium text-slate-900">{currentPage}</span> of <span className="font-medium text-slate-900">{paginationData.totalPages}</span>
                  <span className="text-xs text-slate-400 ml-2">({paginationData.totalProducts} total)</span>
                </p>
                <div className="flex items-center gap-1.5">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="rounded-lg border p-2 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {/* Clean Page Numbers with Ellipsis */}
                  {(() => {
                    const total = paginationData.totalPages;
                    const current = currentPage;
                    let pages = [];
                    if (total <= 7) {
                      pages = Array.from({ length: total }, (_, i) => i + 1);
                    } else {
                      if (current <= 4) {
                        pages = [1, 2, 3, 4, 5, '...', total];
                      } else if (current >= total - 3) {
                        pages = [1, '...', total - 4, total - 3, total - 2, total - 1, total];
                      } else {
                        pages = [1, '...', current - 1, current, current + 1, '...', total];
                      }
                    }
                    return pages.map((p, index) => (
                      typeof p === 'number' ? (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(p)}
                          className={`h-9 w-9 rounded-lg text-sm font-bold transition-all ${
                            current === p ? 'bg-[#0145F2] text-white shadow-sm' : 'border hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {p}
                        </button>
                      ) : (
                        <span key={index} className="px-1 text-slate-400 font-bold select-none">
                          ...
                        </span>
                      )
                    ));
                  })()}

                  <button 
                    disabled={currentPage === paginationData.totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="rounded-lg border p-2 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}



      {activeTab === 'filters' && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <CatalogFilters />
        </div>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Collection Page Settings</h2>
            <p className="text-sm text-slate-500">Customize the headers, description, and hero media settings for the customer-facing tile collection catalog.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Page Title</label>
              <input
                type="text"
                value={collectionSettings.title}
                onChange={(e) => setCollectionSettings({ ...collectionSettings, title: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                placeholder="Our Tile Collection"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Banner Video/Image File</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setCollectionSettings({ ...collectionSettings, bannerVideo: reader.result });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
              />
              {collectionSettings.bannerVideo && (
                <div className="mt-2 h-20 w-36 border border-slate-200 rounded overflow-hidden">
                  {collectionSettings.bannerVideo.startsWith('data:video/') || collectionSettings.bannerVideo.includes('.mp4') ? (
                    <video src={collectionSettings.bannerVideo} className="h-full w-full object-cover" muted />
                  ) : (
                    <img src={collectionSettings.bannerVideo} alt="preview" className="h-full w-full object-cover" />
                  )}
                </div>
              )}
              <p className="text-xs text-slate-400 mt-1">Leave blank to use the default brand motion video. Supports MP4 videos or standard image formats.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Page Description / SEO Meta Description</label>
              <textarea
                value={collectionSettings.desc}
                onChange={(e) => setCollectionSettings({ ...collectionSettings, desc: e.target.value })}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                placeholder="Provide a detailed description of the collections..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-[#0145F2] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700"
            >
              <Save size={18} /> Save Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ProductsList;