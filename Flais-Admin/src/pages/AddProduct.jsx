import React, { useState } from 'react';
import axios from "axios";
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft,
  Upload,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Layers,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';

const backend_url = import.meta.env.VITE_BACKEND_URL;


const AddProduct = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (location.state?.from) {
      navigate(`/admin/products${location.state.from}`);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/admin/products');
    }
  };

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
  // 2 Distinct Image Upload Sections:
  // Section 1: 3D Preview (#1 Photo on collection page)
  const [preview3dFiles, setPreview3dFiles] = useState([]);
  const [preview3dPreviews, setPreview3dPreviews] = useState([]);

  // Section 2: Simple Tile Photos (JPG / Tile Faces / Randoms)
  const [jpgFiles, setJpgFiles] = useState([]);
  const [jpgPreviews, setJpgPreviews] = useState([]);

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

  const handlePreview3dChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newFiles = [...preview3dFiles, ...files];
    setPreview3dFiles(newFiles);

    const newPrevList = [];
    let loaded = 0;
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPrevList.push(reader.result);
        loaded++;
        if (loaded === newFiles.length) {
          setPreview3dPreviews(newPrevList);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePreview3d = (index) => {
    setPreview3dFiles(prev => prev.filter((_, i) => i !== index));
    setPreview3dPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleJpgChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const newFiles = [...jpgFiles, ...files];
    setJpgFiles(newFiles);

    const newPrevList = [];
    let loaded = 0;
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPrevList.push(reader.result);
        loaded++;
        if (loaded === newFiles.length) {
          setJpgPreviews(newPrevList);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeJpg = (index) => {
    setJpgFiles(prev => prev.filter((_, i) => i !== index));
    setJpgPreviews(prev => prev.filter((_, i) => i !== index));
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

      if (preview3dFiles.length === 0 && jpgFiles.length === 0) {
        toast.error("Please upload at least one photo (3D preview or JPG)");
        setIsSubmitting(false);
        return;
      }

      const has3d = preview3dFiles.length > 0;
      data.append("has3dPreview", has3d ? "true" : "false");

      // 1. 3D Preview Photos ALWAYS go first as previewImages (#1 photo)
      if (preview3dFiles.length > 0) {
        preview3dFiles.forEach((img) => {
          data.append("previewImages", img);
        });
      }

      // 2. Simple Tile Photos (JPG) follow after
      if (jpgFiles.length > 0) {
        jpgFiles.forEach((img) => {
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
      handleBack();
    } catch (error) {

      toast.error(error.response?.data?.message || "Failed to add product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          title="Back to Collection"
        >
          <ArrowLeft size={20} />
        </button>
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700">Body Type</label>
                    <span className="text-[11px] text-slate-400 font-medium">8 Color Body types</span>
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      list="bodyTypeOptions"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                      placeholder="Select or enter Body Type (e.g. Ivory)"
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:border-[#0145F2] focus:outline-none focus:ring-1 focus:ring-[#0145F2]"
                    />
                    <datalist id="bodyTypeOptions">
                      <option value="White" />
                      <option value="Ivory" />
                      <option value="Grey" />
                      <option value="Black" />
                      <option value="Green" />
                      <option value="Brown" />
                      <option value="Choco" />
                      <option value="Verde" />
                      <option value="GVT" />
                    </datalist>
                  </div>
                  {/* Quick-select Body Type pills */}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {['White', 'Ivory', 'Grey', 'Black', 'Green', 'Brown', 'Choco', 'Verde'].map((bt) => {
                      const isSelected = (formData.color || '').trim().toUpperCase() === bt.toUpperCase();
                      return (
                        <button
                          key={bt}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, color: bt }))}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                            isSelected 
                              ? 'bg-[#0145F2] text-white shadow-sm' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                          }`}
                        >
                          {bt}
                        </button>
                      );
                    })}
                  </div>
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-slate-700">Tag/Review</label>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tagReview: 'Best Selling' }))}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                          formData.tagReview === 'Best Selling'
                            ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-amber-50 hover:text-amber-800'
                        }`}
                      >
                        🔥 Best Selling
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, tagReview: 'New Arrival' }))}
                        className={`px-2 py-0.5 rounded text-[11px] font-semibold border transition-all ${
                          formData.tagReview === 'New Arrival'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs'
                            : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                        }`}
                      >
                        ✨ New Arrival
                      </button>
                      {formData.tagReview && (
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, tagReview: '' }))}
                          className="px-1.5 py-0.5 rounded text-[11px] font-medium text-slate-400 hover:text-rose-600"
                          title="Clear tag"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    name="tagReview"
                    list="tagReviewSuggestions"
                    value={formData.tagReview}
                    onChange={handleInputChange}
                    placeholder="e.g. Best Selling, New Arrival"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm transition-all focus:border-[#0145F2] focus:outline-none focus:ring-1 focus:ring-[#0145F2]"
                  />
                  <datalist id="tagReviewSuggestions">
                    <option value="Best Selling" />
                    <option value="New Arrival" />
                  </datalist>
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

        {/* Right: 2 Distinct Media Upload Sections & Category */}
        <div className="space-y-6">
          {/* Section 1: 3D Preview Photo (#1 Photo on Collection Page) */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-blue-100/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0145F2]">
                  <Layers size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">1. 3D Preview Photo</h3>
                  <p className="text-[11px] text-slate-400">#1 photo shown on collection page</p>
                </div>
              </div>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-[#0145F2] border border-blue-200/60">
                Cover / #1 Photo
              </span>
            </div>

            <div className="space-y-3">
              {preview3dPreviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {preview3dPreviews.map((prev, idx) => (
                    <div key={idx} className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 border-2 border-blue-500/30 group shadow-sm">
                      <img loading="lazy" src={prev} alt={`3D Preview ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePreview3d(idx)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                        title="Remove 3D preview photo"
                      >
                        <X size={15} />
                      </button>
                      <div className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-extrabold text-white bg-[#0145F2] rounded-md shadow-sm">
                        #1 3D Preview Photo
                      </div>
                    </div>
                  ))}
                  <label className="flex aspect-[3/1] w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-blue-300 bg-blue-50/30 transition-colors hover:bg-blue-50/60">
                    <Upload className="mb-1 text-[#0145F2]" size={16} />
                    <span className="text-xs font-semibold text-blue-700">Change 3D Preview</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handlePreview3dChange} />
                  </label>
                </div>
              ) : (
                <label className="flex aspect-[2/1] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/20 transition-colors hover:border-[#0145F2] hover:bg-blue-50/50">
                  <Upload className="mb-2 text-[#0145F2]" size={24} />
                  <span className="text-xs font-bold text-slate-700">Upload 3D Preview Photo</span>
                  <span className="mt-0.5 text-[10px] text-slate-400">Mockup, room scene, or 3D render (#1 photo)</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handlePreview3dChange} />
                </label>
              )}
            </div>
          </div>

          {/* Section 2: Simple Tile Photos (JPG / Faces / Randoms) */}
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-emerald-100/80">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <ImageIcon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">2. Simple Tile Photos (JPG)</h3>
                  <p className="text-[11px] text-slate-400">Flat tile faces shown on swipe</p>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700 border border-emerald-200/60">
                Swipe / Faces
              </span>
            </div>

            <div className="space-y-3">
              {jpgPreviews.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {jpgPreviews.map((prev, idx) => (
                    <div key={idx} className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 group shadow-2xs">
                      <img loading="lazy" src={prev} alt={`Tile Face ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeJpg(idx)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                        title="Remove this tile photo"
                      >
                        <X size={15} />
                      </button>
                      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 text-[10px] font-bold text-white bg-emerald-700/80 rounded">
                        JPG #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex aspect-[3/1] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-emerald-500 hover:bg-emerald-50/20">
                <Upload className="mb-1 text-slate-400" size={20} />
                <span className="text-xs font-semibold text-slate-600">Upload Simple Tile Photos (JPG)</span>
                <span className="text-[10px] text-slate-400">Add multiple plain tile faces & randoms</span>
                <input type="file" multiple className="hidden" accept="image/*" onChange={handleJpgChange} />
              </label>
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
                  required
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
              onClick={handleBack}
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
