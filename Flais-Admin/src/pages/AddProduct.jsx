import React, { useState } from 'react';
import axios from "axios";
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  X,
  Save,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const backend_url = import.meta.env.VITE_BACKEND_URL;


const AddProduct = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    stock: '',
    price: '',
    description: '',
    size: '',
    color: '',
    thickness: '',
    finishes: '',
    link360: '',
  });
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [appOptions, setAppOptions] = useState([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const [catRes, appRes] = await Promise.all([
          axios.get(`${backend_url}/api/categories`, { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get(`${backend_url}/api/filter-options?type=application`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        setCategories(catRes.data.categories || []);
        setAppOptions(appRes.data.options || []);
      } catch (error) {
      }
    };
    fetchData();
  }, [backend_url]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setImage(file);

      const reader = new FileReader();

      reader.onloadend = () => {
        setPreview(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const data = new FormData();

      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("stock", 1);
      data.append("price", 0);
      data.append("category", formData.category);
      data.append("size", formData.size);
      data.append("color", formData.color);
      data.append("thickness", formData.thickness);
      data.append("finishes", formData.finishes);
      data.append("application", formData.application);
      data.append("link360", formData.link360);

      if (image) {
        data.append("images", image);
      }
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(
        `${backend_url}/api/products`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message);
      navigate("/admin/products");
    } catch (error) {

      toast.error("Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/admin/products"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Piece</h1>
          <p className="text-slate-500">Create a new collection item in your catalog.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: General Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Info Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-900">General Information</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Piece Title</label>
                <input
                  type="text"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. Marquina Black 60x120"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:border-[#0145F2] focus:outline-none focus:ring-1 focus:ring-[#0145F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Size</label>
                  <input
                    type="text"
                    name="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    placeholder="e.g. 60X120 CM"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:border-[#0145F2] focus:outline-none focus:ring-1 focus:ring-[#0145F2]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Color</label>
                  <input
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleInputChange}
                    placeholder="e.g. Grey"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:border-[#0145F2] focus:outline-none focus:ring-1 focus:ring-[#0145F2]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Thickness</label>
                  <input
                    type="text"
                    name="thickness"
                    value={formData.thickness}
                    onChange={handleInputChange}
                    placeholder="e.g. 9 mm"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:border-[#0145F2] focus:outline-none focus:ring-1 focus:ring-[#0145F2]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Finishes</label>
                  <input
                    type="text"
                    name="finishes"
                    value={formData.finishes}
                    onChange={handleInputChange}
                    placeholder="e.g. Matt"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:border-[#0145F2] focus:outline-none focus:ring-1 focus:ring-[#0145F2]"
                  />
                </div>
                <div className="col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">360° View Link</label>
                  <input
                    type="text"
                    name="link360"
                    value={formData.link360}
                    onChange={handleInputChange}
                    placeholder="e.g. https://kuula.co/post/..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:border-[#0145F2] focus:outline-none focus:ring-1 focus:ring-[#0145F2]"
                  />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Media & Category */}
        <div className="space-y-6">
          {/* Media Card */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-900">Piece Media</h3>
            <div className="relative">
              {preview ? (
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200">
                  <img loading="lazy" src={preview} alt="Preview" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setImage(null)}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <label className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-[#0145F2] hover:bg-blue-50/30">
                  <Upload className="mb-3 text-slate-400" size={32} />
                  <span className="text-sm font-semibold text-slate-600">Upload Piece Image</span>
                  <span className="mt-1 text-xs text-slate-400">PNG, JPG, WebP up to 10MB</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                </label>
              )}
            </div>
          </div>

          {/* Category & Status */}
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <h3 className="mb-6 text-lg font-bold text-slate-900">Organization</h3>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:border-[#0145F2] focus:outline-none focus:ring-1 focus:ring-[#0145F2]"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                  ))}
                  {categories.length === 0 && (
                    <>
                      <option value="GVT/PGVT">GVT/PGVT</option>
                      <option value="Color body">Color body</option>
                      <option value="Full body">Full body</option>
                    </>
                  )}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Application</label>
                <select
                  name="application"
                  value={formData.application}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:border-[#0145F2] focus:outline-none focus:ring-1 focus:ring-[#0145F2]"
                >
                  <option value="">Select Application</option>
                  {appOptions.map(opt => (
                    <option key={opt._id} value={opt.label}>{opt.label}</option>
                  ))}
                  {appOptions.length === 0 && (
                    <>
                      <option value="Floor">Floor</option>
                      <option value="Wall">Wall</option>
                      <option value="Floor & Wall">Floor & Wall</option>
                      <option value="Outdoor">Outdoor</option>
                    </>
                  )}
                </select>
              </div>

            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0145F2] py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Processing...' : <><Save size={18} /> Save Piece</>}
            </button>
            <button
              type="button"
              onClick={() => navigate('/admin/products')}
              className="w-full rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
