import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, Edit, Trash2, Layers, Upload } from 'lucide-react';
import toast from 'react-hot-toast';

const Categories = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryImage, setNewCategoryImage] = useState(null);
  const [newCategoryImagePreview, setNewCategoryImagePreview] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const API = import.meta.env.VITE_BACKEND_URL;

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get(`${API}/api/categories`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setCategories(response.data.categories);
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter logic for search bar
  const filteredCategories = categories.filter(cat => 
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewCategoryImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewCategoryImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim() || !newCategoryImage) {
      toast.error('All category fields are required');
      return;
    }
    try {
      setIsAdding(true);
      const token = localStorage.getItem('adminToken');
      
      // Step 1: Upload image to Local Storage
      const imageFormData = new FormData();
      imageFormData.append('file', newCategoryImage);
      imageFormData.append('category', 'categories');
      
      const uploadResponse = await axios.post(`${API}/api/admin/upload`, imageFormData, {
        headers: { 
          'Authorization': `Bearer ${token}`
        }
      });
      
      const imageUrl = uploadResponse.data.fileUrl;
      
      // Step 2: Create category with image URL
      await axios.post(`${API}/api/categories`, 
        { 
          name: newCategoryName,
          image: imageUrl
        },
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      toast.success('Category added successfully');
      setNewCategoryName('');
      setNewCategoryImage(null);
      setNewCategoryImagePreview('');
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add category');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${API}/api/categories/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Category deleted successfully');
        setCategories(categories.filter(c => c._id !== id));
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  if (loading) return <div className="p-10 text-center">Loading categories...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Categories</h1>
        <p className="text-slate-500">Organize your products into logical groups.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 p-4 flex flex-col gap-4">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-[#0145F2] focus:outline-none"
              />
            </div>
            <form onSubmit={handleAddCategory} className="flex flex-col gap-3 md:flex-row md:items-end md:gap-2">
              <div className="flex-1 md:flex-none">
                <label className="block text-xs font-semibold mb-1 text-slate-700">Category Name</label>
                <input
                  type="text"
                  placeholder="Enter category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full md:w-64 rounded-xl border border-slate-200 bg-slate-50 py-2 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                />
              </div>
              <div className="flex-1 md:flex-none">
                <label className="block text-xs font-semibold mb-1 text-slate-700">Category Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                />
                {newCategoryImagePreview && (
                  <img src={newCategoryImagePreview} alt="preview" className="h-10 mt-1 rounded object-cover border border-slate-100" />
                )}
              </div>
              <button
                type="submit"
                disabled={isAdding}
                className="bg-[#0145F2] text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 whitespace-nowrap"
              >
                {isAdding ? 'Adding...' : 'Add Category'}
              </button>
            </form>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4">Slug</th>
                  <th className="px-6 py-4">Total Products</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCategories.map((cat, index) => (
                  <tr key={index} className="transition-colors hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                          <Layers size={20} />
                        </div>
                        <span className="font-bold text-slate-900">{cat.name || "Uncategorized"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">
                      /{cat.name?.toLowerCase().replace(/\s+/g, '-')}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{cat.count || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium bg-green-100 text-green-700`}>
                        Active
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleDeleteCategory(cat._id)} className="rounded-lg p-2 text-red-600 hover:bg-red-50">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;