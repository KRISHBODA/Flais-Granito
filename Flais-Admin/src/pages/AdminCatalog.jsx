import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Save, BookOpen, Eye, FileText, Link, Settings, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const emptyCatalog = { title: '', description: '', image: '', link: '' };

const uploadToCloudinary = async (BackendUrl, file, label, { raw = false } = {}) => {
  if (!file) {
    throw new Error(`No ${label} selected`);
  }

  const uploadToast = toast.loading(`Uploading ${label}...`);
  try {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('file', file);


    const endpoint = '/api/admin/upload';
    formData.append('category', 'catalogs');
    const res = await axios.post(`${BackendUrl}${endpoint}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });


    const fileUrl = res.data?.fileUrl;
    if (!fileUrl) {
      throw new Error(`Backend did not return a ${label} URL`);
    }

    toast.success(`${label} uploaded!`, { id: uploadToast });
    return fileUrl;
  } catch (err) {
    toast.error(`Failed to upload ${label}`, { id: uploadToast });
    throw err;
  }
};

// ─── Catalog Form Modal ───────────────────────────────────────────────────────
const CatalogModal = ({ catalog, onSave, onClose }) => {
  const BackendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').trim();
  const [form, setForm] = useState(catalog || emptyCatalog);
  const [preview, setPreview] = useState(catalog?.image || '');
  const [pdfSource, setPdfSource] = useState(() => {
    if (catalog?.link && (catalog.link.includes('.pdf') || catalog.link.startsWith('indexeddb://'))) return 'file';
    return 'url';
  });
  const [pdfFileName, setPdfFileName] = useState(() => {
    if (catalog?.link && catalog.link !== '#') {
      const parts = catalog.link.split('/');
      return parts[parts.length - 1];
    }
    return '';
  });
  const fileRef = useRef();

  const handleImageFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const url = await uploadToCloudinary(BackendUrl, file, 'cover image');
      setPreview(url);
      setForm((f) => ({ ...f, image: url }));
    } catch (err) {
      toast.error("Failed to upload image");
    }
  };

  const handleSave = () => {
    if (!form.title) { toast.error('Title is required.'); return; }
    if (!form.image) { toast.error('Cover image is required.'); return; }
    if (pdfSource === 'file' && (!form.link || form.link === '#')) {
      toast.error('Please upload a PDF file.');
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900">
            {catalog?.id ? 'Edit Catalog' : 'Add New Catalog'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-100 text-slate-500">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Cover Image */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Cover Image <span className="text-red-500">*</span>
            </label>
            {preview ? (
              <div className="relative rounded-xl overflow-hidden h-44 bg-slate-100">
                <img loading="lazy" src={preview} alt="preview" className="w-full h-full object-cover" />
                <button
                  onClick={() => { setPreview(''); setForm(f => ({ ...f, image: '' })); }}
                  className="absolute top-2 right-2 bg-white/80 rounded-full p-1 hover:bg-white shadow"
                >
                  <X size={16} className="text-red-500" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileRef.current.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-[#0145F2] hover:bg-blue-50/30 transition-all"
              >
                <Upload size={28} className="mx-auto text-slate-400 mb-2" />
                <p className="text-sm text-slate-500">Click to upload cover image</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 10MB</p>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Catalog Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Premium Floor Collection 2026"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#0145F2] focus:outline-none"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              placeholder="Short description of this catalog..."
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm focus:border-[#0145F2] focus:outline-none resize-none"
            />
          </div>

          {/* PDF Source & Selection */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Catalog PDF Source</label>
            <div className="space-y-3">
              <div className="flex gap-4 text-xs font-semibold text-slate-500 mb-1">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pdfSource"
                    checked={pdfSource === 'file'}
                    onChange={() => setPdfSource('file')}
                  />
                  Upload PDF File
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="pdfSource"
                    checked={pdfSource === 'url'}
                    onChange={() => setPdfSource('url')}
                  />
                  Enter PDF URL
                </label>
              </div>

              {pdfSource === 'file' ? (
                <div>
                  {form.link && form.link !== '#' && !form.link.startsWith('indexeddb://') ? (
                    <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-700">
                      <span className="truncate max-w-[250px] font-bold">
                        {pdfFileName || "PDF File Attached"}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setPdfFileName('');
                          setForm((f) => ({ ...f, link: '#' }));
                        }}
                        className="text-red-500 hover:underline"
                      >
                        Remove file
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#0145F2] hover:bg-blue-50/10 rounded-xl p-6 cursor-pointer transition-all">
                      <Upload className="text-[#0145F2] mb-1.5" size={20} />
                      <span className="text-xs font-bold text-slate-700">Choose PDF File</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">PDF up to 50MB</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            try {
                              const url = await uploadToCloudinary(BackendUrl, file, 'PDF brochure', { raw: true });
                              setPdfFileName(file.name);
                              setForm(f => ({ ...f, link: url }));
                            } catch (err) {
                              toast.error("Failed to upload PDF");
                            }
                          }
                        }}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <div className="relative">
                  <Link size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="https://... or leave # for no link"
                    value={form.link?.startsWith('indexeddb://') ? '' : form.link}
                    onChange={(e) => setForm(f => ({ ...f, link: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2.5 text-sm focus:border-[#0145F2] focus:outline-none"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#0145F2] py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all"
          >
            <Save size={16} /> Save Catalog
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Main AdminCatalog Page ───────────────────────────────────────────────────
const AdminCatalog = () => {
  const [activeTab, setActiveTab] = useState('brochures');
  const [loading, setLoading] = useState(true);
  const BackendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').trim();

  const [pageSettings, setPageSettings] = useState({
    heroTitle: "DOWNLOAD CATALOGS",
    heroSubtitle: "Explore and download our premium vitrified tiles collection brochures.",
    heroMedia: ""
  });

  const [catalogs, setCatalogs] = useState([]);

  useEffect(() => {
    fetchCatalogPage();
  }, []);

  const fetchCatalogPage = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BackendUrl}/api/catalog`);
      if (res.data.success && res.data.catalog) {
        const page = res.data.catalog;
        if (page.pageSettings) setPageSettings(page.pageSettings);
        if (Array.isArray(page.catalogs)) setCatalogs(page.catalogs);
      }
    } catch (err) {
      toast.error("Failed to load catalogs");
    } finally {
      setLoading(false);
    }
  };

  const persistCatalogPage = async (overrides = {}) => {
    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        catalog: {
          pageSettings: overrides.pageSettings ?? pageSettings,
          catalogs: overrides.catalogs ?? catalogs
        }
      };
      const res = await axios.put(`${BackendUrl}/api/catalog`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.success;
    } catch (error) {
      toast.error("Failed to save catalog details to database");
      return false;
    }
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    const success = await persistCatalogPage({ pageSettings });
    if (success) {
      toast.success('Catalog page settings saved!');
    }
  };

  const [showModal, setShowModal] = useState(false);
  const [modalCatalog, setModalCatalog] = useState(null);

  const openAdd  = () => { setModalCatalog(null); setShowModal(true); };
  const openEdit = (cat) => { setModalCatalog(cat); setShowModal(true); };

  const handleSave = async (form) => {
    const catalogId = modalCatalog?._id || modalCatalog?.id;
    let finalForm = { ...form };
    
    // Preserve MongoDB _id if it exists, otherwise use id or generate new
    if (catalogId) {
      if (modalCatalog._id) finalForm._id = modalCatalog._id;
      if (modalCatalog.id) finalForm.id = modalCatalog.id;
    } else {
      finalForm.id = Date.now();
    }

    let updated;
    if (catalogId) {
      // Update existing - match by _id first (MongoDB), then id
      updated = catalogs.map(c => {
        if (modalCatalog._id && c._id === modalCatalog._id) {
          return { ...c, ...finalForm };
        }
        if (modalCatalog.id && c.id === modalCatalog.id && !modalCatalog._id) {
          return { ...c, ...finalForm };
        }
        return c;
      });
    } else {
      // Add new
      updated = [...catalogs, finalForm];
    }
    
    setCatalogs(updated);
    const success = await persistCatalogPage({ catalogs: updated });
    if (success) {
      toast.success(catalogId ? 'Catalog updated!' : 'Catalog added!');
      setShowModal(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this catalog?')) {
      const updated = catalogs.filter(c => {
        const catalogId = c._id || c.id;
        const shouldKeep = catalogId !== id;
        return shouldKeep;
      });
      setCatalogs(updated);
      const success = await persistCatalogPage({ catalogs: updated });
      if (success) {
        toast.success('Catalog deleted!');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Catalog Management</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {activeTab === 'brochures' ? `${catalogs.length} catalog${catalogs.length !== 1 ? 's' : ''} — manage cover images, descriptions, and PDF links.` : 'Customize catalog download page titles, description, and hero media.'}
          </p>
        </div>
        {activeTab === 'brochures' && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-all shadow-sm w-fit"
          >
            <Plus size={18} /> Add Catalog
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('brochures')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'brochures'
              ? 'border-[#0145F2] text-[#0145F2]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <BookOpen size={18} />
          Catalog Brochures
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'settings'
              ? 'border-[#0145F2] text-[#0145F2]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings size={18} />
          Page Settings
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#0145F2] mb-3" size={40} />
          <p className="text-slate-500 font-semibold text-sm">Loading catalogs from database...</p>
        </div>
      ) : (
        <>
          {activeTab === 'brochures' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {catalogs.map((cat, idx) => (
            <div
              key={cat.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-all duration-300"
            >
              {/* Cover Image */}
              <div className="relative h-48 overflow-hidden bg-slate-100">
                {cat.image ? (
                  <img loading="lazy"
                    src={cat.image}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={48} className="text-slate-300" />
                  </div>
                )}
                {/* Index badge */}
                <span className="absolute top-3 left-3 bg-[#0145F2] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                  #{idx + 1}
                </span>
                {/* Action overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                  {cat.link && cat.link !== '#' && (
                    <a
                      href={cat.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-700 hover:bg-blue-50 transition-colors shadow"
                      title="Preview"
                    >
                      <Eye size={18} />
                    </a>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-base leading-tight">{cat.title}</h3>
                  <p className="text-slate-500 text-sm mt-1 line-clamp-2 leading-relaxed">{cat.description || '—'}</p>
                </div>

                {/* PDF Link */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FileText size={13} />
                  <span className="truncate max-w-[200px]">
                    {cat.link && cat.link !== '#' ? cat.link : 'No PDF link set'}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => openEdit(cat)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    <Edit size={15} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id || cat.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-semibold text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {catalogs.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-slate-500">No catalogs yet.</p>
              <p className="text-sm mt-1">Click "Add Catalog" to get started.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Catalog Page Settings</h2>
            <p className="text-sm text-slate-500">Customize catalog download page header title, subtitle, and cover media.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Title</label>
              <input
                type="text"
                value={pageSettings.heroTitle}
                onChange={(e) => setPageSettings({ ...pageSettings, heroTitle: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                placeholder="DOWNLOAD CATALOGS"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Subtitle</label>
              <textarea
                value={pageSettings.heroSubtitle}
                onChange={(e) => setPageSettings({ ...pageSettings, heroSubtitle: e.target.value })}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                placeholder="Describe your catalog offerings..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Banner Image/Media File</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    try {
                      const url = await uploadToCloudinary(BackendUrl, file, 'hero media');
                      setPageSettings((prev) => ({ ...prev, heroMedia: url }));
                    } catch (err) {
                      toast.error("Failed to upload hero media");
                    }
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
              />
              {pageSettings.heroMedia && (
                <div className="relative mt-2 h-20 w-36 border border-slate-200 rounded overflow-hidden">
                  {pageSettings.heroMedia.startsWith('data:video/') || 
                   /\.(mp4|webm|ogg|mov|m4v)$/i.test(pageSettings.heroMedia) ? (
                    <video src={pageSettings.heroMedia} className="h-full w-full object-cover" muted />
                  ) : (
                    <img src={pageSettings.heroMedia} alt="preview" className="h-full w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setPageSettings(prev => ({ ...prev, heroMedia: '' }))}
                    className="absolute top-1 right-1 bg-white/80 rounded-full p-0.5 hover:bg-white shadow"
                  >
                    <X size={12} className="text-red-500" />
                  </button>
                </div>
              )}
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
        </>
      )}

      {/* Modal */}
      {showModal && (
        <CatalogModal
          catalog={modalCatalog}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AdminCatalog;
