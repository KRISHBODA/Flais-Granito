import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Plus, Edit, Trash2, Save, Building, Search, Globe, PlusCircle, FileText, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';

const emptyDealer = {
  name: '',
  state: '',
  city: '',
  address: '',
  phone: '',
  email: '',
  coordinates: '',
  type: 'Exclusive Showroom'
};

const AdminFlaisPark = () => {
  const [activeTab, setActiveTab] = useState('locations');
  const [loading, setLoading] = useState(true);
  const BackendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').trim();

  const [pageSettings, setPageSettings] = useState({
    heroTitle: "FLAIS PARK",
    heroSubtitle: "Experience Premium Spaces",
    heroMedia: "",
    introTitle: "Step Into a World of Luxury and Grandeur",
    introDescription: "Explore our exclusive showrooms and authorized dealer network. Flais Park showcases our full collection of premium vitrified tiles in real-world layouts, giving you the inspiration to transform your architectural visions into reality."
  });

  const [dealers, setDealers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentDealer, setCurrentDealer] = useState(emptyDealer);
  const [heroMediaUploading, setHeroMediaUploading] = useState(false);

  useEffect(() => {
    fetchFlaisParkPage();
  }, []);

  const fetchFlaisParkPage = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BackendUrl}/api/flais-park`);
      if (res.data.success && res.data.flaisPark) {
        const page = res.data.flaisPark;
        if (page.pageSettings) setPageSettings(page.pageSettings);
        if (Array.isArray(page.dealers)) setDealers(page.dealers);
      }
    } catch (err) {
      toast.error("Failed to load Flais Park data");
    } finally {
      setLoading(false);
    }
  };

  const persistFlaisParkPage = async (overrides = {}) => {
    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        flaisPark: {
          pageSettings: overrides.pageSettings ?? pageSettings,
          dealers: overrides.dealers ?? dealers
        }
      };
      const res = await axios.put(`${BackendUrl}/api/flais-park`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data.success;
    } catch (error) {
      toast.error("Failed to save Flais Park details to database");
      return false;
    }
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    const success = await persistFlaisParkPage({ pageSettings });
    if (success) {
      toast.success('Flais Park settings saved!');
    }
  };

  const handleSave = async () => {
    const success = await persistFlaisParkPage({ dealers });
    if (success) {
      toast.success('Flais Park locations saved successfully!');
    }
  };

  const handleAddOrEdit = async (e) => {
    e.preventDefault();
    if (!currentDealer.name || !currentDealer.city || !currentDealer.address || !currentDealer.state) {
      return toast.error('Please fill in Name, State, City, and Address');
    }

    let updated;
    if (isEditing) {
      const matchId = currentDealer._id || currentDealer.id;
      updated = dealers.map(d => (d._id === matchId || d.id === matchId) ? currentDealer : d);
      toast.success('Location updated list locally');
    } else {
      const newD = {
        ...currentDealer,
        id: Date.now()
      };
      updated = [...dealers, newD];
      toast.success('New location added to list locally');
    }

    setDealers(updated);
    await persistFlaisParkPage({ dealers: updated });

    // Reset form
    setIsEditing(false);
    setCurrentDealer(emptyDealer);
  };

  const startEdit = (dealer) => {
    setCurrentDealer(dealer);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this dealer location?')) {
      const updated = dealers.filter(d => d.id !== id && d._id !== id);
      setDealers(updated);
      await persistFlaisParkPage({ dealers: updated });
      toast.success('Dealer location removed');
    }
  };

  const filteredDealers = dealers.filter(d =>
    d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.state.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900">Flais Park Management</h1>
          <p className="text-slate-500 text-sm">
            {activeTab === 'locations' ? 'Manage dealers, showrooms, and interactive map coordinate markers.' : 'Customize the Flais Park page headers, text sections, and banner media.'}
          </p>
        </div>
        {activeTab === 'locations' && !loading && (
          <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-6 py-3 font-bold text-white hover:bg-blue-700 transition-all shadow-lg">
            <Save size={18} /> Finalize Locations
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab('locations')}
          className={`flex items-center gap-2 border-b-2 px-6 py-3 text-sm font-semibold transition-all ${
            activeTab === 'locations'
              ? 'border-[#0145F2] text-[#0145F2]'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Building size={18} />
          Locations Directory
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

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Loader2 className="animate-spin text-[#0145F2] mb-3" size={40} />
          <p className="text-slate-500 font-semibold text-sm">Loading Flais Park details from database...</p>
        </div>
      ) : (
        <>
          {activeTab === 'locations' && (
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left/Middle: Dealers List & Search */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                  <Search className="text-slate-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search dealers by name, city or state..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full focus:outline-none text-sm text-slate-700 bg-transparent"
                  />
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="p-5 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                    <h3 className="font-bold text-slate-800">Dealer Directory</h3>
                    <span className="text-xs font-bold bg-blue-50 text-[#0145F2] px-2.5 py-1 rounded-lg">
                      {filteredDealers.length} locations
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {filteredDealers.map((dealer) => {
                      const dId = dealer._id || dealer.id;
                      return (
                        <div key={dId} className="p-5 hover:bg-slate-50/50 transition-colors flex gap-4 items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-900">{dealer.name}</span>
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded">
                                {dealer.type}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed max-w-md flex items-center gap-1.5">
                              <MapPin size={13} className="text-slate-400 shrink-0" />
                              {dealer.address}
                            </p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                              {dealer.phone && <span className="flex items-center gap-1"><Phone size={12} /> {dealer.phone}</span>}
                              {dealer.email && <span className="flex items-center gap-1"><Mail size={12} /> {dealer.email}</span>}
                              {dealer.coordinates && <span className="flex items-center gap-1"><Globe size={12} /> {dealer.coordinates}</span>}
                            </div>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            <button onClick={() => startEdit(dealer)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit Dealer">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(dId)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete Dealer">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {filteredDealers.length === 0 && (
                      <div className="p-10 text-center text-slate-400">
                        <Building className="mx-auto opacity-30 mb-3" size={40} />
                        <p className="text-sm">No dealer locations found.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Add/Edit Dealer Form */}
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 h-fit">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                  <PlusCircle className="text-[#0145F2]" size={18} />
                  {isEditing ? 'Edit Dealer Location' : 'Add Dealer Location'}
                </h3>

                <form onSubmit={handleAddOrEdit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Dealer/Showroom Name</label>
                    <input
                      type="text"
                      required
                      value={currentDealer.name}
                      onChange={(e) => setCurrentDealer({ ...currentDealer, name: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                      placeholder="e.g. Ahmedabad Premium Gallery"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={currentDealer.state}
                        onChange={(e) => setCurrentDealer({ ...currentDealer, state: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                        placeholder="e.g. Gujarat"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={currentDealer.city}
                        onChange={(e) => setCurrentDealer({ ...currentDealer, city: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                        placeholder="e.g. Ahmedabad"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Full Address</label>
                    <textarea
                      required
                      rows="3"
                      value={currentDealer.address}
                      onChange={(e) => setCurrentDealer({ ...currentDealer, address: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                      placeholder="Full address details..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Phone</label>
                      <input
                        type="text"
                        value={currentDealer.phone}
                        onChange={(e) => setCurrentDealer({ ...currentDealer, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
                      <input
                        type="email"
                        value={currentDealer.email}
                        onChange={(e) => setCurrentDealer({ ...currentDealer, email: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                        placeholder="name@email.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Coordinates (Lat, Long)</label>
                      <input
                        type="text"
                        value={currentDealer.coordinates}
                        onChange={(e) => setCurrentDealer({ ...currentDealer, coordinates: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                        placeholder="e.g. 23.0225, 72.5714"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Type</label>
                      <select
                        value={currentDealer.type}
                        onChange={(e) => setCurrentDealer({ ...currentDealer, type: e.target.value })}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                      >
                        <option value="Exclusive Showroom">Exclusive Showroom</option>
                        <option value="Authorized Dealer">Authorized Dealer</option>
                        <option value="Distributor">Distributor</option>
                      </select>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button type="submit" className="flex-1 bg-[#0145F2] text-white p-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors">
                      {isEditing ? 'Update Location' : 'Add Location'}
                    </button>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditing(false);
                          setCurrentDealer(emptyDealer);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-xl font-bold text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <form onSubmit={handleSaveSettings} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Flais Park Page Customization</h2>
                <p className="text-sm text-slate-500">Edit hero sections and introduction texts displayed to customers on the showroom finder page.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Title</label>
                    <input
                      type="text"
                      value={pageSettings.heroTitle}
                      onChange={(e) => setPageSettings({ ...pageSettings, heroTitle: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                      placeholder="FLAIS PARK"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Subtitle</label>
                    <input
                      type="text"
                      value={pageSettings.heroSubtitle}
                      onChange={(e) => setPageSettings({ ...pageSettings, heroSubtitle: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                      placeholder="Experience Premium Spaces"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Media File (mp4 video or image)</label>
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        try {
                          const uploadToast = toast.loading("Uploading hero media...");
                          setHeroMediaUploading(true);
                          const token = localStorage.getItem('adminToken');
                          const formData = new FormData();
                          formData.append('file', file);
                          const res = await axios.post(`${BackendUrl}/api/admin/upload-file`, formData, {
                            headers: {
                              'Authorization': `Bearer ${token}`,
                              'Content-Type': 'multipart/form-data'
                            }
                          });
                          let url = res.data.fileUrl;
                          if (!url) {
                            throw new Error('Upload succeeded but no fileUrl was returned.');
                          }
                          if (!url.startsWith('http')) {
                            url = `${BackendUrl}/${url.replace(/\\/g, '/')}`;
                          }
                          const updatedPageSettings = { ...pageSettings, heroMedia: url };
                          setPageSettings(updatedPageSettings);
                          const saved = await persistFlaisParkPage({ pageSettings: updatedPageSettings });
                          if (!saved) {
                            throw new Error('File uploaded but database save failed.');
                          }
                          toast.success("Hero media uploaded!", { id: uploadToast });
                        } catch (err) {
                          toast.error("Failed to upload hero media");
                        } finally {
                          setHeroMediaUploading(false);
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                  />
                  {heroMediaUploading && (
                    <div className="mt-2 flex items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-700">
                      <Loader2 size={16} className="animate-spin" />
                      <span>Uploading and saving hero media...</span>
                    </div>
                  )}
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

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Intro Section Title</label>
                  <input
                    type="text"
                    value={pageSettings.introTitle}
                    onChange={(e) => setPageSettings({ ...pageSettings, introTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                    placeholder="Step Into a World of Luxury and Grandeur"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Intro Description</label>
                  <textarea
                    value={pageSettings.introDescription}
                    onChange={(e) => setPageSettings({ ...pageSettings, introDescription: e.target.value })}
                    rows={4}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                    placeholder="Describe what Flais Park represents..."
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
        </>
      )}
    </div>
  );
};

export default AdminFlaisPark;
