import React, { useState, useEffect } from 'react';
import {
  Shield, Flag, Clock, Plus, Edit, Trash2, Layout, Save, Info,
  Sparkles, Film, Eye, Globe, FileText, Layers, MapPin, X, Check, Map, Loader2, Image
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import aboutHeroImg from '../assets/about-hero-new.jpg';

const iconMap = { Shield, Sparkles, Layout, Layers, Flag, Clock, Globe, Info };

// ─── Default Export Countries ─────────────────
const DEFAULT_EXPORT_COUNTRIES = [];

const initialVideos = { flaisFilm: '', exhibition: '' };
const initialValues = [];

const EMPTY_COUNTRY = {
  id: null,
  name: '',
  fullName: '',
  coordinates: ['', ''],
  flag: '',
};

// ─── Component ────────────────────────────────────────────────────────────────
const AdminWhyFlais = () => {
  const [activeTab, setActiveTab] = useState('media');
  const [loading, setLoading] = useState(true);
  const [uploadingField, setUploadingField] = useState(null); // Track which field is uploading
  const BackendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').trim();

  // ── About page text/image settings
  const [aboutSettings, setAboutSettings] = useState({
    heroTitle: '',
    heroSubtitle: '',
    heroImage: '',
    narrativeTitle: '',
    narrativeDesc1: '',
    narrativeDesc2: '',
    narrativeImage: '',
    statYears: '',
    statDealers: '',
    statCountries: '',
    statDesigns: '',
    manuTitle: '',
    manuDesc1: '',
    manuDesc2: '',
    manuImage: '',
    sustainTitle: '',
    sustainDesc1: '',
    sustainDesc2: '',
    sustainImage: '',
    filmTitle: '',
    filmDesc1: '',
    filmDesc2: '',
    filmDesc3: '',
    exportTitle: '',
    exportDesc: '',
    exportStat1Value: '',
    exportStat1Label: '',
    exportStat1Icon: '',
    exportStat2Value: '',
    exportStat2Label: '',
    exportStat2Icon: '',
    exportStat3Value: '',
    exportStat3Label: '',
    exportStat3Icon: '',
    exportStat4Value: '',
    exportStat4Label: '',
    exportStat4Icon: '',
  });

  // ── Videos
  const [videos, setVideos] = useState(initialVideos);

  // ── Brand Pillars
  const [values, setValues] = useState(initialValues);
  const [editingValue, setEditingValue] = useState(null); // null | value object
  const [showAddValue, setShowAddValue] = useState(false);
  const [newValue, setNewValue] = useState({ id: null, title: '', desc: '', icon: 'Shield' });

  // ── Export Countries
  const [exportCountries, setExportCountries] = useState(DEFAULT_EXPORT_COUNTRIES);
  const [editingCountry, setEditingCountry] = useState(null); // null | country object
  const [showAddCountry, setShowAddCountry] = useState(false);
  const [newCountry, setNewCountry] = useState({ ...EMPTY_COUNTRY });

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        await fetchAboutPage();
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const fetchAboutPage = async () => {
    try {
      const res = await axios.get(`${BackendUrl}/api/about`);
      const about = res.data.about || {};
      if (about.aboutSettings) {
        setAboutSettings((prev) => ({ ...prev, ...about.aboutSettings }));
      }
      if (about.videos) {
        setVideos((prev) => ({ ...prev, ...about.videos }));
      }
      if (Array.isArray(about.pillars)) setValues(about.pillars);
      if (Array.isArray(about.exportCountries)) setExportCountries(about.exportCountries);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error('Failed to load database settings: ' + errorMsg);
    }
  };

  const persistAboutPage = async (overrides = {}) => {
    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        about: {
          aboutSettings: overrides.aboutSettings ?? aboutSettings,
          videos: overrides.videos ?? videos,
          pillars: overrides.values ?? values,
          exportCountries: overrides.exportCountries ?? exportCountries,
        },
      };
      const res = await axios.put(`${BackendUrl}/api/about`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return true;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error('Failed to save about page data: ' + errorMsg);
      return false;
    }
  };

  const uploadFileToBackend = async (file, isVideo = false) => {
    const token = localStorage.getItem('adminToken');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'about');
    
    const endpoint = '/api/admin/upload';
    
    const res = await axios.post(`${BackendUrl}${endpoint}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const fileUrl = res.data.fileUrl || res.data.url;
    
    if (!fileUrl) {
      throw new Error('Upload response did not contain a file URL');
    }
    
    return fileUrl;
  };

  const handleUpload = async (file, field, isVideo = false) => {
    const loadingToast = toast.loading(`Uploading ${isVideo ? 'video' : 'image'}...`);
    setUploadingField(field); // Set uploading state
    try {
      const fileUrl = await uploadFileToBackend(file, isVideo);
      if (isVideo) {
        const updatedVideos = { ...videos, [field]: fileUrl };
        setVideos(updatedVideos);
        await persistAboutPage({ videos: updatedVideos });
      } else {
        const updatedSettings = { ...aboutSettings, [field]: fileUrl };
        setAboutSettings(updatedSettings);
        await persistAboutPage({ aboutSettings: updatedSettings });
      }
      toast.success(`${isVideo ? 'Video' : 'Image'} uploaded successfully!`, { id: loadingToast });
    } catch (err) {
      toast.error(`Failed to upload ${isVideo ? 'video' : 'image'}.`, { id: loadingToast });
    } finally {
      setUploadingField(null); // Clear uploading state
    }
  };

  const handleSavePillars = async (updated) => {
    setValues(updated);
    await persistAboutPage({ values: updated });
  };

  const handleDeletePillar = async (id) => {
    if (window.confirm('Are you sure you want to remove this brand pillar?')) {
      const updated = values.filter(v => v.id !== id);
      await handleSavePillars(updated);
      toast.success('Brand pillar removed.');
    }
  };

  const handleSaveEditPillar = () => {
    if (!editingValue.title || !editingValue.desc) {
      toast.error('Title and description are required.');
      return;
    }
    const updated = values.map(v =>
      v.id === editingValue.id ? editingValue : v
    );
    handleSavePillars(updated);
    setEditingValue(null);
    toast.success('Brand pillar updated!');
  };

  const handleAddPillar = () => {
    if (!newValue.title || !newValue.desc) {
      toast.error('Title and description are required.');
      return;
    }
    const added = { ...newValue, id: Date.now() };
    handleSavePillars([...values, added]);
    setNewValue({ id: null, title: '', desc: '', icon: 'Shield' });
    setShowAddValue(false);
    toast.success('New brand pillar added!');
  };

  // ── Tabs
  const tabs = [
    { id: 'media', label: 'Photos', icon: Layout },
    { id: 'videos', label: 'Videos', icon: Film },
    { id: 'pillars', label: 'Brand Pillars', icon: Info },
    { id: 'texts', label: 'Page Texts', icon: FileText },
    { id: 'export', label: 'Export Details', icon: Map },
  ];

  // ── Save all
  const handleSave = async () => {
    const success = await persistAboutPage();
    if (success) {
      toast.success('Why FLAIS configurations finalized successfully!');
    }
  };

  // ── Export country helpers
  const saveExportCountries = async (updated) => {
    setExportCountries(updated);
    await persistAboutPage({ exportCountries: updated });
  };

  const handleDeleteCountry = async (id) => {
    if (window.confirm('Remove this export country from the map?')) {
      const updated = exportCountries.filter(c => c.id !== id);
      await saveExportCountries(updated);
      toast.success('Country removed from map.');
    }
  };

  const handleSaveEditCountry = () => {
    if (!editingCountry.fullName) {
      toast.error('Full country name is required.');
      return;
    }
    const lat = parseFloat(editingCountry.coordinates[1]);
    const lng = parseFloat(editingCountry.coordinates[0]);
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Please enter valid longitude and latitude numbers.');
      return;
    }
    const autoName = editingCountry.fullName.trim().split(' ').length <= 2
      ? editingCountry.fullName.trim()
      : editingCountry.fullName.trim().split(' ').map(w => w[0]).join('').toUpperCase();
    const updated = exportCountries.map(c =>
      c.id === editingCountry.id
        ? { ...editingCountry, name: autoName, coordinates: [lng, lat] }
        : c
    );
    saveExportCountries(updated);
    setEditingCountry(null);
    toast.success('Country updated on map!');
  };

  const handleAddCountry = () => {
    if (!newCountry.fullName) {
      toast.error('Full country name is required.');
      return;
    }
    const lat = parseFloat(newCountry.coordinates[1]);
    const lng = parseFloat(newCountry.coordinates[0]);
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Please enter valid longitude and latitude numbers.');
      return;
    }
    const id = Date.now();
    const autoName = newCountry.fullName.trim().split(' ').length <= 2
      ? newCountry.fullName.trim()
      : newCountry.fullName.trim().split(' ').map(w => w[0]).join('').toUpperCase();
    const added = { ...newCountry, id, name: autoName, coordinates: [lng, lat] };
    saveExportCountries([...exportCountries, added]);
    setNewCountry({ ...EMPTY_COUNTRY });
    setShowAddCountry(false);
    toast.success(`${added.fullName} added to the map!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900">"Why FLAIS" Management</h1>
          <p className="text-slate-500 text-sm">Update every photo, video, brand pillar, and export market on your About page.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-6 py-3 font-bold text-white hover:bg-blue-700 transition-all shadow-lg">
          <Save size={18} /> Finalize Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === tab.id ? 'bg-[#0145F2] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <tab.icon size={17} /> {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#0145F2] mb-3" size={40} />
          <p className="text-slate-500 font-semibold text-sm">Loading settings from database...</p>
        </div>
      ) : (
        <>
          {/* ── TAB: Photos ────────────────── */}
      {activeTab === 'media' && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Hero Image */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Layout size={18} /> Hero Banner Photo</h3>
            <div className="aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center relative">
              {uploadingField === 'heroImage' ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-[#0145F2]" size={32} />
                  <span className="text-xs font-semibold text-slate-500">Uploading...</span>
                </div>
              ) : aboutSettings.heroImage ? (
                <img loading="lazy" src={aboutSettings.heroImage} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <Image size={24} className="opacity-60" />
                  <span className="text-[10px]">No image uploaded</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleUpload(file, 'heroImage');
            }} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100" disabled={uploadingField === 'heroImage'} />
          </div>

          {/* Narrative Image */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Eye size={18} /> Narrative Section Photo</h3>
            <div className="aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center relative">
              {uploadingField === 'narrativeImage' ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-[#0145F2]" size={32} />
                  <span className="text-xs font-semibold text-slate-500">Uploading...</span>
                </div>
              ) : aboutSettings.narrativeImage ? (
                <img loading="lazy" src={aboutSettings.narrativeImage} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <Image size={24} className="opacity-60" />
                  <span className="text-[10px]">No image uploaded</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleUpload(file, 'narrativeImage');
            }} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100" disabled={uploadingField === 'narrativeImage'} />
          </div>

          {/* Manufacturing Image */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Layout size={18} /> Manufacturing Photo</h3>
            <div className="aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center relative">
              {uploadingField === 'manuImage' ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-[#0145F2]" size={32} />
                  <span className="text-xs font-semibold text-slate-500">Uploading...</span>
                </div>
              ) : aboutSettings.manuImage ? (
                <img loading="lazy" src={aboutSettings.manuImage} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <Image size={24} className="opacity-60" />
                  <span className="text-[10px]">No image uploaded</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleUpload(file, 'manuImage');
            }} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100" disabled={uploadingField === 'manuImage'} />
          </div>

          {/* Sustainability Image */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Layout size={18} /> Sustainability Photo</h3>
            <div className="aspect-video rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center relative">
              {uploadingField === 'sustainImage' ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="animate-spin text-[#0145F2]" size={32} />
                  <span className="text-xs font-semibold text-slate-500">Uploading...</span>
                </div>
              ) : aboutSettings.sustainImage ? (
                <img loading="lazy" src={aboutSettings.sustainImage} className="w-full h-full object-cover" alt="" />
              ) : (
                <div className="flex flex-col items-center gap-1 text-slate-400">
                  <Image size={24} className="opacity-60" />
                  <span className="text-[10px]">No image uploaded</span>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleUpload(file, 'sustainImage');
            }} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100" disabled={uploadingField === 'sustainImage'} />
          </div>
        </div>
      )}

      {/* ── TAB: Videos ────────────────── */}
      {activeTab === 'videos' && (
        <div className="max-w-2xl bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-bold text-slate-800 flex items-center gap-2"><Film size={18} /> Flais Film (Brand Video)</h3>
          <div className="aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center text-white/40 relative">
            {uploadingField === 'flaisFilm' ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-white" size={40} />
                <span className="text-sm font-semibold text-white/70">Uploading video...</span>
              </div>
            ) : videos.flaisFilm ? (
              <video src={videos.flaisFilm} controls className="w-full h-full object-cover" />
            ) : (
              <Film size={48} className="opacity-20" />
            )}
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">Choose Video File</label>
            <input type="file" accept="video/*" onChange={(e) => {
              const file = e.target.files[0];
              if (file) handleUpload(file, 'flaisFilm', true);
            }} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100" disabled={uploadingField === 'flaisFilm'} />
          </div>
        </div>
      )}

      {/* ── TAB: Pillars ────────────────── */}
      {activeTab === 'pillars' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Brand Pillars</h2>
            <button
              onClick={() => {
                setNewValue({ id: null, title: '', desc: '', icon: 'Shield' });
                setShowAddValue(true);
              }}
              className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              <Plus size={18} /> Add Pillar
            </button>
          </div>
          <div className="grid gap-4">
            {values.map((val, idx) => (
              <div key={val.id || idx} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-start md:items-center gap-4">
                {editingValue?.id === val.id ? (
                  /* Inline Edit Form */
                  <div className="flex-1 w-full space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Pillar Title</label>
                        <input
                          type="text"
                          value={editingValue.title}
                          onChange={(e) => setEditingValue({ ...editingValue, title: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:outline-none focus:border-[#0145F2]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Icon Type</label>
                        <select
                          value={editingValue.icon}
                          onChange={(e) => setEditingValue({ ...editingValue, icon: e.target.value })}
                          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:outline-none focus:border-[#0145F2]"
                        >
                          {Object.keys(iconMap).map(iconName => (
                            <option key={iconName} value={iconName}>{iconName}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                      <textarea
                        rows="2"
                        value={editingValue.desc}
                        onChange={(e) => setEditingValue({ ...editingValue, desc: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:outline-none focus:border-[#0145F2] resize-none"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button onClick={handleSaveEditPillar} className="flex items-center gap-1 bg-[#0145F2] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700">
                        <Check size={14} /> Save
                      </button>
                      <button onClick={() => setEditingValue(null)} className="flex items-center gap-1 bg-slate-100 text-slate-600 text-xs font-bold px-4 py-2 rounded-lg hover:bg-slate-200">
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Display Content */
                  <>
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-[#0145F2] shrink-0">
                      {(() => { const IconComp = iconMap[val.icon] || Info; return <IconComp size={24} />; })()}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        {val.title}
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded border">Icon: {val.icon}</span>
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">{val.desc}</p>
                    </div>
                    <div className="flex gap-2 shrink-0 self-end md:self-center">
                      <button onClick={() => setEditingValue({ ...val })} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={18} /></button>
                      <button onClick={() => handleDeletePillar(val.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={18} /></button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Add Pillar Modal */}
          {showAddValue && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Info size={20} className="text-[#0145F2]" /> Add New Brand Pillar
                  </h2>
                  <button onClick={() => setShowAddValue(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                    <X size={18} className="text-slate-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Pillar Title *</label>
                    <input
                      type="text"
                      value={newValue.title}
                      onChange={(e) => setNewValue({ ...newValue, title: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:outline-none focus:border-[#0145F2]"
                      placeholder="e.g. Eco Friendly"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Icon Type *</label>
                    <select
                      value={newValue.icon}
                      onChange={(e) => setNewValue({ ...newValue, icon: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:outline-none focus:border-[#0145F2]"
                    >
                      {Object.keys(iconMap).map(iconName => (
                        <option key={iconName} value={iconName}>{iconName}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description *</label>
                  <textarea
                    rows="3"
                    value={newValue.desc}
                    onChange={(e) => setNewValue({ ...newValue, desc: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs focus:outline-none focus:border-[#0145F2] resize-none"
                    placeholder="Describe this brand pillar..."
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button onClick={handleAddPillar} className="flex-1 flex items-center justify-center gap-2 bg-[#0145F2] text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all">
                    <Check size={16} /> Add Pillar
                  </button>
                  <button onClick={() => { setShowAddValue(false); setNewValue({ id: null, title: '', desc: '', icon: 'Shield' }); }} className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all">
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: Page Texts ────────────────── */}
      {activeTab === 'texts' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Why FLAIS Page Content</h2>
              <p className="text-xs text-slate-400 mt-0.5">Customize all text paragraphs, titles, stats, and headers on the About page.</p>
            </div>
            <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-6 py-3 font-bold text-white hover:bg-blue-700 transition-all shadow-lg">
              <Save size={18} /> Finalize Changes
            </button>
          </div>

          <div className="space-y-6 divide-y divide-slate-100">

            {/* Narrative */}
            <div className="pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-700">Narrative Story Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section Title</label>
                  <input type="text" value={aboutSettings.narrativeTitle} onChange={(e) => setAboutSettings({ ...aboutSettings, narrativeTitle: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Paragraph 1</label>
                  <textarea rows="3" value={aboutSettings.narrativeDesc1} onChange={(e) => setAboutSettings({ ...aboutSettings, narrativeDesc1: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2] resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Paragraph 2</label>
                  <textarea rows="3" value={aboutSettings.narrativeDesc2} onChange={(e) => setAboutSettings({ ...aboutSettings, narrativeDesc2: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2] resize-none" />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-700">Statistics (Counter Stats)</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Years Experience', key: 'statYears' },
                  { label: 'Happy Dealers', key: 'statDealers' },
                  { label: 'Export Countries', key: 'statCountries' },
                  { label: 'Tile Designs', key: 'statDesigns' },
                ].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">{label}</label>
                    <input type="text" value={aboutSettings[key]} onChange={(e) => setAboutSettings({ ...aboutSettings, [key]: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" />
                  </div>
                ))}
              </div>
            </div>

            {/* Manufacturing */}
            <div className="pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-700">Manufacturing Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section Title</label>
                  <input type="text" value={aboutSettings.manuTitle} onChange={(e) => setAboutSettings({ ...aboutSettings, manuTitle: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Paragraph 1</label>
                  <textarea rows="3" value={aboutSettings.manuDesc1} onChange={(e) => setAboutSettings({ ...aboutSettings, manuDesc1: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2] resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Paragraph 2</label>
                  <textarea rows="3" value={aboutSettings.manuDesc2} onChange={(e) => setAboutSettings({ ...aboutSettings, manuDesc2: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2] resize-none" />
                </div>
              </div>
            </div>

            {/* Sustainability */}
            <div className="pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-700">Sustainability Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section Title</label>
                  <input type="text" value={aboutSettings.sustainTitle} onChange={(e) => setAboutSettings({ ...aboutSettings, sustainTitle: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Paragraph 1</label>
                  <textarea rows="3" value={aboutSettings.sustainDesc1} onChange={(e) => setAboutSettings({ ...aboutSettings, sustainDesc1: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2] resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Paragraph 2</label>
                  <textarea rows="3" value={aboutSettings.sustainDesc2} onChange={(e) => setAboutSettings({ ...aboutSettings, sustainDesc2: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2] resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Sustainability Section Photo</label>
                  <input type="file" accept="image/*" onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) handleUpload(file, 'sustainImage');
                  }} className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100" />
                  {aboutSettings.sustainImage && <img src={aboutSettings.sustainImage} alt="preview" className="h-10 mt-1 rounded object-cover border border-slate-100" />}
                </div>
              </div>
            </div>

            {/* Brand Film */}
            <div className="pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-700">Brand Film Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section Title</label>
                  <input type="text" value={aboutSettings.filmTitle} onChange={(e) => setAboutSettings({ ...aboutSettings, filmTitle: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" />
                </div>
                {['filmDesc1', 'filmDesc2', 'filmDesc3'].map((key, n) => (
                  <div key={key} className="md:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Paragraph {n + 1}</label>
                    <textarea rows="3" value={aboutSettings[key]} onChange={(e) => setAboutSettings({ ...aboutSettings, [key]: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2] resize-none" />
                  </div>
                ))}
              </div>
            </div>

            {/* Export Details */}
            <div className="pt-6 space-y-4">
              <h3 className="text-sm font-bold text-slate-700">Export Details Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Export Section Title</label>
                  <input type="text" value={aboutSettings.exportTitle} onChange={(e) => setAboutSettings({ ...aboutSettings, exportTitle: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Export Description</label>
                  <textarea rows="3" value={aboutSettings.exportDesc} onChange={(e) => setAboutSettings({ ...aboutSettings, exportDesc: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2] resize-none" />
                </div>
                
                {/* 3 Stats (Dealers stat removed) */}
                {[1, 3, 4].map((num) => (
                  <div key={num} className="md:col-span-2 p-4 rounded-xl border border-slate-100 bg-slate-50/50 space-y-3">
                    <h4 className="text-xs font-bold text-slate-600">Export Stat Box {num === 1 ? 1 : num === 3 ? 2 : 3}</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Icon (Emoji/Text)</label>
                        <input type="text" value={aboutSettings[`exportStat${num}Icon`]} onChange={(e) => setAboutSettings({ ...aboutSettings, [`exportStat${num}Icon`]: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0145F2]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Value (e.g. 45+)</label>
                        <input type="text" value={aboutSettings[`exportStat${num}Value`]} onChange={(e) => setAboutSettings({ ...aboutSettings, [`exportStat${num}Value`]: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0145F2]" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">Label (e.g. Export Countries)</label>
                        <input type="text" value={aboutSettings[`exportStat${num}Label`]} onChange={(e) => setAboutSettings({ ...aboutSettings, [`exportStat${num}Label`]: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs focus:outline-none focus:border-[#0145F2]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: Export Details ────────────────── */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Globe size={20} className="text-[#0145F2]" /> Export Countries &amp; World Map
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Add, edit, or remove countries. Changes instantly reflect on the About page world map.
              </p>
            </div>
            <button
              onClick={() => setShowAddCountry(true)}
              className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              <Plus size={18} /> Add Country
            </button>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-100 text-sm text-blue-800">
            <MapPin size={18} className="mt-0.5 shrink-0 text-blue-500" />
            <div>
              <p className="font-semibold">Map Coordinates</p>
              <p className="text-xs text-blue-600 mt-0.5">
                Use decimal degrees. <strong>Longitude</strong>: West is negative (e.g. USA = −99.13), East is positive (e.g. UAE = 54.37).
                <br /><strong>Latitude</strong>: South is negative (e.g. Australia = −25.27), North is positive (e.g. UK = 52.37).
              </p>
            </div>
          </div>

          {/* Country cards grid */}
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {exportCountries.map((country) => (
              <div key={country.id} className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
                {editingCountry?.id === country.id ? (
                  /* ── Edit form ── */
                  <div className="p-5 space-y-3">
                    <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">Editing — {country.fullName}</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Full Country Name *</label>
                        <input value={editingCountry.fullName} onChange={e => setEditingCountry({ ...editingCountry, fullName: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="United Arab Emirates" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Flag Emoji</label>
                        <input value={editingCountry.flag} onChange={e => setEditingCountry({ ...editingCountry, flag: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="🇦🇪" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Longitude</label>
                        <input type="number" step="0.01" value={editingCountry.coordinates[0]} onChange={e => setEditingCountry({ ...editingCountry, coordinates: [e.target.value, editingCountry.coordinates[1]] })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="54.37" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Latitude</label>
                        <input type="number" step="0.01" value={editingCountry.coordinates[1]} onChange={e => setEditingCountry({ ...editingCountry, coordinates: [editingCountry.coordinates[0], e.target.value] })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="24.47" />
                      </div>
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button onClick={handleSaveEditCountry} className="flex-1 flex items-center justify-center gap-1.5 bg-[#0145F2] text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700">
                        <Check size={14} /> Save
                      </button>
                      <button onClick={() => setEditingCountry(null)} className="flex-1 flex items-center justify-center gap-1.5 bg-slate-100 text-slate-600 text-xs font-bold py-2 rounded-lg hover:bg-slate-200">
                        <X size={14} /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  /* ── View card ── */
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-3xl leading-none">{country.flag}</span>
                        <div>
                          <h3 className="font-bold text-slate-800 text-sm">{country.fullName}</h3>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setEditingCountry({ ...country, coordinates: [...country.coordinates] })}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteCountry(country.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from map"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-end pt-3 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 font-mono">
                        {Array.isArray(country.coordinates)
                          ? `${Number(country.coordinates[0]).toFixed(1)}, ${Number(country.coordinates[1]).toFixed(1)}`
                          : ''}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Add Country Modal ── */}
          {showAddCountry && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <MapPin size={20} className="text-[#0145F2]" /> Add New Export Country
                  </h2>
                  <button onClick={() => setShowAddCountry(false)} className="p-1.5 hover:bg-slate-100 rounded-lg">
                    <X size={18} className="text-slate-500" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Full Country Name *</label>
                    <input value={newCountry.fullName} onChange={e => setNewCountry({ ...newCountry, fullName: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="e.g. Germany" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Flag Emoji</label>
                    <input value={newCountry.flag} onChange={e => setNewCountry({ ...newCountry, flag: e.target.value })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="🇩🇪" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Longitude (East/West)</label>
                    <input type="number" step="0.01" value={newCountry.coordinates[0]} onChange={e => setNewCountry({ ...newCountry, coordinates: [e.target.value, newCountry.coordinates[1]] })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="10.45 (Germany)" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Latitude (North/South)</label>
                    <input type="number" step="0.01" value={newCountry.coordinates[1]} onChange={e => setNewCountry({ ...newCountry, coordinates: [newCountry.coordinates[0], e.target.value] })} className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="51.16 (Germany)" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={handleAddCountry}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#0145F2] text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition-all"
                  >
                    <Check size={16} /> Add to Map
                  </button>
                  <button
                    onClick={() => { setShowAddCountry(false); setNewCountry({ ...EMPTY_COUNTRY }); }}
                    className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all"
                  >
                    <X size={16} /> Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Save reminder */}
          <div className="flex items-center justify-end">
            <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-6 py-3 font-bold text-white hover:bg-blue-700 transition-all shadow-lg">
              <Save size={18} /> Save All Changes
            </button>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default AdminWhyFlais;
