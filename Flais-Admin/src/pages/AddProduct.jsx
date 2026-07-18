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
    randoms: '',
    collection: '',
    tagReview: '',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
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
    const files = Array.from(e.target.files);
    if (images.length + files.length > 8) {
      toast.error("You can upload a maximum of 8 images.");
      return;
    }

    const newFiles = [...images, ...files].slice(0, 8);
    setImages(newFiles);

    const newPreviews = [];
    let loadedCount = 0;

    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        loadedCount++;
        if (loadedCount === newFiles.length) {
          setPreviews(newPreviews);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setImages(newImages);
    setPreviews(newPreviews);
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
      data.append("randoms", formData.randoms);
      data.append("collection", formData.collection);
      data.append("tagReview", formData.tagReview);

      if (images && images.length > 0) {
        images.forEach((img) => {
          data.append("images", img);
        });
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Available Size</label>
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Body Type</label>
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
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Available Finish</label>
                  <input
                    type="text"
                    name="finishes"
                    value={formData.finishes}
                    onChange={handleInputChange}
                    placeholder="e.g. Matt"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:border-[#0145F2] focus:outline-none focus:ring-1 focus:ring-[#0145F2]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Randoms</label>
                  <input
                    type="text"
                    name="randoms"
                    value={formData.randoms}
                    onChange={handleInputChange}
                    placeholder="e.g. 4"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:border-[#0145F2] focus:outline-none focus:ring-1 focus:ring-[#0145F2]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Collection</label>
                  <input
                    type="text"
                    name="collection"
                    value={formData.collection}
                    onChange={handleInputChange}
                    placeholder="e.g. Marquina"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:border-[#0145F2] focus:outline-none focus:ring-1 focus:ring-[#0145F2]"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">Tag/Review</label>
                  <input
                    type="text"
                    name="tagReview"
                    value={formData.tagReview}
                    onChange={handleInputChange}
                    placeholder="e.g. Premium / 5 Star"
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
              <div className="space-y-4">
                {previews.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {previews.map((prev, idx) => (
                      <div key={idx} className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 group">
                        <img loading="lazy" src={prev} alt={`Preview ${idx + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                        >
                          <X size={15} />
                        </button>
                        <div className="absolute bottom-2 left-2 px-1.5 py-0.5 text-[10px] font-bold text-white bg-black/60 rounded">
                          #{idx + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {previews.length < 8 && (
                  <label className="flex aspect-[2/1] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-[#0145F2] hover:bg-blue-50/30">
                    <Upload className="mb-2 text-slate-400" size={24} />
                    <span className="text-xs font-semibold text-slate-600">Upload Images ({previews.length}/8)</span>
                    <span className="mt-0.5 text-[10px] text-slate-400">PNG, JPG, WebP up to 10MB</span>
                    <input type="file" multiple className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>
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
                    <option key={opt._id} value={opt.value}>{opt.label}</option>
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
