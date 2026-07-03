import React, { useState, useEffect } from 'react';
import { Trophy, ShieldCheck, Award, Film, Plus, Edit, Trash2, Save, Layout, Video, ShieldAlert, PlusCircle, Leaf, Globe, Star, TrendingUp, FileText, Calculator, Ruler, Scissors, Grid, Construction, Move, Layers, Upload, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

// Helper map to render Lucide Icons dynamically
const ICON_MAP = {
  Trophy,
  ShieldCheck,
  Award,
  Leaf,
  Globe,
  Star,
  TrendingUp,
  Ruler,
  Scissors,
  Grid,
  Construction,
  Move,
  FileText,
  Calculator,
  Layers
};

const AdminAchievement = () => {
  const [activeTab, setActiveTab] = useState('exhibitions');
  const [loading, setLoading] = useState(true);
  const BackendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').trim();

  async function persistFlaisGuide(updatedData = {}) {
    try {
      const payload = {
        achievementsSettings: updatedData.achievementsSettings || pageSettings,
        exhibitions: updatedData.exhibitions || exhibitions,
        certifications: updatedData.certifications || certifications,
        verificationDocs: updatedData.verificationDocs || verificationDocs,
        awardsSettings: updatedData.awardsSettings || awardsSettings,
        exhibitionVideo: updatedData.exhibitionVideo !== undefined ? updatedData.exhibitionVideo : exhibitionVideo,
        technicalGuide: updatedData.technicalGuide || technicalGuide,
        installationGuide: updatedData.installationGuide || installationGuide,
        tileCalculator: updatedData.tileCalculator || tileCalculatorSettings
      };

      const response = await api.put('/flais-guide', payload);
      return response.data && response.data.success;
    } catch (err) {
      return false;
    }
  }

  const uploadImageFile = async (file) => {
    const isImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);
    if (!isImg) {
      toast.error('Please upload an image file only.');
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'guides');
    const uploadToast = toast.loading("Uploading image...");
    try {
      const response = await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && response.data.fileUrl) {
        toast.success("Image uploaded successfully!", { id: uploadToast });
        return response.data.fileUrl;
      }
      toast.error("Upload failed", { id: uploadToast });
      return null;
    } catch (err) {
      toast.error("Error uploading image file", { id: uploadToast });
      return null;
    }
  };

  const uploadPdfFile = async (file) => {
    const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
    if (!isPdf) {
      toast.error('Please upload a PDF file only.');
      return null;
    }

    if (file.size > 50 * 1024 * 1024) {
      toast.error('PDF must be smaller than 50 MB.');
      return null;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'guides');
    
    const uploadToast = toast.loading("Uploading PDF...");
    try {
      const response = await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && response.data.fileUrl) {
        toast.success("PDF uploaded successfully!", { id: uploadToast });
        return response.data.fileUrl;
      }
      toast.error("PDF upload failed", { id: uploadToast });
      return null;
    } catch (err) {
      toast.error("Error uploading PDF", { id: uploadToast });
      return null;
    }
  };

  const [verificationDocs, setVerificationDocs] = useState([]);
  const [awardsSettings, setAwardsSettings] = useState({
    badge: "Awards & Achievements",
    title: "Accolades of\nInnovation & Excellence",
    desc: "Our awards gallery is a testament to the dedication, hard work, and industry-leading standards we maintain across our manufacturing processes and design achievements. From national exporter recognitions to design excellence certificates, each milestone represents our promise of delivering premium surfaces.",
    stat1Val: "50+",
    stat1Label: "Industrial Awards",
    stat2Val: "Global",
    stat2Label: "Design Standard",
    image: ""
  });

  const [currentVerDoc, setCurrentVerDoc] = useState({ title: '', desc: '', image: '' });

  // Technical Guide state
  const [technicalGuide, setTechnicalGuide] = useState({
    title: "Technical Guide",
    subtitle: "In-depth technical specifications for architects and engineers.",
    pdfUrl: "",
    whatsIncluded: [
      "Detailed specifications and standards",
      "Quality assurance documentation",
      "Expert recommendations and best practices"
    ]
  });
  const [newIncludedItem, setNewIncludedItem] = useState('');
  const [uploading, setUploading] = useState(false);

  const handlePdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast.error('Please upload a PDF file only.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'guides');

    setUploading(true);
    try {
      const response = await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && response.data.fileUrl) {
        const url = response.data.fileUrl;
        const updatedGuide = { ...technicalGuide, pdfUrl: url };
        setTechnicalGuide(updatedGuide);
        await persistFlaisGuide({ technicalGuide: updatedGuide });
        toast.success('PDF uploaded to Cloudinary and settings saved!');
      } else {
        toast.error('Failed to get uploaded file URL');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error uploading PDF to Cloudinary');
    } finally {
      setUploading(false);
    }
  };

  const getPdfPreviewUrl = (url) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').trim();
    if (url.includes('/uploads/')) {
      const parts = url.split('/uploads/');
      return `${backendUrl}/uploads/${parts[parts.length - 1]}`;
    }
    return `${backendUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Installation Guide state
  const [installationGuide, setInstallationGuide] = useState({
    title: "Process for Flais Granito",
    subtitle: "Installation Guide",
    heroImage: "",
    pdfUrl: "",
    steps: []
  });
  const [currentStep, setCurrentStep] = useState({ title: '', icon: 'Ruler', content: '' });
  const [editStepIndex, setEditStepIndex] = useState(null);

  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const handleInstallationImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const url = await uploadImageFile(file);
    if (url) {
      const updatedGuide = { ...installationGuide, heroImage: url };
      setInstallationGuide(updatedGuide);
      await persistFlaisGuide({ installationGuide: updatedGuide });
      toast.success('Hero image uploaded to Cloudinary and settings saved!');
    }
  };

  const handleInstallationPdfUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast.error('Please upload a PDF file only.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', 'guides');

    setUploadingPdf(true);
    try {
      const response = await api.post('/admin/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data && response.data.fileUrl) {
        const url = response.data.fileUrl;
        const updatedGuide = { ...installationGuide, pdfUrl: url };
        setInstallationGuide(updatedGuide);
        await persistFlaisGuide({ installationGuide: updatedGuide });
        toast.success('Installation PDF uploaded to Cloudinary and settings saved!');
      } else {
        toast.error('Failed to get uploaded PDF URL');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Error uploading PDF to Cloudinary');
    } finally {
      setUploadingPdf(false);
    }
  };

  // Tile Calculator state
  const [tileCalculatorSettings, setTileCalculatorSettings] = useState({
    badge: "Advanced Planning Tool",
    title: "Tile Calculator",
    subtitle: "Calculate exact materials for multiple rooms, preview layouts, and generate branded PDF estimates.",
    tileSizes: [
      { id: '600x600', w: 600, h: 600, label: '600×600 mm', desc: 'LISC / MARVEL', count: 4 },
      { id: '600x1200', w: 600, h: 1200, label: '600×1200 mm', desc: 'GLASS / ELECTRA', count: 2 },
      { id: '800x1600', w: 800, h: 1600, label: '800×1600 mm', desc: 'MARBLE GLOSS', count: 2 },
      { id: '800x2400', w: 800, h: 2400, label: '800×2400 mm', desc: 'EXTRA MAX', count: 2 },
      { id: '800x3000', w: 800, h: 3000, label: '800×3000 mm', desc: 'EXTRA MAX XL', count: 1 },
      { id: 'custom', label: 'Custom', desc: 'Enter dimensions', count: 0 }
    ],
    patterns: [
      { id: 'straight', label: 'Straight Lay', wastage: 5, desc: 'Grid pattern' },
      { id: 'brick', label: 'Brick Offset', wastage: 10, desc: 'Staggered rows' },
      { id: 'herringbone', label: 'Herringbone', wastage: 15, desc: 'Classic V-pattern' },
      { id: 'diagonal', label: 'Diagonal 45°', wastage: 20, desc: 'Rotated grid' },
      { id: 'double-herringbone', label: 'Double Herringbone', wastage: 20, desc: 'Mirrored V-pattern' }
    ],
    groutOptions: [
      { value: 2, label: '2mm', factor: 1 },
      { value: 3, label: '3mm', factor: 1.4 },
      { value: 5, label: '5mm', factor: 2.2 }
    ]
  });

  const [newSize, setNewSize] = useState({ id: '', w: '', h: '', label: '', desc: '', count: '' });
  const [newPattern, setNewPattern] = useState({ id: '', label: '', wastage: '', desc: '' });
  const [newGrout, setNewGrout] = useState({ value: '', label: '', factor: '' });

  const [editSizeIdx, setEditSizeIdx] = useState(null);
  const [editPatternIdx, setEditPatternIdx] = useState(null);
  const [editGroutIdx, setEditGroutIdx] = useState(null);

  const [pageSettings, setPageSettings] = useState({
    heroTitle: "Achievements",
    heroSubtitle: "Our journey of excellence, global presence, and certification standards.",
    heroMedia: "",
    introTitle: "Pioneering the Future of Surfaces",
    introDescription: "FLAIS GRANITO is committed to delivering world-class surface solutions. Our state-of-the-art manufacturing processes are backed by international quality certifications, sustainable guidelines, and globally recognized achievements."
  });

  const [exhibitions, setExhibitions] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [exhibitionVideo, setExhibitionVideo] = useState('');

  // Upload Video States
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [tempPreviewUrl, setTempPreviewUrl] = useState('');
  const [dbVideoUrl, setDbVideoUrl] = useState('');
  useEffect(() => {
    const fetchFlaisGuide = async () => {
      try {
        setLoading(true);
        const response = await api.get('/flais-guide');
        if (response.data && response.data.success) {
          const data = response.data.flaisGuide || {};
          
          // Populate states
          if (data.achievementsSettings) setPageSettings(data.achievementsSettings);
          if (data.exhibitions && data.exhibitions.length > 0) setExhibitions(data.exhibitions);
          if (data.certifications && data.certifications.length > 0) setCertifications(data.certifications);
          if (data.verificationDocs && data.verificationDocs.length > 0) setVerificationDocs(data.verificationDocs);
          if (data.awardsSettings) setAwardsSettings(data.awardsSettings);
          if (data.exhibitionVideo) setExhibitionVideo(data.exhibitionVideo);
          if (data.technicalGuide) setTechnicalGuide(data.technicalGuide);
          if (data.installationGuide) setInstallationGuide(data.installationGuide);
          if (data.tileCalculator) setTileCalculatorSettings(data.tileCalculator);

        }
      } catch (err) {
        toast.error("Failed to load page configurations from server.");
      } finally {
        setLoading(false);
      }
    };

    fetchFlaisGuide();

    return () => {
      if (dbVideoUrl) URL.revokeObjectURL(dbVideoUrl);
      if (tempPreviewUrl) URL.revokeObjectURL(tempPreviewUrl);
    };
  }, []);

  // Form States
  const [currentExh, setCurrentExh] = useState({ name: '', location: '', year: '', description: '' });
  const [currentCert, setCurrentCert] = useState({ title: '', desc: '', details: '', icon: 'ShieldCheck' });

  const [editId, setEditId] = useState(null);

  const handleVideoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadedFile(file);
    setUploadedFileName(file.name);

    if (tempPreviewUrl) {
      URL.revokeObjectURL(tempPreviewUrl);
    }
    const objUrl = URL.createObjectURL(file);
    setTempPreviewUrl(objUrl);
    setExhibitionVideo('indexeddb://exhibition_video');
    toast.success(`Selected video file: ${file.name}`);
  };

  const getVideoSrc = () => {
    if (tempPreviewUrl) return tempPreviewUrl;
    return exhibitionVideo;
  };

  const handleSave = async () => {
    let videoValue = exhibitionVideo;
    if (uploadedFile) {
      const uploadToast = toast.loading("Uploading exhibition video...");
      try {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        formData.append('category', 'guides');
        const response = await api.post('/admin/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        if (response.data && response.data.fileUrl) {
          videoValue = response.data.fileUrl;
          setExhibitionVideo(videoValue);
          setUploadedFile(null);
          toast.success("Exhibition video uploaded successfully!", { id: uploadToast });
        } else {
          toast.error("Failed to upload video", { id: uploadToast });
          return;
        }
      } catch (err) {
        toast.error("Failed to upload video!", { id: uploadToast });
        return;
      }
    }

    const success = await persistFlaisGuide({
      exhibitions,
      certifications,
      exhibitionVideo: videoValue,
      verificationDocs,
      awardsSettings
    });
    if (success) {
      toast.success('Achievements & Certifications saved successfully!');
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    const success = await persistFlaisGuide({ achievementsSettings: pageSettings });
    if (success) {
      toast.success('Achievement page banner settings saved successfully!');
    } else {
      toast.error('Failed to save achievement settings.');
    }
  };

  const handleAddOrEditExh = (e) => {
    e.preventDefault();
    if (!currentExh.name || !currentExh.location || !currentExh.year) return toast.error('Required fields missing');

    if (editId) {
      setExhibitions(exhibitions.map(ex => ex.id === editId ? { ...currentExh, id: editId } : ex));
      toast.success('Exhibition updated');
      setEditId(null);
    } else {
      setExhibitions([...exhibitions, { ...currentExh, id: Date.now() }]);
      toast.success('Exhibition added');
    }
    setCurrentExh({ name: '', location: '', year: '', description: '' });
  };

  const handleAddOrEditCert = (e) => {
    e.preventDefault();
    if (!currentCert.title || !currentCert.desc) return toast.error('Required fields missing');

    if (editId) {
      setCertifications(certifications.map(c => c.id === editId ? { ...currentCert, id: editId } : c));
      toast.success('Certification updated');
      setEditId(null);
    } else {
      setCertifications([...certifications, { ...currentCert, id: Date.now() }]);
      toast.success('Certification added');
    }
    setCurrentCert({ title: '', desc: '', details: '', icon: 'ShieldCheck' });
  };

  const handleAddOrEditVerDoc = (e) => {
    e.preventDefault();
    if (!currentVerDoc.title || !currentVerDoc.desc || !currentVerDoc.image) {
      return toast.error('Required fields missing (Title, Description, and Image are required)');
    }

    if (editId) {
      setVerificationDocs(verificationDocs.map(vd => vd.id === editId ? { ...currentVerDoc, id: editId } : vd));
      toast.success('Verification Certificate updated');
      setEditId(null);
    } else {
      setVerificationDocs([...verificationDocs, { ...currentVerDoc, id: Date.now() }]);
      toast.success('Verification Certificate added');
    }
    setCurrentVerDoc({ title: '', desc: '', image: '' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 bg-white rounded-2xl border border-slate-100 shadow-sm min-h-[400px]">
        <Loader2 className="animate-spin text-[#0145F2] mb-3" size={40} />
        <p className="text-slate-500 font-semibold text-sm">Loading Achievements & Guide settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-slate-900">Achievement & Guides Management</h1>
          <p className="text-slate-500 text-sm">
            {activeTab === 'settings' ? 'Edit hero banner and introduction card text details for the certifications page.' : 
             activeTab === 'technical_guide' ? 'Manage Technical Guide specifications, pdf download link, and lists.' :
             activeTab === 'installation_guide' ? 'Manage Installation Guide content, background image, and accordion steps.' :
             activeTab === 'tile_calculator' ? 'Manage Tile Calculator page header text and badge.' :
             activeTab === 'verification_certs' ? 'Manage Verification Certificates displayed at the bottom of the Certifications page.' :
             activeTab === 'awards' ? 'Manage Awards Accolades settings, stats, and the trophy showcase photo.' :
             'Manage exhibitions, brand certifications, and exhibition showcase video.'}
          </p>
        </div>
        {(activeTab === 'exhibitions' || activeTab === 'certifications' || activeTab === 'verification_certs' || activeTab === 'awards') && (
          <button onClick={handleSave} className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-6 py-3 font-bold text-white hover:bg-blue-700 transition-all shadow-lg">
            <Save size={18} /> Save Achievements
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 w-fit">
        <button
          onClick={() => { setActiveTab('exhibitions'); setEditId(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'exhibitions' ? 'bg-[#0145F2] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Video size={17} /> Exhibitions
        </button>
        <button
          onClick={() => { setActiveTab('certifications'); setEditId(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'certifications' ? 'bg-[#0145F2] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <ShieldCheck size={17} /> Certifications
        </button>
        <button
          onClick={() => { setActiveTab('verification_certs'); setEditId(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'verification_certs' ? 'bg-[#0145F2] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Award size={17} /> Verification Certs
        </button>
        <button
          onClick={() => { setActiveTab('awards'); setEditId(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'awards' ? 'bg-[#0145F2] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Trophy size={17} /> Awards Showcase
        </button>
        <button
          onClick={() => { setActiveTab('technical_guide'); setEditId(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'technical_guide' ? 'bg-[#0145F2] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <FileText size={17} /> Technical Guide
        </button>
        <button
          onClick={() => { setActiveTab('installation_guide'); setEditId(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'installation_guide' ? 'bg-[#0145F2] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Ruler size={17} /> Installation Guide
        </button>
        <button
          onClick={() => { setActiveTab('tile_calculator'); setEditId(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'tile_calculator' ? 'bg-[#0145F2] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Calculator size={17} /> Tile Calculator
        </button>
        <button
          onClick={() => { setActiveTab('settings'); setEditId(null); }}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${activeTab === 'settings' ? 'bg-[#0145F2] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          <Layout size={17} /> Page Settings
        </button>
      </div>

      {(activeTab === 'exhibitions' || activeTab === 'certifications' || activeTab === 'verification_certs') && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left/Middle: List View */}
          <div className="lg:col-span-2 space-y-6">
            {/* Exhibition Video Card (Only under Exhibitions tab) */}
            {activeTab === 'exhibitions' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2"><Film size={18} /> Global Exhibition Video Settings</h3>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Select Exhibition Video</label>
                    <select
                      value={exhibitionVideo || ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        setExhibitionVideo(val);
                        if (!val) {
                          setUploadedFile(null);
                          setUploadedFileName('');
                          if (tempPreviewUrl) URL.revokeObjectURL(tempPreviewUrl);
                          setTempPreviewUrl('');
                        }
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                    >
                      <option value="">Select or upload a video</option>
                      {uploadedFileName && (
                        <option value={exhibitionVideo}>Uploaded Video: {uploadedFileName}</option>
                      )}
                    </select>
                  </div>


                  {/* Replace Video / Upload option */}
                  <div className="pt-1">
                    <span className="block text-xs font-semibold text-slate-600 mb-2">Replace Video with Local File</span>
                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-[#0145F2] hover:bg-blue-50/10 rounded-2xl p-6 cursor-pointer transition-all">
                      <Video className="text-[#0145F2] mb-2" size={24} />
                      <span className="text-xs font-bold text-slate-700">Choose a new video file to replace</span>
                      <span className="text-[10px] text-slate-400 mt-1">MP4, M4V, WebM</span>
                      <input type="file" accept="video/*" className="hidden" onChange={handleVideoFileChange} />
                    </label>
                    {uploadedFileName && (
                      <div className="text-xs bg-emerald-50 text-emerald-700 p-2.5 rounded-xl border border-emerald-100 flex items-center justify-between mt-2">
                        <span className="truncate max-w-[200px]">Active video file: <strong>{uploadedFileName}</strong></span>
                        <button type="button" onClick={() => {
                          setUploadedFile(null);
                          setUploadedFileName('');
                          if (tempPreviewUrl) URL.revokeObjectURL(tempPreviewUrl);
                          setTempPreviewUrl('');
                          setExhibitionVideo('FLAISVIDEO2.m4v');
                        }} className="text-red-500 hover:underline shrink-0 ml-2">Clear / Restore Default</button>
                      </div>
                    )}
                  </div>

                  {/* Video Preview Player */}
                  <div className="pt-2">
                    <span className="block text-xs font-semibold text-slate-600 mb-2">Video Preview</span>
                    <div className="aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-black relative shadow-inner">
                      {exhibitionVideo ? (
                        <video
                          key={exhibitionVideo}
                          controls
                          muted
                          className="w-full h-full object-cover"
                          src={getVideoSrc()}
                        >
                          Your browser does not support video playbacks.
                        </video>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-xs">
                          No video path provided
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        persistFlaisGuide({ exhibitionVideo });
                        toast.success('Exhibition video saved successfully');
                      }}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2.5 rounded-xl font-bold text-xs transition-colors"
                    >
                      Apply Video Settings
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* List Display */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                <h3 className="font-bold text-slate-800 capitalize">{activeTab} Directory</h3>
              </div>

              <div className="divide-y divide-slate-100">
                {activeTab === 'exhibitions' && exhibitions.map(ex => (
                  <div key={ex.id} className="p-5 hover:bg-slate-50/50 transition-colors flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{ex.name}</span>
                        <span className="text-xs bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded font-semibold">{ex.year}</span>
                      </div>
                      <p className="text-xs font-semibold text-[#0145F2]">{ex.location}</p>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-lg mt-1">{ex.description}</p>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditId(ex.id); setCurrentExh(ex); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => setExhibitions(exhibitions.filter(e => e.id !== ex.id))} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}

                {activeTab === 'certifications' && certifications.map(c => {
                  const IconComponent = ICON_MAP[c.icon] || ShieldCheck;
                  return (
                    <div key={c.id} className="p-5 hover:bg-slate-50/50 transition-colors flex justify-between items-start gap-4">
                      <div className="flex gap-3 items-start">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0145F2] shrink-0">
                          <IconComponent size={20} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900">{c.title}</h4>
                          <p className="text-xs font-semibold text-[#0145F2]">{c.desc}</p>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-lg mt-1">{c.details}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditId(c.id); setCurrentCert(c); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                        <button onClick={() => setCertifications(certifications.filter(cert => cert.id !== c.id))} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  );
                })}

                {activeTab === 'verification_certs' && verificationDocs.map(vd => (
                  <div key={vd.id} className="p-5 hover:bg-slate-50/50 transition-colors flex justify-between items-start gap-4">
                    <div className="flex gap-3 items-start">
                      <div className="w-16 h-20 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 p-1">
                        <img loading="lazy" src={vd.image} className="max-w-full max-h-full object-contain" alt="" />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900">{vd.title}</h4>
                        <p className="text-xs text-slate-500 leading-relaxed max-w-lg mt-1">{vd.desc}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setEditId(vd.id); setCurrentVerDoc(vd); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                      <button onClick={() => setVerificationDocs(verificationDocs.filter(d => d.id !== vd.id))} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))}

              </div>
            </div>
          </div>

          {/* Right: Add/Edit Form */}
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 h-fit">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <PlusCircle className="text-[#0145F2]" size={18} />
              {editId ? 'Edit Item' : 'Add Item'}
            </h3>

            {activeTab === 'exhibitions' && (
              <form onSubmit={handleAddOrEditExh} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Exhibition Name</label>
                  <input type="text" required value={currentExh.name} onChange={(e) => setCurrentExh({ ...currentExh, name: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="e.g. CERSAIE" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Location</label>
                    <input type="text" required value={currentExh.location} onChange={(e) => setCurrentExh({ ...currentExh, location: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="e.g. Bologna, Italy" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
                    <input type="text" required value={currentExh.year} onChange={(e) => setCurrentExh({ ...currentExh, year: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="e.g. 2025" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                  <textarea rows="3" value={currentExh.description} onChange={(e) => setCurrentExh({ ...currentExh, description: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="Short description..." />
                </div>
                <button type="submit" className="w-full bg-[#0145F2] text-white p-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors">
                  {editId ? 'Update Exhibition' : 'Add Exhibition'}
                </button>
              </form>
            )}

            {activeTab === 'certifications' && (
              <form onSubmit={handleAddOrEditCert} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Certification Title</label>
                  <input type="text" required value={currentCert.title} onChange={(e) => setCurrentCert({ ...currentCert, title: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="e.g. ISO 9001:2015" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description / Subtitle</label>
                  <input type="text" required value={currentCert.desc} onChange={(e) => setCurrentCert({ ...currentCert, desc: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="e.g. Quality Management Systems" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Icon Representation</label>
                  <select
                    value={currentCert.icon || 'ShieldCheck'}
                    onChange={(e) => setCurrentCert({ ...currentCert, icon: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                  >
                    <option value="ShieldCheck">Shield & Check (ShieldCheck)</option>
                    <option value="Leaf">Leaf / Green (Leaf)</option>
                    <option value="Globe">Globe / International (Globe)</option>
                    <option value="Star">Star / Premium (Star)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Details</label>
                  <textarea rows="3" value={currentCert.details} onChange={(e) => setCurrentCert({ ...currentCert, details: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="Further details..." />
                </div>
                <button type="submit" className="w-full bg-[#0145F2] text-white p-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors">
                  {editId ? 'Update Certification' : 'Add Certification'}
                </button>
              </form>
            )}

            {activeTab === 'verification_certs' && (
              <form onSubmit={handleAddOrEditVerDoc} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Certificate Title</label>
                  <input type="text" required value={currentVerDoc.title} onChange={(e) => setCurrentVerDoc({ ...currentVerDoc, title: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="e.g. CE Certificate of Compliance" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Description / Scope Details</label>
                  <textarea rows="3" required value={currentVerDoc.desc} onChange={(e) => setCurrentVerDoc({ ...currentVerDoc, desc: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2] resize-none" placeholder="Explain what standard this certifies..." />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Certificate Photo</label>
                   <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const url = await uploadImageFile(file);
                        if (url) {
                          setCurrentVerDoc({ ...currentVerDoc, image: url });
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                  />
                  {currentVerDoc.image && (
                    <img src={currentVerDoc.image} alt="preview" className="h-14 mt-2 rounded border border-slate-100 object-cover" />
                  )}
                </div>
                <button type="submit" className="w-full bg-[#0145F2] text-white p-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors">
                  {editId ? 'Update Certificate' : 'Add Certificate'}
                </button>
              </form>
            )}


            {editId && (
              <button
                onClick={() => {
                  setEditId(null);
                  setCurrentExh({ name: '', location: '', year: '', description: '' });
                  setCurrentCert({ title: '', desc: '', details: '', icon: 'ShieldCheck' });
                  setCurrentVerDoc({ title: '', desc: '', image: '' });
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-xl font-bold text-xs transition-colors mt-2"
              >
                Cancel Edit
              </button>
            )}
          </div>
        </div>
      )}

      {activeTab === 'technical_guide' && (
        <form onSubmit={(e) => {
          e.preventDefault();
          persistFlaisGuide({ technicalGuide });
          toast.success('Technical Guide settings saved!');
        }} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Technical Guide Settings</h2>
            <p className="text-sm text-slate-500">Edit page title, subtitle, download link, and What's Included bullets.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Page Title</label>
                <input
                  type="text"
                  value={technicalGuide.title}
                  onChange={(e) => setTechnicalGuide({ ...technicalGuide, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="Technical Guide"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">PDF File Download URL / Path</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={technicalGuide.pdfUrl}
                    onChange={(e) => setTechnicalGuide({ ...technicalGuide, pdfUrl: e.target.value })}
                    className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                    placeholder="e.g. /documents/technical-guide.pdf"
                  />
                  {technicalGuide.pdfUrl && (
                    <a
                      href={getPdfPreviewUrl(technicalGuide.pdfUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center shrink-0"
                    >
                      Preview PDF
                    </a>
                  )}
                </div>
                {/* Upload Button */}
                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <Upload size={16} className="text-[#0145F2] shrink-0" />
                  <div className="flex-1">
                    <label className="block text-[11px] font-bold text-slate-500 mb-1">Or upload local PDF file</label>
                    <input
                      type="file"
                      accept="application/pdf"
                      disabled={uploading}
                      onChange={handlePdfUpload}
                      className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100 cursor-pointer"
                    />
                  </div>
                  {uploading && (
                    <span className="text-xs text-[#0145F2] font-semibold animate-pulse shrink-0">Uploading...</span>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Page Subtitle</label>
              <input
                type="text"
                value={technicalGuide.subtitle}
                onChange={(e) => setTechnicalGuide({ ...technicalGuide, subtitle: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                placeholder="Subtitle..."
                required
              />
            </div>

            {/* List of Included Items */}
            <div className="border-t border-slate-100 pt-4">
              <label className="block text-sm font-semibold text-slate-700 mb-2">What's Included List</label>
              <div className="space-y-2 mb-4">
                {technicalGuide.whatsIncluded.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-sm text-slate-700">
                    <span>{item}</span>
                    <button type="button" onClick={() => {
                      const updated = technicalGuide.whatsIncluded.filter((_, i) => i !== idx);
                      setTechnicalGuide({ ...technicalGuide, whatsIncluded: updated });
                    }} className="text-red-500 hover:text-red-700">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newIncludedItem}
                  onChange={(e) => setNewIncludedItem(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2 px-4 text-xs focus:border-[#0145F2] focus:outline-none"
                  placeholder="Add new list item..."
                />
                <button type="button" onClick={() => {
                  if (!newIncludedItem.trim()) return;
                  setTechnicalGuide({ ...technicalGuide, whatsIncluded: [...technicalGuide.whatsIncluded, newIncludedItem.trim()] });
                  setNewIncludedItem('');
                }} className="bg-[#0145F2] hover:bg-blue-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-colors">
                  Add Item
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-[#0145F2] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700"
            >
              <Save size={18} /> Save Technical Guide
            </button>
          </div>
        </form>
      )}

      {activeTab === 'installation_guide' && (
        <div className="space-y-6">
        <form onSubmit={(e) => {
          e.preventDefault();
          persistFlaisGuide({
            installationGuide: {
              title: installationGuide.title,
              subtitle: installationGuide.subtitle,
              heroImage: installationGuide.heroImage,
              pdfUrl: installationGuide.pdfUrl || '',
              steps: installationGuide.steps
            }
          });
          toast.success('Installation Guide settings saved!');
        }} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Installation Guide Main Settings</h2>
              <p className="text-sm text-slate-500">Edit hero title, subtitle, cover image and PDF guide.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Title</label>
                  <input
                    type="text"
                    value={installationGuide.title}
                    onChange={(e) => setInstallationGuide({ ...installationGuide, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                    placeholder="Process for Flais Granito"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Subtitle</label>
                  <input
                    type="text"
                    value={installationGuide.subtitle}
                    onChange={(e) => setInstallationGuide({ ...installationGuide, subtitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                    placeholder="Installation Guide"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hero Image Settings with Upload Button */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Hero Background Image</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={installationGuide.heroImage}
                      onChange={(e) => setInstallationGuide({ ...installationGuide, heroImage: e.target.value })}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs focus:border-[#0145F2] focus:outline-none"
                      placeholder="Image URL or local asset path"
                      required
                    />
                    {installationGuide.heroImage && (
                      <a
                        href={getPdfPreviewUrl(installationGuide.heroImage)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center shrink-0"
                      >
                        Preview Image
                      </a>
                    )}
                  </div>
                  {/* Image Upload Button */}
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Upload size={16} className="text-[#0145F2] shrink-0" />
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Upload Hero Image File</label>
                      <input
                        type="file"
                        accept="image/*"
                        disabled={uploadingImage}
                        onChange={handleInstallationImageUpload}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100 cursor-pointer"
                      />
                    </div>
                    {uploadingImage && (
                      <span className="text-xs text-[#0145F2] font-semibold animate-pulse shrink-0">Uploading...</span>
                    )}
                  </div>
                </div>

                {/* Installation PDF Settings with Upload Button */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Installation Guide PDF</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={installationGuide.pdfUrl || ''}
                      onChange={(e) => setInstallationGuide({ ...installationGuide, pdfUrl: e.target.value })}
                      className="flex-1 rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-xs focus:border-[#0145F2] focus:outline-none"
                      placeholder="e.g. /documents/installation-guide.pdf"
                    />
                    {installationGuide.pdfUrl && (
                      <a
                        href={getPdfPreviewUrl(installationGuide.pdfUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-zinc-800 hover:bg-zinc-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors flex items-center justify-center shrink-0"
                      >
                        Preview PDF
                      </a>
                    )}
                  </div>
                  {/* PDF Upload Button */}
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <Upload size={16} className="text-[#0145F2] shrink-0" />
                    <div className="flex-1">
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Upload Installation PDF File</label>
                      <input
                        type="file"
                        accept="application/pdf"
                        disabled={uploadingPdf}
                        onChange={handleInstallationPdfUpload}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100 cursor-pointer"
                      />
                    </div>
                    {uploadingPdf && (
                      <span className="text-xs text-[#0145F2] font-semibold animate-pulse shrink-0">Uploading...</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-[#0145F2] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700"
              >
                <Save size={18} /> Save Settings & Steps
              </button>
            </div>
          </form>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* List of steps */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="p-5 border-b border-slate-50 bg-slate-50/50">
                <h3 className="font-bold text-slate-800">Installation Steps Directory</h3>
              </div>
              <div className="divide-y divide-slate-100">
                {installationGuide.steps.map((step, idx) => {
                  const StepIcon = ICON_MAP[step.icon] || Ruler;
                  return (
                    <div key={idx} className="p-5 hover:bg-slate-50/50 transition-colors flex justify-between items-start gap-4">
                      <div className="flex gap-3 items-start">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0145F2] shrink-0">
                          <StepIcon size={20} />
                        </div>
                        <div className="space-y-1">
                          <h4 className="font-bold text-slate-900">{step.title}</h4>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold uppercase">{step.icon}</span>
                          <p className="text-xs text-slate-500 leading-relaxed max-w-lg mt-1">{step.content}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => { setEditStepIndex(idx); setCurrentStep(step); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit size={16} /></button>
                        <button onClick={() => {
                          const updatedSteps = installationGuide.steps.filter((_, i) => i !== idx);
                          const updatedGuide = { ...installationGuide, steps: updatedSteps };
                          setInstallationGuide(updatedGuide);
                          persistFlaisGuide({ installationGuide: updatedGuide });
                          toast.success('Step deleted! Remember to save.');
                        }} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Add/Edit step form */}
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4 h-fit">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <PlusCircle className="text-[#0145F2]" size={18} />
                {editStepIndex !== null ? 'Edit Step' : 'Add Step'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Step Title</label>
                  <input type="text" value={currentStep.title} onChange={(e) => setCurrentStep({ ...currentStep, title: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="e.g. Joints" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Icon Representation</label>
                  <select
                    value={currentStep.icon || 'Ruler'}
                    onChange={(e) => setCurrentStep({ ...currentStep, icon: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                  >
                    <option value="Ruler">Ruler</option>
                    <option value="Grid">Grid</option>
                    <option value="Layers">Layers</option>
                    <option value="Construction">Construction</option>
                    <option value="Scissors">Scissors</option>
                    <option value="Move">Move</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Detailed Content</label>
                  <textarea rows="4" value={currentStep.content} onChange={(e) => setCurrentStep({ ...currentStep, content: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]" placeholder="Describe the installation instructions..." />
                </div>
                <button type="button" onClick={() => {
                  if (!currentStep.title || !currentStep.content) return toast.error('Required fields missing');
                  let updatedSteps = [...installationGuide.steps];
                  if (editStepIndex !== null) {
                    updatedSteps[editStepIndex] = currentStep;
                    toast.success('Step updated');
                    setEditStepIndex(null);
                  } else {
                    updatedSteps.push(currentStep);
                    toast.success('Step added');
                  }
                  setInstallationGuide({ ...installationGuide, steps: updatedSteps });
                  setCurrentStep({ title: '', icon: 'Ruler', content: '' });
                }} className="w-full bg-[#0145F2] text-white p-2.5 rounded-xl font-bold text-xs hover:bg-blue-700 transition-colors">
                  {editStepIndex !== null ? 'Update Step' : 'Add Step'}
                </button>
                {editStepIndex !== null && (
                  <button onClick={() => { setEditStepIndex(null); setCurrentStep({ title: '', icon: 'Ruler', content: '' }); }} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 p-2.5 rounded-xl font-bold text-xs transition-colors">Cancel Edit</button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tile_calculator' && (
        <div className="space-y-6">
        <form onSubmit={(e) => {
          e.preventDefault();
          persistFlaisGuide({ tileCalculator: tileCalculatorSettings });
          toast.success('Tile Calculator settings saved!');
        }} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Tile Calculator Page Header Settings</h2>
              <p className="text-sm text-slate-500">Edit hero title, subtitle, and badge text.</p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Badge Label</label>
                  <input
                    type="text"
                    value={tileCalculatorSettings.badge}
                    onChange={(e) => setTileCalculatorSettings({ ...tileCalculatorSettings, badge: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                    placeholder="Advanced Planning Tool"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Page Title</label>
                  <input
                    type="text"
                    value={tileCalculatorSettings.title}
                    onChange={(e) => setTileCalculatorSettings({ ...tileCalculatorSettings, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                    placeholder="Tile Calculator"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Page Subtitle</label>
                <input
                  type="text"
                  value={tileCalculatorSettings.subtitle}
                  onChange={(e) => setTileCalculatorSettings({ ...tileCalculatorSettings, subtitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="Description..."
                  required
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-[#0145F2] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700"
              >
                <Save size={18} /> Save Header Settings
              </button>
            </div>
          </form>

          {/* TILE SIZES MANAGEMENT */}
          <div className="grid lg:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><Layers size={16} /> 1. Manage Tile Sizes</h3>
              <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-2">
                {tileCalculatorSettings.tileSizes?.map((size, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-center gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{size.label} <span className="text-xs text-slate-400 font-semibold uppercase ml-2">ID: {size.id}</span></p>
                      <p className="text-xs text-slate-500">Width: {size.w || 0}mm | Height: {size.h || 0}mm | Tiles per Box: {size.count || 0} | {size.desc}</p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => { setEditSizeIdx(idx); setNewSize({ ...size, count: size.count !== undefined ? size.count : '' }); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                      <button type="button" onClick={() => {
                        const updated = tileCalculatorSettings.tileSizes.filter((_, i) => i !== idx);
                        const newSettings = { ...tileCalculatorSettings, tileSizes: updated };
                        setTileCalculatorSettings(newSettings);
                        persistFlaisGuide({ tileCalculator: newSettings });
                        toast.success('Size deleted!');
                      }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 h-fit space-y-3">
              <h4 className="font-semibold text-xs text-slate-700">{editSizeIdx !== null ? 'Edit Size' : 'Add Size'}</h4>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">ID (e.g. 600x600)</label>
                <input type="text" value={newSize.id} onChange={(e) => setNewSize({ ...newSize, id: e.target.value })} className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none" placeholder="600x600" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Width (mm)</label>
                  <input type="number" value={newSize.w} onChange={(e) => setNewSize({ ...newSize, w: parseInt(e.target.value) || '' })} className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none" placeholder="600" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Length (mm)</label>
                  <input type="number" value={newSize.h} onChange={(e) => setNewSize({ ...newSize, h: parseInt(e.target.value) || '' })} className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none" placeholder="1200" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Label (e.g. 600×1200 mm)</label>
                <input type="text" value={newSize.label} onChange={(e) => setNewSize({ ...newSize, label: e.target.value })} className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none" placeholder="600×1200 mm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Tiles per Box (Count)</label>
                <input type="number" value={newSize.count} onChange={(e) => setNewSize({ ...newSize, count: parseInt(e.target.value) || '' })} className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none" placeholder="4" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Description (e.g. GLASS / ELECTRA)</label>
                <input type="text" value={newSize.desc} onChange={(e) => setNewSize({ ...newSize, desc: e.target.value })} className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none" placeholder="GLASS / ELECTRA" />
              </div>
              <button type="button" onClick={() => {
                if (!newSize.id || !newSize.label) return toast.error('Fields missing');
                let updated = [...(tileCalculatorSettings.tileSizes || [])];
                const sizeWithCount = {
                  ...newSize,
                  w: newSize.w ? parseInt(newSize.w) : undefined,
                  h: newSize.h ? parseInt(newSize.h) : undefined,
                  count: newSize.count !== '' ? parseInt(newSize.count) : 0
                };
                if (editSizeIdx !== null) {
                  updated[editSizeIdx] = sizeWithCount;
                  toast.success('Size updated');
                  setEditSizeIdx(null);
                } else {
                  updated.push(sizeWithCount);
                  toast.success('Size added');
                }
                const newSettings = { ...tileCalculatorSettings, tileSizes: updated };
                setTileCalculatorSettings(newSettings);
                persistFlaisGuide({ tileCalculator: newSettings });
                setNewSize({ id: '', w: '', h: '', label: '', desc: '', count: '' });
              }} className="w-full bg-[#0145F2] text-white p-2 rounded text-xs font-bold transition-colors">
                {editSizeIdx !== null ? 'Update Size' : 'Add Size'}
              </button>
              {editSizeIdx !== null && (
                <button type="button" onClick={() => { setEditSizeIdx(null); setNewSize({ id: '', w: '', h: '', label: '', desc: '', count: '' }); }} className="w-full bg-slate-200 text-slate-600 p-2 rounded text-xs font-bold mt-1">Cancel</button>
              )}
            </div>
          </div>

          {/* LAYING PATTERNS MANAGEMENT */}
          <div className="grid lg:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><Grid size={16} /> 2. Manage Laying Patterns</h3>
              <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto pr-2">
                {tileCalculatorSettings.patterns?.map((pattern, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-center gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{pattern.label} <span className="text-xs text-slate-400 font-semibold uppercase ml-2">ID: {pattern.id}</span></p>
                      <p className="text-xs text-slate-500">Wastage: {pattern.wastage}% | {pattern.desc}</p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => { setEditPatternIdx(idx); setNewPattern(pattern); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                      <button type="button" onClick={() => {
                        const updated = tileCalculatorSettings.patterns.filter((_, i) => i !== idx);
                        const newSettings = { ...tileCalculatorSettings, patterns: updated };
                        setTileCalculatorSettings(newSettings);
                        persistFlaisGuide({ tileCalculator: newSettings });
                        toast.success('Pattern deleted!');
                      }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 h-fit space-y-3">
              <h4 className="font-semibold text-xs text-slate-700">{editPatternIdx !== null ? 'Edit Pattern' : 'Add Pattern'}</h4>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">ID (e.g. straight)</label>
                <input type="text" value={newPattern.id} onChange={(e) => setNewPattern({ ...newPattern, id: e.target.value })} className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none" placeholder="straight" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Label (e.g. Straight Lay)</label>
                <input type="text" value={newPattern.label} onChange={(e) => setNewPattern({ ...newPattern, label: e.target.value })} className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none" placeholder="Straight Lay" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Wastage Percentage (%)</label>
                <input type="number" value={newPattern.wastage} onChange={(e) => setNewPattern({ ...newPattern, wastage: parseInt(e.target.value) || '' })} className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none" placeholder="5" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Description</label>
                <input type="text" value={newPattern.desc} onChange={(e) => setNewPattern({ ...newPattern, desc: e.target.value })} className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none" placeholder="Grid pattern" />
              </div>
              <button type="button" onClick={() => {
                if (!newPattern.id || !newPattern.label) return toast.error('Fields missing');
                let updated = [...(tileCalculatorSettings.patterns || [])];
                if (editPatternIdx !== null) {
                  updated[editPatternIdx] = newPattern;
                  toast.success('Pattern updated');
                  setEditPatternIdx(null);
                } else {
                  updated.push(newPattern);
                  toast.success('Pattern added');
                }
                const newSettings = { ...tileCalculatorSettings, patterns: updated };
                setTileCalculatorSettings(newSettings);
                persistFlaisGuide({ tileCalculator: newSettings });
                setNewPattern({ id: '', label: '', wastage: '', desc: '' });
              }} className="w-full bg-[#0145F2] text-white p-2 rounded text-xs font-bold transition-colors">
                {editPatternIdx !== null ? 'Update Pattern' : 'Add Pattern'}
              </button>
              {editPatternIdx !== null && (
                <button type="button" onClick={() => { setEditPatternIdx(null); setNewPattern({ id: '', label: '', wastage: '', desc: '' }); }} className="w-full bg-slate-200 text-slate-600 p-2 rounded text-xs font-bold mt-1">Cancel</button>
              )}
            </div>
          </div>

          {/* GROUT OPTIONS MANAGEMENT */}
          <div className="grid lg:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
            <div className="lg:col-span-2 space-y-4">
              <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2"><Construction size={16} /> 3. Manage Grout Options</h3>
              <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-2">
                {tileCalculatorSettings.groutOptions?.map((grout, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-center gap-2">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{grout.label} <span className="text-xs text-slate-400 font-semibold ml-2">Value: {grout.value}mm</span></p>
                      <p className="text-xs text-slate-500">Multiplier Factor: {grout.factor}</p>
                    </div>
                    <div className="flex gap-1">
                      <button type="button" onClick={() => { setEditGroutIdx(idx); setNewGrout(grout); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit size={14} /></button>
                      <button type="button" onClick={() => {
                        const updated = tileCalculatorSettings.groutOptions.filter((_, i) => i !== idx);
                        const newSettings = { ...tileCalculatorSettings, groutOptions: updated };
                        setTileCalculatorSettings(newSettings);
                        persistFlaisGuide({ tileCalculator: newSettings });
                        toast.success('Grout option deleted!');
                      }} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 h-fit space-y-3">
              <h4 className="font-semibold text-xs text-slate-700">{editGroutIdx !== null ? 'Edit Grout' : 'Add Grout'}</h4>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Value (mm - integer)</label>
                <input type="number" value={newGrout.value} onChange={(e) => setNewGrout({ ...newGrout, value: parseInt(e.target.value) || '' })} className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none" placeholder="2" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Label (e.g. 2mm)</label>
                <input type="text" value={newGrout.label} onChange={(e) => setNewGrout({ ...newGrout, label: e.target.value })} className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none" placeholder="2mm" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1">Multiplier Factor (float)</label>
                <input type="number" step="any" value={newGrout.factor} onChange={(e) => setNewGrout({ ...newGrout, factor: parseFloat(e.target.value) || '' })} className="w-full rounded border border-slate-300 p-2 text-xs focus:outline-none" placeholder="1.0" />
              </div>
              <button type="button" onClick={() => {
                if (!newGrout.value || !newGrout.label) return toast.error('Fields missing');
                let updated = [...(tileCalculatorSettings.groutOptions || [])];
                if (editGroutIdx !== null) {
                  updated[editGroutIdx] = newGrout;
                  toast.success('Grout option updated');
                  setEditGroutIdx(null);
                } else {
                  updated.push(newGrout);
                  toast.success('Grout option added');
                }
                const newSettings = { ...tileCalculatorSettings, groutOptions: updated };
                setTileCalculatorSettings(newSettings);
                persistFlaisGuide({ tileCalculator: newSettings });
                setNewGrout({ value: '', label: '', factor: '' });
              }} className="w-full bg-[#0145F2] text-white p-2 rounded text-xs font-bold transition-colors">
                {editGroutIdx !== null ? 'Update Grout' : 'Add Grout'}
              </button>
              {editGroutIdx !== null && (
                <button type="button" onClick={() => { setEditGroutIdx(null); setNewGrout({ value: '', label: '', factor: '' }); }} className="w-full bg-slate-200 text-slate-600 p-2 rounded text-xs font-bold mt-1">Cancel</button>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Achievement Page Settings</h2>
            <p className="text-sm text-slate-500">Edit hero banner title, description, cover image/video, and introduction card text.</p>
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
                  placeholder="Achievements"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Subtitle</label>
                <input
                  type="text"
                  value={pageSettings.heroSubtitle}
                  onChange={(e) => setPageSettings({ ...pageSettings, heroSubtitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="Our journey of excellence..."
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Hero Cover Media File (mp4 video or image)</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const url = await uploadImageFile(file);
                    if (url) {
                      setPageSettings({ ...pageSettings, heroMedia: url });
                    }
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
              />
              {pageSettings.heroMedia && (
                <div className="mt-2 h-20 w-36 border border-slate-200 rounded overflow-hidden">
                  {pageSettings.heroMedia.startsWith('data:video/') || pageSettings.heroMedia.includes('.mp4') ? (
                    <video src={pageSettings.heroMedia} className="h-full w-full object-cover" muted />
                  ) : (
                    <img src={pageSettings.heroMedia} alt="preview" className="h-full w-full object-cover" />
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Introduction Card Title</label>
              <input
                type="text"
                value={pageSettings.introTitle}
                onChange={(e) => setPageSettings({ ...pageSettings, introTitle: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                placeholder="Pioneering the Future of Surfaces"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Introduction Card Description</label>
              <textarea
                value={pageSettings.introDescription}
                onChange={(e) => setPageSettings({ ...pageSettings, introDescription: e.target.value })}
                rows={4}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                placeholder="Details of your company commitment..."
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

      {activeTab === 'awards' && (
        <form onSubmit={(e) => {
          e.preventDefault();
          persistFlaisGuide({ awardsSettings });
          toast.success('Awards & Accolades settings saved successfully!');
        }} className="space-y-6 rounded-2xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Awards & Accolades Settings</h2>
            <p className="text-sm text-slate-500">Edit the title, description, stats, and showcase photo for the Awards section.</p>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Badge Tagline</label>
                <input
                  type="text"
                  value={awardsSettings.badge}
                  onChange={(e) => setAwardsSettings({ ...awardsSettings, badge: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="Awards & Achievements"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Title</label>
                <textarea
                  rows="2"
                  value={awardsSettings.title}
                  onChange={(e) => setAwardsSettings({ ...awardsSettings, title: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="Accolades of\nInnovation & Excellence"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Description Text</label>
              <textarea
                rows="4"
                value={awardsSettings.desc}
                onChange={(e) => setAwardsSettings({ ...awardsSettings, desc: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                placeholder="Explain the significance of the awards..."
                required
              />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Stat 1 Value</label>
                <input
                  type="text"
                  value={awardsSettings.stat1Val}
                  onChange={(e) => setAwardsSettings({ ...awardsSettings, stat1Val: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="50+"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Stat 1 Label</label>
                <input
                  type="text"
                  value={awardsSettings.stat1Label}
                  onChange={(e) => setAwardsSettings({ ...awardsSettings, stat1Label: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="Industrial Awards"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Stat 2 Value</label>
                <input
                  type="text"
                  value={awardsSettings.stat2Val}
                  onChange={(e) => setAwardsSettings({ ...awardsSettings, stat2Val: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="Global"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Stat 2 Label</label>
                <input
                  type="text"
                  value={awardsSettings.stat2Label}
                  onChange={(e) => setAwardsSettings({ ...awardsSettings, stat2Label: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-4 text-sm focus:border-[#0145F2] focus:outline-none"
                  placeholder="Design Standard"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Showcase Photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const url = await uploadImageFile(file);
                    if (url) {
                      setAwardsSettings({ ...awardsSettings, image: url });
                    }
                  }
                }}
                className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
              />
              {awardsSettings.image && (
                <div className="mt-2 h-24 w-32 border border-slate-200 rounded overflow-hidden p-1">
                  <img src={awardsSettings.image} alt="preview" className="h-full w-full object-cover rounded" />
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-[#0145F2] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700"
            >
              <Save size={18} /> Save Awards Settings
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminAchievement;
