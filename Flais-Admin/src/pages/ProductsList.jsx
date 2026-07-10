import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Plus, Search, Filter, MoreVertical, Edit, Trash2, ChevronLeft, ChevronRight, Layers, FileText, Package, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import CatalogFilters from './CatalogFilters.jsx';
import { getImageUrl } from '../utils/api';

const ProductsList = () => {
  const [activeTab, setActiveTab] = useState('inventory');
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
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    totalProducts: 0,
    totalPages: 1
  });

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
      // Sending filters as query parameters to backend
      const response = await axios.get(`${API}/api/products`, {
        params: {
          page: currentPage,
          search: searchTerm,
          category: selectedCategory
        }
      });
      
      setProducts(response.data.products);
      setPaginationData({
        totalProducts: response.data.totalProducts,
        totalPages: response.data.totalPages
      });
    } catch (error) {
      toast.error("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when page, category, or (debounced) search changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500); // 500ms debounce for search

    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, selectedCategory, searchTerm]);

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
          <p className="text-slate-500">
            {activeTab === 'inventory' ? `Total: ${paginationData.totalProducts} pieces found` : 
             activeTab === 'filters' ? 'Manage dynamic catalog sidebar filters (Category, Thickness, Size, Application)' :
             'Edit banner media and description for the collection page'}
          </p>
        </div>
        {activeTab === 'inventory' && (
          <Link to="/admin/products/add" className="flex items-center gap-2 rounded-lg bg-[#0145F2] px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-blue-700">
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
          {/* Search & Filter Bar */}
          <div className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm md:flex-row md:items-center">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search by product name..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm focus:border-[#0145F2] focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-600">
              <Filter size={16} />
              <select
                value={selectedCategory}
                onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
                className="bg-transparent focus:outline-none"
              >
                <option value="All">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm min-h-[400px]">
            {loading ? (
              <div className="flex h-64 items-center justify-center">Loading...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                      <th className="px-6 py-4">Product Details</th>
                      <th className="px-6 py-4">Category</th>
                      <th className="px-6 py-4">Application</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((product) => (
                      <tr key={product._id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <img loading="lazy" src={getImageUrl(product.images?.[0]) || 'https://via.placeholder.com/150'} alt="" className="h-12 w-12 rounded-lg object-cover border" />
                            <div>
                              <h4 className="font-bold text-slate-900">{product.title || product.name}</h4>
                              <p className="text-xs text-slate-400 font-mono">ID: {product._id.slice(-6).toUpperCase()}</p>
                              <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1 text-[10px] text-slate-500 font-semibold uppercase">
                                <span>Available Size: {product.size || '-'}</span>
                                <span>•</span>
                                <span>Thick: {product.thickness || '-'}</span>
                                <span>•</span>
                                <span>Available Finish: {product.finishes || '-'}</span>
                                <span>•</span>
                                <span>Body Type: {product.color || '-'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{product.category}</td>
                        <td className="px-6 py-4">
                          <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-1 text-xs font-semibold">
                            {product.application || 'Not Specified'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link to={`/admin/products/edit/${product._id}`} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">
                              <Edit size={18} />
                            </Link>
                            <button onClick={() => handleDelete(product._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4">
              <p className="text-sm text-slate-500">
                Page <span className="font-medium text-slate-900">{currentPage}</span> of <span className="font-medium text-slate-900">{paginationData.totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  className="rounded-lg border p-2 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronLeft size={20} />
                </button>
                
                {/* Simple Page Numbers */}
                {[...Array(paginationData.totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`h-10 w-10 rounded-lg text-sm font-bold transition-colors ${currentPage === index + 1 ? 'bg-[#0145F2] text-white' : 'border hover:bg-slate-50'}`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button 
                  disabled={currentPage === paginationData.totalPages}
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  className="rounded-lg border p-2 hover:bg-slate-50 disabled:opacity-50"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
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