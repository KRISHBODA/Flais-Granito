import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Trash2, Sliders, Plus, Edit, X } from 'lucide-react';
import toast from 'react-hot-toast';

const CatalogFilters = () => {
  const [activeTab, setActiveTab] = useState('category'); // 'category', 'thickness', 'size', 'application'
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // New/Edit option form states
  const [newLabel, setNewLabel] = useState('');
  const [newValue, setNewValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);

  const API = import.meta.env.VITE_BACKEND_URL;

  const fetchOptions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      if (activeTab === 'category') {
        const response = await axios.get(`${API}/api/categories`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const mapped = (response.data.categories || []).map(cat => ({
          _id: cat._id,
          label: cat.name,
          value: cat.slug,
          isCategory: true
        }));
        setOptions(mapped);
      } else {
        const response = await axios.get(`${API}/api/filter-options?type=${activeTab}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setOptions(response.data.options || []);
      }
    } catch (error) {
      toast.error("Failed to load filter options");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOptions();
    setNewLabel('');
    setNewValue('');
    setEditId(null);
  }, [activeTab]);

  const handleLabelChange = (e) => {
    const val = e.target.value;
    setNewLabel(val);
    
    // Auto-convert "9 MM Full Body" to "9mm"
    if (activeTab !== 'category' && !editId) {
      const slugified = val
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/fullbody/g, '')
        .replace(/body/g, '')
        .replace(/only/g, '');
      setNewValue(slugified);
    }
  };

  const handleStartEdit = (item) => {
    setEditId(item._id);
    setNewLabel(item.label);
    setNewValue(item.value);
  };

  const handleCancelEdit = () => {
    setEditId(null);
    setNewLabel('');
    setNewValue('');
  };

  const handleAddOrEditOption = async (e) => {
    e.preventDefault();
    if (!newLabel.trim()) {
      return toast.error("Label is required");
    }
    if (activeTab !== 'category' && !newValue.trim()) {
      return toast.error("Value is required");
    }

    try {
      setIsAdding(true);
      const token = localStorage.getItem('adminToken');
      
      if (editId) {
        // UPDATE MODE
        if (activeTab === 'category') {
          await axios.put(
            `${API}/api/categories/${editId}`,
            { name: newLabel.trim() },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        } else {
          await axios.put(
            `${API}/api/filter-options/${editId}`,
            {
              label: newLabel.trim(),
              value: newValue.trim()
            },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        }
        toast.success('Filter option updated successfully');
      } else {
        // CREATE MODE
        if (activeTab === 'category') {
          await axios.post(
            `${API}/api/categories`,
            { name: newLabel.trim() },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        } else {
          await axios.post(
            `${API}/api/filter-options`,
            {
              type: activeTab,
              label: newLabel.trim(),
              value: newValue.trim()
            },
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
        }
        toast.success('Filter option added successfully');
      }
      
      setNewLabel('');
      setNewValue('');
      setEditId(null);
      fetchOptions();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save filter option');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteOption = async (item) => {
    if (window.confirm(`Are you sure you want to delete this ${activeTab} option?`)) {
      try {
        const token = localStorage.getItem('adminToken');
        if (item.isCategory) {
          await axios.delete(`${API}/api/categories/${item._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        } else {
          await axios.delete(`${API}/api/filter-options/${item._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
        }
        toast.success('Filter option deleted successfully');
        if (editId === item._id) {
          handleCancelEdit();
        }
        setOptions(options.filter(opt => opt._id !== item._id));
      } catch (error) {
        toast.error('Failed to delete option');
      }
    }
  };

  // Filter list by search term
  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    opt.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Catalog Filter Management</h1>
        <p className="text-slate-500">Manage Categories and specifications filters displayed on the tile catalog sidebar.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 w-fit">
        <button
          onClick={() => setActiveTab('category')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'category' ? 'bg-[#0145F2] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Category Filters
        </button>
        <button
          onClick={() => setActiveTab('thickness')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'thickness' ? 'bg-[#0145F2] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Thickness Filters
        </button>
        <button
          onClick={() => setActiveTab('size')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'size' ? 'bg-[#0145F2] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Size Filters
        </button>
        <button
          onClick={() => setActiveTab('application')}
          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'application' ? 'bg-[#0145F2] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Application Filters
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left/Middle: Table list */}
        <div className="lg:col-span-2 rounded-2xl bg-white shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between">
            <div className="relative w-full max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder={`Search ${activeTab} options...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-xs focus:border-[#0145F2] focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            {loading ? (
              <div className="p-10 text-center text-slate-500 text-sm">Loading options...</div>
            ) : filteredOptions.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-sm">No options found. Add some new options on the right!</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Display Label / Name</th>
                    <th className="px-6 py-4">Query Value / Slug</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOptions.map((opt) => (
                    <tr key={opt._id} className={`transition-colors hover:bg-slate-50/50 ${editId === opt._id ? 'bg-blue-50/20' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 shrink-0">
                            <Sliders size={16} />
                          </div>
                          <span className="font-bold text-slate-900 text-sm">{opt.label}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-mono text-slate-500">{opt.value}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleStartEdit(opt)}
                            className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteOption(opt)}
                            className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Form: Add/Edit Option */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 h-fit space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            {editId ? <Edit className="text-blue-600" size={20} /> : <Plus className="text-[#0145F2]" size={20} />}
            {editId ? 'Edit Filter Option' : 'Add Filter Option'}
          </h2>
          <p className="text-slate-500 text-xs leading-relaxed">
            {editId ? 'Modify this filter option and apply changes to update the catalog sidebar.' : 'Create custom filter values that match your tile catalog specifications.'}
          </p>

          <form onSubmit={handleAddOrEditOption} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {activeTab === 'category' ? 'Category Name' : 'Display Label'}
              </label>
              <input
                type="text"
                required
                value={newLabel}
                onChange={handleLabelChange}
                placeholder={
                  activeTab === 'category' ? 'e.g. Full body' :
                  activeTab === 'thickness' ? 'e.g. 12 MM Full Body' :
                  activeTab === 'size' ? 'e.g. 600 x 600 MM' : 'e.g. Outdoor'
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs focus:border-[#0145F2] focus:outline-none"
              />
            </div>

            {activeTab !== 'category' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Query Value (Slugified)</label>
                <input
                  type="text"
                  required
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder={
                    activeTab === 'thickness' ? 'e.g. 12mm' :
                    activeTab === 'size' ? 'e.g. 600x600' : 'e.g. outdoor'
                  }
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs font-mono focus:border-[#0145F2] focus:outline-none"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  The technical identifier used behind the scenes for product mapping.
                </span>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="submit"
                disabled={isAdding}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0145F2] py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:bg-blue-300"
              >
                {isAdding ? (editId ? 'Updating...' : 'Saving...') : (editId ? 'Update Option' : 'Save Option')}
              </button>
              
              {editId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-slate-600 transition-colors hover:bg-slate-50"
                >
                  <X size={15} /> Cancel Edit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CatalogFilters;
