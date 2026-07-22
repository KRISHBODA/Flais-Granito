import React, { useState, useRef, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Save, BookOpen, Eye, FileText, Link, Settings, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import { getImageUrl } from '../utils/api';

const emptyCatalog = {
  title: '',
  image: '',
  link: '',
  availableSizes: '',
  thickness: '',
  sequenceNumber: ''
};

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
const CatalogModal = ({ catalog, catalogs, onSave, onClose }) => {
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
    if (form.sequenceNumber === undefined || form.sequenceNumber === null || form.sequenceNumber === '') {
      toast.error('Sequence number is required.');
      return;
    }
    const seqNum = parseInt(form.sequenceNumber, 10);
    if (isNaN(seqNum)) {
      toast.error('Sequence number must be a valid number.');
      return;
    }
    // Check for duplicate sequence numbers
    const isDuplicate = catalogs.some(c => {
      const catalogId = catalog?._id || catalog?.id;
      const currentId = c._id || c.id;
      if (catalogId && currentId === catalogId) return false;
      return c.sequenceNumber === seqNum;
    });
    if (isDuplicate) {
      toast.error(`Sequence number ${seqNum} is already in use by another catalog.`);
      return;
    }
    if (!form.image) { toast.error('Cover image is required.'); return; }
    if (pdfSource === 'file' && (!form.link || form.link === '#')) {
      toast.error('Please upload a PDF file.');
      return;
    }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[1.75rem] shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#0145F2]">
              Catalog entry
            </p>
            <h2 className="mt-1 text-xl font-bold text-slate-900">
              {catalog?._id || catalog?.id ? 'Edit catalog details' : 'Add new catalog'}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Save the cover, brochure link, and the technical values used on the public catalog page.
            </p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[75vh] overflow-y-auto bg-slate-50/60 p-4 sm:p-6">
          <div className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-3">
                <label className="block text-sm font-semibold text-slate-800 mb-1">
                  Cover image <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-slate-500">Use a clean cover image for the card shown on the public catalog page.</p>
              </div>
              {preview ? (
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100">
                  <img loading="lazy" src={getImageUrl(preview)} alt="preview" className="h-52 w-full object-cover" />
                  <button
                    onClick={() => { setPreview(''); setForm(f => ({ ...f, image: '' })); }}
                    className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-red-500 shadow-md transition-colors hover:bg-white"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileRef.current.click()}
                  className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition-all hover:border-[#0145F2] hover:bg-blue-50/40"
                >
                  <Upload size={30} className="mb-3 text-slate-400 transition-colors group-hover:text-[#0145F2]" />
                  <p className="text-sm font-semibold text-slate-700">Click to upload a cover image</p>
                  <p className="mt-1 text-xs text-slate-500">PNG, JPG, or WebP works best.</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Catalog details</h3>
                <p className="mt-1 text-xs text-slate-500">These fields define how the catalog appears and sorts.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-semibold text-slate-800 mb-1">
                    Catalog title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Premium Floor Collection 2026"
                    value={form.title}
                    onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#0145F2] focus:bg-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-1">
                    Sequence number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1"
                    value={form.sequenceNumber ?? ''}
                    onChange={(e) => setForm(f => ({ ...f, sequenceNumber: e.target.value === '' ? '' : parseInt(e.target.value, 10) }))}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#0145F2] focus:bg-white"
                  />
                </div>
                <div className="sm:col-span-2 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1">
                      Available sizes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 600x600, 600x1200"
                      value={form.availableSizes ?? ''}
                      onChange={(e) => setForm(f => ({ ...f, availableSizes: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#0145F2] focus:bg-white"
                    />
                    <p className="mt-2 text-xs text-slate-500">Separate multiple sizes with commas.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-800 mb-1">
                      Thickness
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 8mm, 10mm, 12mm"
                      value={form.thickness ?? ''}
                      onChange={(e) => setForm(f => ({ ...f, thickness: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#0145F2] focus:bg-white"
                    />
                    <p className="mt-2 text-xs text-slate-500">This also accepts comma-separated values.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="mb-4">
                <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Brochure source</h3>
                <p className="mt-1 text-xs text-slate-500">Upload a PDF or link to one directly.</p>
              </div>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setPdfSource('file')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      pdfSource === 'file'
                        ? 'bg-[#0145F2] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Upload PDF
                  </button>
                  <button
                    type="button"
                    onClick={() => setPdfSource('url')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                      pdfSource === 'url'
                        ? 'bg-[#0145F2] text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Use PDF URL
                  </button>
                </div>

                {pdfSource === 'file' ? (
                  <div>
                    {form.link && form.link !== '#' && !form.link.startsWith('indexeddb://') ? (
                      <div className="flex items-center justify-between gap-3 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-700">
                        <span className="truncate font-bold">
                          {pdfFileName || "PDF file attached"}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setPdfFileName('');
                            setForm((f) => ({ ...f, link: '#' }));
                          }}
                          className="font-semibold text-red-500 transition-colors hover:text-red-600"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <label className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center transition-all hover:border-[#0145F2] hover:bg-blue-50/40">
                        <Upload className="mb-2 text-[#0145F2]" size={22} />
                        <span className="text-sm font-semibold text-slate-700">Choose a PDF brochure</span>
                        <span className="mt-1 text-xs text-slate-500">Upload the file used for view and download actions.</span>
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
                    <Link size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Paste a direct PDF URL here"
                      value={form.link?.startsWith('indexeddb://') ? '' : form.link}
                      onChange={(e) => setForm(f => ({ ...f, link: e.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-[#0145F2] focus:bg-white"
                    />
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-100 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-semibold text-slate-600 transition-all hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-[#0145F2] py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700"
          >
            <Save size={16} /> Save catalog
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
          <h1 className="text-2xl font-bold text-slate-900">Catalog library</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {activeTab === 'brochures'
              ? `${catalogs.length} catalog${catalogs.length !== 1 ? 's' : ''} published. Manage covers, brochure links, and the filter values used on the public catalog page.`
              : 'Adjust the catalog page header, supporting text, and hero media.'}
          </p>
        </div>
        {activeTab === 'brochures' && (
          <button
            onClick={openAdd}
            className="flex items-center gap-2 rounded-2xl bg-[#0145F2] px-4 py-2.5 text-sm font-semibold text-white transition-all shadow-sm w-fit hover:bg-blue-700"
          >
            <Plus size={18} /> Add catalog
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
          Catalog entries
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
          Page settings
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#0145F2] mb-3" size={40} />
          <p className="text-slate-500 font-semibold text-sm">Loading catalog data from the database...</p>
        </div>
      ) : (
        <>
          {activeTab === 'brochures' && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...catalogs].sort((a, b) => (a.sequenceNumber ?? 0) - (b.sequenceNumber ?? 0)).map((cat, idx) => (
            <div
              key={cat.id}
              className="group overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              {/* Cover Image */}
              <div className="relative h-52 overflow-hidden bg-slate-100">
                {cat.image ? (
                  <img loading="lazy"
                    src={getImageUrl(cat.image)}
                    alt={cat.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <BookOpen size={48} className="text-slate-300" />
                  </div>
                )}
                {/* Index badge */}
                <span className="absolute top-3 left-3 rounded-full bg-[#0145F2] px-2.5 py-1 text-xs font-bold text-white shadow">
                  Seq #{cat.sequenceNumber}
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
              <div className="space-y-3 p-5">
                <div>
                  <h3 className="text-base font-bold leading-tight text-slate-900">{cat.title}</h3>
                </div>

                {/* PDF Link */}
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <FileText size={13} />
                  <span className="truncate max-w-[200px]">
                    {cat.link && cat.link !== '#' ? cat.link : 'PDF link not set'}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {cat.availableSizes && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                      Sizes: {cat.availableSizes}
                    </span>
                  )}
                  {cat.thickness && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                      Thickness: {cat.thickness}
                    </span>
                  )}
                </div>

                {/* Flipbook Conversion Status */}
                {cat.conversionStatus && cat.conversionStatus !== 'none' && (
                  <div className="flex items-center gap-2 text-xs">
                    {cat.conversionStatus === 'pending' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 font-semibold border border-amber-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Conversion Queued
                      </span>
                    )}
                    {cat.conversionStatus === 'processing' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 font-semibold border border-blue-100">
                        <Loader2 size={12} className="animate-spin" />
                        Converting...
                      </span>
                    )}
                    {cat.conversionStatus === 'completed' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-semibold border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Flipbook Ready
                      </span>
                    )}
                    {cat.conversionStatus === 'failed' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 text-red-500 font-semibold border border-red-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                        Conversion Failed
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 border-t border-slate-100 pt-2">
                  <button
                    onClick={() => openEdit(cat)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-blue-50 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-100"
                  >
                    <Edit size={15} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(cat._id || cat.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-2xl bg-red-50 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-100"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {catalogs.length === 0 && (
            <div className="col-span-full rounded-3xl border border-slate-100 bg-white py-20 text-center text-slate-400">
              <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
              <p className="font-semibold text-slate-500">No catalog entries yet.</p>
              <p className="mt-1 text-sm">Add the first catalog to start publishing brochures and filter values.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 rounded-3xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Catalog page settings</h2>
            <p className="text-sm text-slate-500">Set the page headline, supporting copy, and hero media shown to customers.</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hero title</label>
              <input
                type="text"
                value={pageSettings.heroTitle}
                onChange={(e) => setPageSettings({ ...pageSettings, heroTitle: e.target.value })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                placeholder="Download catalogs"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hero subtitle</label>
              <textarea
                value={pageSettings.heroSubtitle}
                onChange={(e) => setPageSettings({ ...pageSettings, heroSubtitle: e.target.value })}
                rows={3}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                placeholder="Write a short line about the catalogs..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hero banner media</label>
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
                <div className="relative mt-2 h-20 w-36 overflow-hidden rounded-xl border border-slate-200">
                  {pageSettings.heroMedia.startsWith('data:video/') || 
                   /\.(mp4|webm|ogg|mov|m4v)$/i.test(pageSettings.heroMedia) ? (
                    <video src={pageSettings.heroMedia} className="h-full w-full object-cover" muted />
                  ) : (
                    <img src={pageSettings.heroMedia} alt="preview" className="h-full w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => setPageSettings(prev => ({ ...prev, heroMedia: '' }))}
                    className="absolute right-1 top-1 rounded-full bg-white/80 p-0.5 shadow hover:bg-white"
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
              className="flex items-center gap-2 rounded-2xl bg-[#0145F2] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700"
            >
              <Save size={18} /> Save settings
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
          catalogs={catalogs}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default AdminCatalog;
