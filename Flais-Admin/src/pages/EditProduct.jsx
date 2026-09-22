import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import axios from 'axios'; // Import axios
import { ArrowLeft, Upload, X, Save, RotateCcw, Layers, Image as ImageIcon, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { getImageUrl } from '../utils/api';

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const API = import.meta.env.VITE_BACKEND_URL; // Get API URL

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
    application: '',
    link360: '',
    randoms: '',
    collection: '',
    tagReview: '',
  });
  // 2 Distinct Image Upload Sections:
  // Section 1: 3D Preview (#1 Photo on collection page)
  const [existingPreviewImages, setExistingPreviewImages] = useState([]);
  const [newPreviewFiles, setNewPreviewFiles] = useState([]);
  const [newPreviewPreviews, setNewPreviewPreviews] = useState([]);

  // Section 2: Simple Tile Photos (JPG / Tile Faces / Randoms)
  const [existingJpgImages, setExistingJpgImages] = useState([]);
  const [newJpgFiles, setNewJpgFiles] = useState([]);
  const [newJpgPreviews, setNewJpgPreviews] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [appOptions, setAppOptions] = useState([]);

  // Fetch Categories & Filter Options
  useEffect(() => {
    const fetchSetupData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const [catRes, appRes] = await Promise.all([
          axios.get(`${API}/api/categories`, { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get(`${API}/api/filter-options?type=application`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        setCategories(catRes.data.categories || []);
        setAppOptions(appRes.data.options || []);
      } catch (error) {
      }
    };
    fetchSetupData();
  }, [API]);

  // 1. Fetch Real Data from Backend
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const { data } = await axios.get(`${API}/api/products/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (data.success) {
          setFormData({
            title: data.product.title,
            category: data.product.category,
            stock: data.product.stock,
            price: data.product.price,
            description: data.product.description || '',
            size: data.product.size || '',
            color: data.product.color || '',
            thickness: data.product.thickness || '',
            finishes: data.product.finishes || '',
            application: data.product.application || '',
            link360: data.product.link360 || '',
            randoms: data.product.randoms || '',
            collection: data.product.productCollection || '',
            tagReview: data.product.tagReview || '',
          });
          const allImgs = data.product.images || [];
          if (data.product.has3dPreview === false) {
            setExistingPreviewImages([]);
            setExistingJpgImages(allImgs);
          } else if (allImgs.length > 0) {
            setExistingPreviewImages([allImgs[0]]);
            setExistingJpgImages(allImgs.slice(1));
          } else {
            setExistingPreviewImages([]);
            setExistingJpgImages([]);
          }
        }
      } catch (error) {
        toast.error("Product not found");
        handleBack();
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id, API]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNewPreviewChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const updated = [...newPreviewFiles, ...files];
    setNewPreviewFiles(updated);

    const prevList = [];
    let loaded = 0;
    updated.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        prevList.push(reader.result);
        loaded++;
        if (loaded === updated.length) setNewPreviewPreviews(prevList);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingPreview = (idx) => {
    setExistingPreviewImages(prev => prev.filter((_, i) => i !== idx));
  };

  const removeNewPreview = (idx) => {
    setNewPreviewFiles(prev => prev.filter((_, i) => i !== idx));
    setNewPreviewPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleNewJpgChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const updated = [...newJpgFiles, ...files];
    setNewJpgFiles(updated);

    const prevList = [];
    let loaded = 0;
    updated.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        prevList.push(reader.result);
        loaded++;
        if (loaded === updated.length) setNewJpgPreviews(prevList);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeExistingJpg = (idx) => {
    setExistingJpgImages(prev => prev.filter((_, i) => i !== idx));
  };

  const removeNewJpg = (idx) => {
    setNewJpgFiles(prev => prev.filter((_, i) => i !== idx));
    setNewJpgPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // 2. Submit Changes to Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('adminToken');
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

      const totalAllImages = existingPreviewImages.length + newPreviewFiles.length + existingJpgImages.length + newJpgFiles.length;
      if (totalAllImages === 0) {
        toast.error("Please keep or upload at least one photo");
        setIsSubmitting(false);
        return;
      }

      const has3d = (existingPreviewImages.length + newPreviewFiles.length) > 0;
      data.append("has3dPreview", has3d ? "true" : "false");
      data.append("existingPreviewImages", JSON.stringify(existingPreviewImages));
      data.append("existingJpgImages", JSON.stringify(existingJpgImages));
      data.append("existingImages", JSON.stringify([...existingPreviewImages, ...existingJpgImages]));

      if (newPreviewFiles.length > 0) {
        newPreviewFiles.forEach((file) => {
          data.append("previewImages", file);
        });
      }

      if (newJpgFiles.length > 0) {
        newJpgFiles.forEach((file) => {
          data.append("images", file);
        });
      }

      const response = await axios.put(`${API}/api/products/${id}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        }
      });
      
      if (response.data.success) {
        toast.success('Piece updated successfully!');
        handleBack();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center text-slate-500 font-medium">Loading Product Details...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <button 
          type="button"
          onClick={handleBack}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50"
          title="Go Back to Collection"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Piece</h1>
          <p className="text-slate-500">Update piece details and inventory settings.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left: General Info */}
        <div className="lg:col-span-2 space-y-6">
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

        {/* Right: Media & Category */}
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
              {/* Existing 3D Preview */}
              {existingPreviewImages.map((img, idx) => (
                <div key={`exist-prev-${idx}`} className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 border-2 border-blue-500/30 group shadow-sm">
                  <img loading="lazy" src={getImageUrl(img)} alt={`3D Preview ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeExistingPreview(idx)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                    title="Remove 3D preview photo"
                  >
                    <X size={15} />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-extrabold text-white bg-[#0145F2] rounded-md shadow-sm">
                    #1 Active 3D Preview
                  </div>
                </div>
              ))}

              {/* Newly Uploaded 3D Preview */}
              {newPreviewPreviews.map((prev, idx) => (
                <div key={`new-prev-${idx}`} className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 border-2 border-indigo-500/30 group shadow-sm">
                  <img loading="lazy" src={prev} alt={`New 3D Preview ${idx + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewPreview(idx)}
                    className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                    title="Remove new 3D preview"
                  >
                    <X size={15} />
                  </button>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-extrabold text-white bg-indigo-600 rounded-md shadow-sm">
                    #1 New 3D Preview
                  </div>
                </div>
              ))}

              {existingPreviewImages.length === 0 && newPreviewPreviews.length === 0 ? (
                <label className="flex aspect-[2/1] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50/20 transition-colors hover:border-[#0145F2] hover:bg-blue-50/50">
                  <Upload className="mb-2 text-[#0145F2]" size={24} />
                  <span className="text-xs font-bold text-slate-700">Upload 3D Preview Photo</span>
                  <span className="mt-0.5 text-[10px] text-slate-400">Mockup, room scene, or 3D render (#1 photo)</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleNewPreviewChange} />
                </label>
              ) : (
                <label className="flex aspect-[3/1] w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-blue-300 bg-blue-50/30 transition-colors hover:bg-blue-50/60">
                  <Upload className="mb-1 text-[#0145F2]" size={16} />
                  <span className="text-xs font-semibold text-blue-700">Change / Replace 3D Preview</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleNewPreviewChange} />
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
              {(existingJpgImages.length > 0 || newJpgPreviews.length > 0) && (
                <div className="grid grid-cols-2 gap-3">
                  {/* Existing JPGs */}
                  {existingJpgImages.map((img, idx) => (
                    <div key={`exist-jpg-${idx}`} className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 group shadow-2xs">
                      <img loading="lazy" src={getImageUrl(img)} alt={`JPG Face ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeExistingJpg(idx)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                        title="Remove this tile photo"
                      >
                        <X size={15} />
                      </button>
                      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 text-[10px] font-bold text-white bg-emerald-700/80 rounded">
                        Active JPG #{idx + 1}
                      </div>
                    </div>
                  ))}

                  {/* New JPGs */}
                  {newJpgPreviews.map((prev, idx) => (
                    <div key={`new-jpg-${idx}`} className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 border border-slate-200 group shadow-2xs">
                      <img loading="lazy" src={prev} alt={`New JPG ${idx + 1}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeNewJpg(idx)}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-transform hover:scale-110 active:scale-95"
                        title="Remove new tile photo"
                      >
                        <X size={15} />
                      </button>
                      <div className="absolute bottom-2 left-2 px-1.5 py-0.5 text-[10px] font-bold text-white bg-green-600/90 rounded">
                        New JPG #{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <label className="flex aspect-[3/1] w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 transition-colors hover:border-emerald-500 hover:bg-emerald-50/20">
                <Upload className="mb-1 text-slate-400" size={20} />
                <span className="text-xs font-semibold text-slate-600">Upload Simple Tile Photos (JPG)</span>
                <span className="text-[10px] text-slate-400">Add multiple plain tile faces & randoms</span>
                <input type="file" multiple className="hidden" accept="image/*" onChange={handleNewJpgChange} />
              </label>
            </div>
          </div>

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

          <div className="flex flex-col gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0145F2] py-3 text-sm font-bold text-white shadow-lg shadow-blue-200 transition-all hover:bg-blue-700 active:scale-95 disabled:bg-blue-300"
            >
              {isSubmitting ? 'Updating...' : <><Save size={18} /> Update Piece</>}
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()} // Simply reload to reset to DB state
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-50"
            >
              <RotateCcw size={18} /> Reset Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProduct;
