import React, { useState, useRef, useEffect } from 'react';
import { Images, Video, Plus, Edit, Trash2, Upload, CheckCircle, X, Save, Film, CheckSquare, Maximize, Grid, Loader2, Star, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import defaultSustainImg from '../assets/michael-fortsch-bIm9salXn-g-unsplash.jpg.jpeg';
import defaultCollectionsVideo from '../assets/Its different motion logo (1).mp4';

const initialChoiceData = [];
const initialSizeData = [];
const initialCategoryData = [];

const AdminHome = () => {
  const [activeTab, setActiveTab] = useState('slider');
  const [slides, setSlides] = useState([]);
  const [choices, setChoices] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadingField, setUploadingField] = useState(null); // Track which field is uploading
  const getBackendBaseUrl = () => {
    if (import.meta.env.VITE_BACKEND_URL) {
      return import.meta.env.VITE_BACKEND_URL.trim().replace(/\/$/, '');
    }
    const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:8000`;
    }
    return 'http://localhost:8000';
  };

  const BackendUrl = getBackendBaseUrl();

  const getImageUrl = (url) => {
    if (!url) return '';
    
    let cleanPath = url;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      try {
        const parsed = new URL(url);
        let pathname = parsed.pathname;
        if (pathname.startsWith('/media/')) {
          cleanPath = pathname.substring(7);
        } else if (pathname.startsWith('/uploads/')) {
          cleanPath = pathname.substring(9);
        } else if (pathname.startsWith('/')) {
          cleanPath = pathname.substring(1);
        }
      } catch (e) {
        cleanPath = url;
      }
    }
    
    return `${BackendUrl}/media/${cleanPath.replace(/^\//, '')}`;
  };

  // Choice form states
  const [isAddingChoice, setIsAddingChoice] = useState(false);
  const [newChoice, setNewChoice] = useState({ name: '', image: '', type: '', logoImage: '' });
  const [editChoiceId, setEditChoiceId] = useState(null);
  const [editChoiceData, setEditChoiceData] = useState({ name: '', image: '', type: '', logoImage: '' });

  // Sizes form states
  const [isAddingSize, setIsAddingSize] = useState(false);
  const [newSize, setNewSize] = useState({ title: '', thickness: '', image: '' });
  const [editSizeId, setEditSizeId] = useState(null);
  const [editSizeData, setEditSizeData] = useState({ title: '', thickness: '', image: '' });

  // Categories form states
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategory, setNewCategory] = useState({ name: '', image: '' });
  const [editCategoryId, setEditCategoryId] = useState(null);
  const [editCategoryData, setEditCategoryData] = useState({ name: '', image: '' });

  // Blog states for Our Blog tab
  const [blogs, setBlogs] = useState([]);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [isAddingBlog, setIsAddingBlog] = useState(false);
  const [blogForm, setBlogForm] = useState({ title: '', textColor: '#ffffff', content: '' });
  const [blogImage, setBlogImage] = useState(null);
  const [isSubmittingBlog, setIsSubmittingBlog] = useState(false);

  // Choice handlers
  const handleAddChoice = (e) => {
    e.preventDefault();
    if (!newChoice.name || !newChoice.image || !newChoice.type) {
      return toast.error('All choice fields are required');
    }
    const updated = [...choices, { ...newChoice, id: Date.now() }];
    setChoices(updated);
    setNewChoice({ name: '', image: '', type: '', logoImage: '' });
    setIsAddingChoice(false);
    persistHomePage({ choices: updated });
    toast.success('Collection added successfully!');
  };

  const handleEditChoice = (e) => {
    e.preventDefault();
    if (!editChoiceData.name || !editChoiceData.image || !editChoiceData.type) {
      return toast.error('All choice fields are required');
    }
    const updated = choices.map(c => c.id === editChoiceId ? { ...editChoiceData, id: editChoiceId } : c);
    setChoices(updated);
    setEditChoiceId(null);
    persistHomePage({ choices: updated });
    toast.success('Collection updated successfully!');
  };

  const handleDeleteChoice = (id) => {
    if (!window.confirm('Delete this collection?')) return;
    const updated = choices.filter(c => c.id !== id);
    setChoices(updated);
    persistHomePage({ choices: updated });
    toast.success('Collection deleted!');
  };

  // Size handlers
  const handleAddSize = (e) => {
    e.preventDefault();
    if (!newSize.title || !newSize.thickness || !newSize.image) {
      return toast.error('All size fields are required');
    }
    const updated = [...sizes, { ...newSize, id: Date.now() }];
    setSizes(updated);
    setNewSize({ title: '', thickness: '', image: '' });
    setIsAddingSize(false);
    persistHomePage({ sizes: updated });
    toast.success('Dimension size added!');
  };

  const handleEditSize = (e) => {
    e.preventDefault();
    if (!editSizeData.title || !editSizeData.thickness || !editSizeData.image) {
      return toast.error('All size fields are required');
    }
    const updated = sizes.map(s => s.id === editSizeId ? { ...editSizeData, id: editSizeId } : s);
    setSizes(updated);
    setEditSizeId(null);
    persistHomePage({ sizes: updated });
    toast.success('Dimension size updated!');
  };

  const handleDeleteSize = (id) => {
    if (!window.confirm('Delete this dimension size?')) return;
    const updated = sizes.filter(s => s.id !== id);
    setSizes(updated);
    persistHomePage({ sizes: updated });
    toast.success('Dimension deleted!');
  };

  // Category handlers
  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategory.name || !newCategory.image) {
      return toast.error('All category fields are required');
    }
    const slug = newCategory.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const updated = [...categories, { ...newCategory, id: slug || Date.now().toString() }];
    setCategories(updated);
    setNewCategory({ name: '', image: '' });
    setIsAddingCategory(false);
    persistHomePage({ categories: updated });
    toast.success('Category added successfully!');
  };

  const handleEditCategory = (e) => {
    e.preventDefault();
    if (!editCategoryData.name || !editCategoryData.image) {
      return toast.error('All category fields are required');
    }
    const updated = categories.map(c => c.id === editCategoryId ? { ...editCategoryData, id: editCategoryId } : c);
    setCategories(updated);
    setEditCategoryId(null);
    persistHomePage({ categories: updated });
    toast.success('Category updated successfully!');
  };

  const handleDeleteCategory = (id) => {
    if (!window.confirm('Delete this category?')) return;
    const updated = categories.filter(c => c.id !== id);
    setCategories(updated);
    persistHomePage({ categories: updated });
    toast.success('Category deleted!');
  };

  // Series Logos state
  const [seriesLogos, setSeriesLogos] = useState([]);
  const [logosLoading, setLogosLoading] = useState(false);
  const [isAddingLogo, setIsAddingLogo] = useState(false);
  const [newLogoName, setNewLogoName] = useState('');
  const [newLogoFile, setNewLogoFile] = useState(null);
  const [newLogoOrder, setNewLogoOrder] = useState('');
  const [isSubmittingLogo, setIsSubmittingLogo] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  const [editLogoId, setEditLogoId] = useState(null);
  const [editLogoData, setEditLogoData] = useState({ name: '', order: '' });
  const [editLogoFile, setEditLogoFile] = useState(null);
  const [editLogoPreview, setEditLogoPreview] = useState(null);

  // New slide form state
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [newSlide, setNewSlide] = useState({ tagline: '', title: '', subtitle: '' });
  const [newSlideImage, setNewSlideImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit slide form state
  const [editSlideId, setEditSlideId] = useState(null);
  const [editSlideData, setEditSlideData] = useState({ tagline: '', title: '', subtitle: '' });
  const [editSlideImage, setEditSlideImage] = useState(null);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          fetchSlides(),
          fetchSeriesLogos(),
          fetchHomePage(),
          fetchBlogs()
        ]);
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };
    initData();
  }, []);

  const fetchHomePage = async () => {
    try {
      const res = await axios.get(`${BackendUrl}/api/home`);
      const home = res.data.home || {};
      if (home.homeTexts) setHomeTexts((prev) => ({ ...prev, ...home.homeTexts }));
      if (Array.isArray(home.choices)) setChoices(home.choices);
      if (Array.isArray(home.sizes)) setSizes(home.sizes);
      if (Array.isArray(home.categories)) setCategories(home.categories);
      if (home.video?.url) {
        setVideoPreview(home.video.url);
        setVideoName(home.video.name || 'Home Video');
      }
    } catch (error) {
    }
  };

  const fetchSeriesLogos = async () => {
    try {
      setLogosLoading(true);
      const res = await axios.get(`${BackendUrl}/api/series-logos`);
      setSeriesLogos(res.data.logos || []);
    } catch (error) {
      toast.error('Failed to load series logos');
    } finally {
      setLogosLoading(false);
    }
  };

  const fetchBlogs = async () => {
    try {
      setBlogsLoading(true);
      const res = await axios.get(`${BackendUrl}/api/blogs`);
      setBlogs(res.data.blogs || []);
    } catch (error) {
      toast.error('Failed to load blogs');
    } finally {
      setBlogsLoading(false);
    }
  };

  const handleAddBlog = async (e) => {
    e.preventDefault();
    if (!blogForm.title.trim()) return toast.error('Title is required');
    if (!blogForm.content.trim()) return toast.error('Content is required');
    
    try {
      setIsSubmittingBlog(true);
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('title', blogForm.title);
      formData.append('textColor', blogForm.textColor);
      formData.append('content', blogForm.content);
      if (blogImage) {
        formData.append('image', blogImage);
      }
      
      await axios.post(`${BackendUrl}/api/blogs`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('Blog post created successfully');
      setBlogForm({ title: '', textColor: '#ffffff', content: '' });
      setBlogImage(null);
      setIsAddingBlog(false);
      fetchBlogs();
    } catch (error) {
      toast.error('Failed to create blog post');
    } finally {
      setIsSubmittingBlog(false);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${BackendUrl}/api/blogs/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Blog post deleted successfully');
      setBlogs(blogs.filter(b => b._id !== id));
    } catch (error) {
      toast.error('Failed to delete blog post');
    }
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNewLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const handleAddLogo = async (e) => {
    e.preventDefault();
    if (!newLogoFile) return toast.error('Logo image is required');
    if (!newLogoName.trim()) return toast.error('Logo name is required');
    try {
      setIsSubmittingLogo(true);
      const formData = new FormData();
      formData.append('name', newLogoName.trim());
      formData.append('image', newLogoFile);
      if (newLogoOrder !== '') formData.append('order', newLogoOrder);

      const token = localStorage.getItem('adminToken');
      await axios.post(`${BackendUrl}/api/series-logos`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Series logo added!');
      setNewLogoName('');
      setNewLogoFile(null);
      setNewLogoOrder('');
      setLogoPreview(null);
      setIsAddingLogo(false);
      fetchSeriesLogos();
    } catch (error) {
      toast.error('Failed to add logo');
    } finally {
      setIsSubmittingLogo(false);
    }
  };

  const handleEditLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setEditLogoFile(file);
    setEditLogoPreview(URL.createObjectURL(file));
  };

  const handleEditLogoSubmit = async (e) => {
    e.preventDefault();
    if (!editLogoData.name.trim()) return toast.error('Logo name is required');
    try {
      setIsSubmittingLogo(true);
      const formData = new FormData();
      formData.append('name', editLogoData.name.trim());
      if (editLogoData.order !== '') formData.append('order', editLogoData.order);
      if (editLogoFile) formData.append('image', editLogoFile);

      const token = localStorage.getItem('adminToken');
      await axios.put(`${BackendUrl}/api/series-logos/${editLogoId}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Series logo updated!');
      setEditLogoId(null);
      setEditLogoData({ name: '', order: '' });
      setEditLogoFile(null);
      setEditLogoPreview(null);
      fetchSeriesLogos();
    } catch (error) {
      toast.error('Failed to update logo');
    } finally {
      setIsSubmittingLogo(false);
    }
  };

  const handleDeleteLogo = async (id) => {
    if (!window.confirm('Remove this series logo from the homepage?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${BackendUrl}/api/series-logos/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Logo removed');
      setSeriesLogos(seriesLogos.filter(l => l._id !== id));
    } catch (error) {
      toast.error('Failed to remove logo');
    }
  };

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${BackendUrl}/api/hero`);
      setSlides(res.data.slides || []);
    } catch (error) {
      toast.error('Failed to load hero slides');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlide = async (e) => {
    e.preventDefault();
    if (!newSlideImage) return toast.error('Image is required');
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', newSlide.title);
      formData.append('tagline', newSlide.tagline);
      formData.append('subtitle', newSlide.subtitle);
      formData.append('image', newSlideImage);

      const token = localStorage.getItem('adminToken');
      await axios.post(`${BackendUrl}/api/hero`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Slide added successfully');
      setNewSlide({ tagline: '', title: '', subtitle: '' });
      setNewSlideImage(null);
      setIsAddingSlide(false);
      fetchSlides();
    } catch (error) {
      toast.error('Failed to add slide');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSlideSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', editSlideData.title);
      formData.append('tagline', editSlideData.tagline);
      formData.append('subtitle', editSlideData.subtitle);
      if (editSlideImage) {
        formData.append('image', editSlideImage);
      }

      const token = localStorage.getItem('adminToken');
      await axios.put(`${BackendUrl}/api/hero/${editSlideId}`, formData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Slide updated successfully');
      setEditSlideId(null);
      setEditSlideData({ tagline: '', title: '', subtitle: '' });
      setEditSlideImage(null);
      fetchSlides();
    } catch (error) {
      toast.error('Failed to update slide');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSlide = async (id) => {
    if (!window.confirm('Delete this slide?')) return;
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`${BackendUrl}/api/hero/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success('Slide deleted');
      setSlides(slides.filter(s => s._id !== id));
    } catch (error) {
      toast.error('Failed to delete slide');
    }
  };
  
  const [homeTexts, setHomeTexts] = useState({
    innovationTitle: "",
    innovationDesc: "",
    innovationExp: "",
    innovationDesigns: "",
    innovationImage: "",
    collectionsDesc1: "",
    collectionsDesc2: "",
    collectionsImage: "",
    collectionsVideo: "",
    categoriesTitle: "",
    categoriesDesc: "",
    collectionsTitle: "",
    marqueeTitle: "",
    sustainabilityTitle: "",
    sustainabilityDesc: "",
    sustainabilityImage: "",
    blogTitle: ""
  });

  const handleSaveHomeTexts = (e) => {
    if (e) e.preventDefault();
    persistHomePage({ homeTexts });
    toast.success('Home page texts saved!');
  };

  const [videoName, setVideoName] = useState('No brand film saved yet');
  const [videoPreview, setVideoPreview] = useState(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploadMessage, setVideoUploadMessage] = useState('');
  const videoInputRef = useRef(null);
  const MAX_VIDEO_UPLOAD_SIZE = 500 * 1024 * 1024;

  const uploadFileToBackend = async (file, { onProgress, onStage } = {}) => {
    const token = localStorage.getItem('adminToken');
    if (!file) {
      throw new Error('No file selected');
    }

    // Local storage upload
    const endpoint = '/api/admin/upload';

    if (typeof onStage === 'function') {
      onStage('Uploading to local storage...');
    }

    const formData = new FormData();
    formData.append('file', file, file.name);
    formData.append('category', 'home');

    const response = await axios.post(`${BackendUrl}${endpoint}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      onUploadProgress: (event) => {
        if (!event.total) return;
        const percent = Math.min(99, Math.round((event.loaded / event.total) * 100));
        if (typeof onProgress === 'function') {
          onProgress(percent);
        }
      },
    });


    if (typeof onStage === 'function') {
      onStage('Saving file reference...');
    }

    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Upload failed');
    }

    const fileUrl = response.data.url || response.data.fileUrl || response.data.secure_url || '';
    if (!fileUrl) {
      throw new Error('Backend did not return a file URL');
    }

    return {
      fileUrl,
      fileName: response.data.fileName || file.name,
      raw: response.data,
    };
  };

  const handleVideoFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;


    setVideoUploading(true);
    setVideoUploadProgress(0);
    setVideoUploadMessage('Preparing upload...');

    try {
      setVideoUploadMessage('Uploading video to backend...');

      const uploadResult = await uploadFileToBackend(file, {
        onProgress: (progress) => {
          setVideoUploadProgress(progress);
          setVideoUploadMessage(`Uploading video... ${progress}%`);
        },
        onStage: (message) => {
          setVideoUploadMessage(message);
        },
      });

      setVideoUploadMessage('Saving video URL to database...');

      const uploadedName = uploadResult.fileName || file.name;
      setVideoName(uploadedName);
      setVideoPreview(uploadResult.fileUrl);
      await persistHomePage({ video: { url: uploadResult.fileUrl, name: uploadedName } });

      setVideoUploadProgress(100);
      setVideoUploadMessage('Upload complete');
      toast.success('Video uploaded and saved successfully!');
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message || 'Failed to upload video');
    } finally {
      setVideoUploading(false);
      setTimeout(() => {
        setVideoUploadProgress(0);
        setVideoUploadMessage('');
      }, 600);
    }
  };

  const persistHomePage = async (overrides = {}) => {
    try {
      const token = localStorage.getItem('adminToken');
      const payload = {
        home: {
          homeTexts: overrides.homeTexts ?? homeTexts,
          choices: overrides.choices ?? choices,
          sizes: overrides.sizes ?? sizes,
          categories: overrides.categories ?? categories,
          video: overrides.video ?? { url: videoPreview || '', name: videoName || '' },
        },
      };
      await axios.put(`${BackendUrl}/api/home`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (error) {
      toast.error('Failed to save home page data');
      throw error;
    }
  };

  const tabs = [
    { id: 'slider',  label: 'Hero Slider',      icon: Images },
    { id: 'video',   label: 'Brand Film Video',  icon: Film },
    { id: 'choice',  label: 'Make Your Choice',  icon: CheckSquare },
    { id: 'sizes',   label: 'Tile Sizes',        icon: Maximize },
    { id: 'cats',    label: 'Categories',        icon: Grid },
    { id: 'logos',   label: 'Series Logos',      icon: Star },
    { id: 'blog',    label: 'Our Blog',          icon: FileText },
    { id: 'texts',   label: 'Page Texts',        icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-slate-900">Home Management</h1>
        <p className="text-slate-500 text-sm">Manage all homepage visual sections from one dashboard.</p>
      </div>

      {/* Tab Bar */}
      <div className="flex flex-wrap gap-2 bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id ? 'bg-[#0145F2] text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'
            }`}
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
          {activeTab === 'slider' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Hero Slider Slides</h2>
            <button 
              onClick={() => setIsAddingSlide(!isAddingSlide)}
              className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              {isAddingSlide ? <X size={18} /> : <Plus size={18} />} {isAddingSlide ? 'Cancel' : 'Add Slide'}
            </button>
          </div>

          {isAddingSlide && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-md font-bold mb-4">Add New Slide</h3>
              <form onSubmit={handleAddSlide} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">Title</label>
                  <input type="text" value={newSlide.title} onChange={(e) => setNewSlide({ ...newSlide, title: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5" placeholder="e.g. Premium Tiles (Optional)" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Tagline</label>
                  <input type="text" value={newSlide.tagline} onChange={(e) => setNewSlide({ ...newSlide, tagline: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5" placeholder="e.g. Crafted for Homes" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Subtitle</label>
                  <input type="text" value={newSlide.subtitle} onChange={(e) => setNewSlide({ ...newSlide, subtitle: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5" placeholder="e.g. Exquisite designs..." />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">Image Background</label>
                  <input type="file" required accept="image/*" onChange={(e) => setNewSlideImage(e.target.files[0])} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700" />
                </div>
                <div className="md:col-span-2 pt-2">
                  <button type="submit" disabled={isSubmitting} className="w-full md:w-auto bg-[#0145F2] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Slide
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
            {loading ? (
              <div className="p-10 text-center"><Loader2 className="animate-spin mx-auto text-blue-500" size={32} /></div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <th className="px-6 py-4">Preview</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Subtitle</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {slides.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-500">No slides found. Add one above.</td>
                    </tr>
                  )}
                  {slides.map((slide, idx) => (
                    <tr key={slide._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4"><div className="flex items-center gap-3"><span className="w-6 h-6 rounded-full bg-[#0145F2]/10 text-[#0145F2] text-xs font-bold flex items-center justify-center">{idx + 1}</span><img loading="lazy" src={slide.image} className="h-14 w-20 rounded-xl object-cover border border-slate-100" /></div></td>
                      <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{slide.title}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 max-w-[200px] truncate">{slide.subtitle}</td>
                      <td className="px-6 py-4 text-right">
                        <button onClick={() => handleDeleteSlide(slide._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg" title="Delete Slide">
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Brand Film Video ─────────────── */}
      {activeTab === 'video' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
          <h2 className="text-lg font-bold text-slate-800">Brand Film Video</h2>
          <div className="rounded-xl overflow-hidden bg-black aspect-video max-w-2xl relative">
            {videoUploading ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-white gap-4">
                <Loader2 size={48} className="animate-spin text-[#0145F2]" />
                <p className="font-semibold text-white/90 text-sm">
                  {videoUploadMessage || 'Uploading video...'}
                </p>
                <div className="w-72 max-w-[85%] bg-white/10 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-[#0145F2] transition-all duration-200"
                    style={{ width: `${videoUploadProgress}%` }}
                  />
                </div>
                <p className="text-white/50 text-xs">{videoUploadProgress}% complete</p>
              </div>
            ) : videoPreview ? (
              <video preload="none" src={getImageUrl(videoPreview)} controls className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-white/60 gap-3">
                <Film size={48} className="opacity-40" />
                <p className="font-semibold text-white/80 text-sm">{videoName}</p>
              </div>
            )}
          </div>
          <p className="text-[11px] text-slate-400">
            {videoUploading ? "Uploading the file to Cloudinary through the backend..." : videoPreview ? "Saved in MongoDB and shown on the homepage." : "No brand film saved yet."}
          </p>
          <input
            ref={videoInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg,video/quicktime,video/x-m4v,video/*"
            onChange={handleVideoFileChange}
            className="hidden"
          />
          <button
            onClick={() => videoInputRef.current?.click()}
            disabled={videoUploading}
            className={`btn-primary text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md ${videoUploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#0145F2] hover:bg-blue-700'}`}
          >
            {videoUploading ? <Loader2 size={18} className="animate-spin" /> : <Video size={18} />}
            {videoUploading ? 'Uploading...' : 'Replace Video File'}
          </button>
        </div>
      )}

      {/* ── TAB: Make Your Choice ─────────────── */}
      {activeTab === 'choice' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Collections Slider</h2>
            <button 
              onClick={() => { setIsAddingChoice(!isAddingChoice); setEditChoiceId(null); }}
              className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              {isAddingChoice ? <X size={18} /> : <Plus size={18} />} {isAddingChoice ? 'Cancel' : 'Add Collection'}
            </button>
          </div>

          {isAddingChoice && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-md font-bold mb-4 text-slate-800">Add New Collection</h3>
              <form onSubmit={handleAddChoice} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Collection Name</label>
                  <input type="text" required value={newChoice.name} onChange={(e) => setNewChoice({ ...newChoice, name: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none" placeholder="e.g. LISC collection" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Collection Logo Name Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setUploadingField('newChoice-logo');
                        try {
                          const { fileUrl: url } = await uploadFileToBackend(file);
                          setNewChoice({ ...newChoice, logoImage: url });
                        } finally {
                          setUploadingField(null);
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                    disabled={uploadingField === 'newChoice-logo'}
                  />
                  {uploadingField === 'newChoice-logo' ? (
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </div>
                  ) : newChoice.logoImage ? (
                    <img src={getImageUrl(newChoice.logoImage)} alt="logo preview" className="h-10 mt-1 rounded object-contain border border-slate-100 bg-slate-900 p-1" />
                  ) : null}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Collection Background Image</label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setUploadingField('newChoice-image');
                        try {
                          const { fileUrl: url } = await uploadFileToBackend(file);
                          setNewChoice({ ...newChoice, image: url });
                        } finally {
                          setUploadingField(null);
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                    disabled={uploadingField === 'newChoice-image'}
                  />
                  {uploadingField === 'newChoice-image' ? (
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </div>
                  ) : newChoice.image ? (
                    <img src={getImageUrl(newChoice.image)} alt="preview" className="h-10 mt-1 rounded object-cover border border-slate-100" />
                  ) : null}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Type Identifier</label>
                  <input type="text" required value={newChoice.type} onChange={(e) => setNewChoice({ ...newChoice, type: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none" placeholder="e.g. lisc, glass, marvel, marble_gloss" />
                </div>
                <div className="md:col-span-4 pt-2">
                  <button type="submit" className="bg-[#0145F2] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 text-xs">
                    <Save size={16} /> Save Collection
                  </button>
                </div>
              </form>
            </div>
          )}

          {editChoiceId && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-md font-bold mb-4 text-slate-800">Edit Collection</h3>
              <form onSubmit={handleEditChoice} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Collection Name</label>
                  <input type="text" required value={editChoiceData.name} onChange={(e) => setEditChoiceData({ ...editChoiceData, name: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Collection Logo Name Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setUploadingField('editChoice-logo');
                        try {
                          const { fileUrl: url } = await uploadFileToBackend(file);
                          setEditChoiceData({ ...editChoiceData, logoImage: url });
                        } finally {
                          setUploadingField(null);
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                    disabled={uploadingField === 'editChoice-logo'}
                  />
                  {uploadingField === 'editChoice-logo' ? (
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </div>
                  ) : editChoiceData.logoImage ? (
                    <img src={getImageUrl(editChoiceData.logoImage)} alt="logo preview" className="h-10 mt-1 rounded object-contain border border-slate-100 bg-slate-900 p-1" />
                  ) : null}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Collection Background Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setUploadingField('editChoice-image');
                        try {
                          const { fileUrl: url } = await uploadFileToBackend(file);
                          setEditChoiceData({ ...editChoiceData, image: url });
                        } finally {
                          setUploadingField(null);
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                    disabled={uploadingField === 'editChoice-image'}
                  />
                  {uploadingField === 'editChoice-image' ? (
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </div>
                  ) : editChoiceData.image ? (
                    <img src={getImageUrl(editChoiceData.image)} alt="preview" className="h-10 mt-1 rounded object-cover border border-slate-100" />
                  ) : null}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Type Identifier</label>
                  <input type="text" required value={editChoiceData.type} onChange={(e) => setEditChoiceData({ ...editChoiceData, type: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none" />
                </div>
                <div className="md:col-span-4 pt-2 flex gap-3">
                  <button type="submit" className="bg-[#0145F2] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 text-xs">
                    <Save size={16} /> Update Collection
                  </button>
                  <button type="button" onClick={() => setEditChoiceId(null)} className="border border-slate-200 px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-4">Preview</th>
                  <th className="px-6 py-4">Collection Name</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {choices.map((col, idx) => (
                  <tr key={col.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#0145F2]/10 text-[#0145F2] text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                        <img loading="lazy" src={getImageUrl(col.image)} className="h-14 w-20 rounded-xl object-cover border border-slate-100" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 text-sm">
                      <div className="flex items-center gap-3">
                        {col.logoImage && (
                          <img src={getImageUrl(col.logoImage)} className="h-8 w-12 object-contain bg-slate-950 p-1 rounded border border-slate-200" alt="logo" />
                        )}
                        <span>{col.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 uppercase tracking-widest">{col.type}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setEditChoiceId(col.id); setEditChoiceData({ name: col.name, image: col.image, type: col.type, logoImage: col.logoImage || '' }); setIsAddingChoice(false); }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" 
                          title="Edit Collection"
                        >
                          <Edit size={17} />
                        </button>
                        <button 
                          onClick={() => handleDeleteChoice(col.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg" 
                          title="Delete Collection"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: Tile Sizes ─────────────────── */}
      {activeTab === 'sizes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">Perfect Tile Sizes</h2>
            <button 
              onClick={() => { setIsAddingSize(!isAddingSize); setEditSizeId(null); }}
              className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              {isAddingSize ? <X size={18} /> : <Plus size={18} />} {isAddingSize ? 'Cancel' : 'Add Dimension'}
            </button>
          </div>

          {isAddingSize && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-md font-bold mb-4 text-slate-800">Add New Dimension</h3>
              <form onSubmit={handleAddSize} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Dimension Title (e.g. 600x1200 MM)</label>
                  <input type="text" required value={newSize.title} onChange={(e) => setNewSize({ ...newSize, title: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none" placeholder="e.g. 600x1200 MM" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Thickness Info</label>
                  <input type="text" required value={newSize.thickness} onChange={(e) => setNewSize({ ...newSize, thickness: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none" placeholder="e.g. 9 & 15MM Thickness" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Dimension Image</label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setUploadingField('newSize-image');
                        try {
                          const { fileUrl: url } = await uploadFileToBackend(file);
                          setNewSize({ ...newSize, image: url });
                        } finally {
                          setUploadingField(null);
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                    disabled={uploadingField === 'newSize-image'}
                  />
                  {uploadingField === 'newSize-image' ? (
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </div>
                  ) : newSize.image ? (
                    <img src={getImageUrl(newSize.image)} alt="preview" className="h-10 mt-1 rounded object-cover border border-slate-100" />
                  ) : null}
                </div>
                <div className="md:col-span-3 pt-2">
                  <button type="submit" className="bg-[#0145F2] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 text-xs">
                    <Save size={16} /> Save Dimension
                  </button>
                </div>
              </form>
            </div>
          )}

          {editSizeId && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-md font-bold mb-4 text-slate-800">Edit Dimension</h3>
              <form onSubmit={handleEditSize} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Dimension Title</label>
                  <input type="text" required value={editSizeData.title} onChange={(e) => setEditSizeData({ ...editSizeData, title: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Thickness Info</label>
                  <input type="text" required value={editSizeData.thickness} onChange={(e) => setEditSizeData({ ...editSizeData, thickness: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Dimension Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setUploadingField('editSize-image');
                        try {
                          const { fileUrl: url } = await uploadFileToBackend(file);
                          setEditSizeData({ ...editSizeData, image: url });
                        } finally {
                          setUploadingField(null);
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                    disabled={uploadingField === 'editSize-image'}
                  />
                  {uploadingField === 'editSize-image' ? (
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </div>
                  ) : editSizeData.image ? (
                    <img src={getImageUrl(editSizeData.image)} alt="preview" className="h-10 mt-1 rounded object-cover border border-slate-100" />
                  ) : null}
                </div>
                <div className="md:col-span-3 pt-2 flex gap-3">
                  <button type="submit" className="bg-[#0145F2] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 text-xs">
                    <Save size={16} /> Update Dimension
                  </button>
                  <button type="button" onClick={() => setEditSizeId(null)} className="border border-slate-200 px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-4">Preview</th>
                  <th className="px-6 py-4">Dimension Title</th>
                  <th className="px-6 py-4">Thickness Info</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sizes.map((size, idx) => (
                  <tr key={size.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#0145F2]/10 text-[#0145F2] text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                        <img loading="lazy" src={getImageUrl(size.image)} className="h-14 w-20 rounded-xl object-cover border border-slate-100" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{size.title}</td>
                    <td className="px-6 py-4 text-xs text-slate-500 italic">{size.thickness}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setEditSizeId(size.id); setEditSizeData({ title: size.title, thickness: size.thickness, image: size.image }); setIsAddingSize(false); }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" 
                          title="Edit Dimension"
                        >
                          <Edit size={17} />
                        </button>
                        <button 
                          onClick={() => handleDeleteSize(size.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg" 
                          title="Delete Dimension"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: Categories ─────────────────── */}
      {activeTab === 'cats' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">"Find Tiles By Category"</h2>
              <p className="text-xs text-slate-400 mt-0.5">{categories.length} featured categories</p>
            </div>
            <button 
              onClick={() => { setIsAddingCategory(!isAddingCategory); setEditCategoryId(null); }}
              className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              {isAddingCategory ? <X size={18} /> : <Plus size={18} />} {isAddingCategory ? 'Cancel' : 'Add Category'}
            </button>
          </div>

          {isAddingCategory && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-md font-bold mb-4 text-slate-800">Add New Category</h3>
              <form onSubmit={handleAddCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Category Name</label>
                  <input type="text" required value={newCategory.name} onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none" placeholder="e.g. Full Body Tiles" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Category Image</label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setUploadingField('newCategory-image');
                        try {
                          const { fileUrl: url } = await uploadFileToBackend(file);
                          setNewCategory({ ...newCategory, image: url });
                        } finally {
                          setUploadingField(null);
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                    disabled={uploadingField === 'newCategory-image'}
                  />
                  {uploadingField === 'newCategory-image' ? (
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </div>
                  ) : newCategory.image ? (
                    <img src={getImageUrl(newCategory.image)} alt="preview" className="h-10 mt-1 rounded object-cover border border-slate-100" />
                  ) : null}
                </div>
                <div className="md:col-span-2 pt-2">
                  <button type="submit" className="bg-[#0145F2] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 text-xs">
                    <Save size={16} /> Save Category
                  </button>
                </div>
              </form>
            </div>
          )}

          {editCategoryId && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-md font-bold mb-4 text-slate-800">Edit Category</h3>
              <form onSubmit={handleEditCategory} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Category Name</label>
                  <input type="text" required value={editCategoryData.name} onChange={(e) => setEditCategoryData({ ...editCategoryData, name: e.target.value })} className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Category Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setUploadingField('editCategory-image');
                        try {
                          const { fileUrl: url } = await uploadFileToBackend(file);
                          setEditCategoryData({ ...editCategoryData, image: url });
                        } finally {
                          setUploadingField(null);
                        }
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                    disabled={uploadingField === 'editCategory-image'}
                  />
                  {uploadingField === 'editCategory-image' ? (
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <Loader2 size={14} className="animate-spin" /> Uploading...
                    </div>
                  ) : editCategoryData.image ? (
                    <img src={getImageUrl(editCategoryData.image)} alt="preview" className="h-10 mt-1 rounded object-cover border border-slate-100" />
                  ) : null}
                </div>
                <div className="md:col-span-2 pt-2 flex gap-3">
                  <button type="submit" className="bg-[#0145F2] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 text-xs">
                    <Save size={16} /> Update Category
                  </button>
                  <button type="button" onClick={() => setEditCategoryId(null)} className="border border-slate-200 px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-50">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <th className="px-6 py-4">Preview</th>
                  <th className="px-6 py-4">Category Name</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.map((cat, idx) => (
                  <tr key={cat.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#0145F2]/10 text-[#0145F2] text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                        <img loading="lazy" src={getImageUrl(cat.image)} alt={cat.name} className="h-14 w-20 rounded-xl object-cover border border-slate-100" />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{cat.name}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => { setEditCategoryId(cat.id); setEditCategoryData({ name: cat.name, image: cat.image }); setIsAddingCategory(false); }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg" 
                          title="Edit Category"
                        >
                          <Edit size={17} />
                        </button>
                        <button 
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg" 
                          title="Delete Category"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: Series Logos ─────────────────── */}
      {activeTab === 'logos' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">"Discover Endless Inspiration" Logos</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {seriesLogos.length} logo{seriesLogos.length !== 1 ? 's' : ''} shown in the scrolling marquee on the homepage.
              </p>
            </div>
            <button
              onClick={() => { setIsAddingLogo(!isAddingLogo); setEditLogoId(null); setLogoPreview(null); setNewLogoFile(null); setNewLogoName(''); setNewLogoOrder(''); }}
              className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              {isAddingLogo ? <X size={18} /> : <Plus size={18} />}
              {isAddingLogo ? 'Cancel' : 'Add Logo'}
            </button>
          </div>

          {/* Add Logo Form */}
          {isAddingLogo && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-md font-bold mb-4 text-slate-800">Upload New Series Logo</h3>
              <form onSubmit={handleAddLogo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Logo Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={newLogoName}
                    onChange={(e) => setNewLogoName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="e.g. MARVEL COLLECTION"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Display Order</label>
                  <input
                    type="number"
                    value={newLogoOrder}
                    onChange={(e) => setNewLogoOrder(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    placeholder="e.g. 1 (lower = first)"
                    min="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Logo Image <span className="text-red-500">*</span></label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                    <input
                      type="file"
                      required
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoFileChange}
                    />
                      {logoPreview ? (
                        <img src={getImageUrl(logoPreview)} alt="preview" className="h-20 mx-auto object-contain mix-blend-multiply" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Upload size={28} />
                          <span className="text-sm">Click to upload logo image</span>
                          <span className="text-xs text-slate-300">PNG, JPG, SVG recommended</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2 pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingLogo}
                    className="bg-[#0145F2] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isSubmittingLogo ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Logo
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddingLogo(false)}
                    className="px-6 py-2.5 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Edit Logo Form */}
          {editLogoId && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-md font-bold mb-4 text-slate-800">Edit Series Logo</h3>
              <form onSubmit={handleEditLogoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Logo Name <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    value={editLogoData.name}
                    onChange={(e) => setEditLogoData({ ...editLogoData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Display Order</label>
                  <input
                    type="number"
                    value={editLogoData.order}
                    onChange={(e) => setEditLogoData({ ...editLogoData, order: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                    min="0"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Logo Image (Leave blank to keep existing)</label>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 cursor-pointer border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleEditLogoFileChange}
                    />
                      {editLogoPreview ? (
                        <img src={getImageUrl(editLogoPreview)} alt="preview" className="h-20 mx-auto object-contain mix-blend-multiply" />
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-slate-400">
                          <Upload size={28} />
                          <span className="text-sm">Click to upload new logo image</span>
                        </div>
                      )}
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2 pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={isSubmittingLogo}
                    className="bg-[#0145F2] text-white px-6 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-60"
                  >
                    {isSubmittingLogo ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                    Update Logo
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditLogoId(null); setEditLogoPreview(null); }}
                    className="px-6 py-2.5 rounded-xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Logos Table */}
          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
            {logosLoading ? (
              <div className="p-10 text-center">
                <Loader2 className="animate-spin mx-auto text-blue-500" size={32} />
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <th className="px-6 py-4">Logo Preview</th>
                    <th className="px-6 py-4">Name</th>
                    <th className="px-6 py-4">Order</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {seriesLogos.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-10 text-center">
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Star size={36} className="opacity-30" />
                          <div>
                            <p className="font-semibold text-slate-500">No custom logos yet</p>
                            <p className="text-xs mt-1">The homepage will show the default static logos.<br />Add logos above to override them dynamically.</p>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                  {seriesLogos.map((logo, idx) => (
                    <tr key={logo._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#0145F2]/10 text-[#0145F2] text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <div className="h-14 w-28 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-center overflow-hidden p-1">
                            <img
                              loading="lazy"
                              src={getImageUrl(logo.image)}
                              alt={logo.name}
                              className="max-h-full max-w-full object-contain mix-blend-multiply"
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 text-sm">{logo.name}</td>
                      <td className="px-6 py-4 text-xs text-slate-400">{logo.order ?? '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => { setEditLogoId(logo._id); setEditLogoData({ name: logo.name, order: logo.order ?? '' }); setEditLogoPreview(logo.image); setIsAddingLogo(false); }}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit Logo"
                          >
                            <Edit size={17} />
                          </button>
                          <button
                            onClick={() => handleDeleteLogo(logo._id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Logo"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Info Note */}
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-5 py-4">
            <div className="text-blue-500 mt-0.5 flex-shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>
            </div>
            <div className="text-xs text-blue-700 leading-relaxed">
              <p className="font-semibold mb-0.5">How it works</p>
              <p>When logos are added here, the homepage "Discover Endless Inspiration" marquee will display them dynamically instead of the built-in static images. Upload PNG or JPG files with a transparent or white background for best results.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'texts' && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Page Section Texts & Settings</h2>
              <p className="text-xs text-slate-400 mt-0.5">Edit page headings, paragraphs, stats, and sustainability options.</p>
            </div>
            <button
              onClick={handleSaveHomeTexts}
              className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-6 py-3 font-bold text-white hover:bg-blue-700 transition-all shadow-lg"
            >
              <Save size={18} /> Save Page Settings
            </button>
          </div>
          
          <form onSubmit={handleSaveHomeTexts} className="space-y-6">
            {/* Innovation Section */}
            <div className="border-b border-slate-100 pb-6 space-y-4">
              <h3 className="text-md font-bold text-slate-700">Tile Innovation Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={homeTexts.innovationTitle}
                    onChange={(e) => setHomeTexts({ ...homeTexts, innovationTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section Description</label>
                  <textarea
                    rows="3"
                    value={homeTexts.innovationDesc}
                    onChange={(e) => setHomeTexts({ ...homeTexts, innovationDesc: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2] resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Experience Stat Value</label>
                  <input
                    type="text"
                    value={homeTexts.innovationExp}
                    onChange={(e) => setHomeTexts({ ...homeTexts, innovationExp: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Designs Stat Value</label>
                  <input
                    type="text"
                    value={homeTexts.innovationDesigns}
                    onChange={(e) => setHomeTexts({ ...homeTexts, innovationDesigns: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section Image</label>
                  <div className="aspect-video max-w-md rounded-xl overflow-hidden border border-slate-100 bg-slate-50 mb-2">
                    {homeTexts.innovationImage ? (
                      <img
                        loading="lazy"
                        src={getImageUrl(homeTexts.innovationImage)}
                        className="w-full h-full object-cover"
                        alt="Innovation section preview"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
                        <Upload size={28} className="mb-2" />
                        <p className="font-semibold">No saved image yet</p>
                        <p className="text-xs mt-1">Upload one to show it on the homepage</p>
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const { fileUrl: url } = await uploadFileToBackend(file);
                        setHomeTexts({ ...homeTexts, innovationImage: url });
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                  />
                  <p className="text-[11px] text-slate-400 mt-2">
                    {homeTexts.innovationImage ? "Saved in MongoDB and shown on the homepage." : "Nothing saved yet."}
                  </p>
                </div>
              </div>
            </div>

            {/* Categories Section */}
            <div className="border-b border-slate-100 pb-6 space-y-4">
              <h3 className="text-md font-bold text-slate-700">Categories Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={homeTexts.categoriesTitle}
                    onChange={(e) => setHomeTexts({ ...homeTexts, categoriesTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section Description</label>
                  <textarea
                    rows="3"
                    value={homeTexts.categoriesDesc}
                    onChange={(e) => setHomeTexts({ ...homeTexts, categoriesDesc: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Different Collection Section */}
            <div className="border-b border-slate-100 pb-6 space-y-4">
              <h3 className="text-md font-bold text-slate-700">Different Collection Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={homeTexts.collectionsTitle}
                    onChange={(e) => setHomeTexts({ ...homeTexts, collectionsTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Paragraph 1 Description</label>
                  <textarea
                    rows="3"
                    value={homeTexts.collectionsDesc1}
                    onChange={(e) => setHomeTexts({ ...homeTexts, collectionsDesc1: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2] resize-none"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Paragraph 2 Description</label>
                  <textarea
                    rows="3"
                    value={homeTexts.collectionsDesc2}
                    onChange={(e) => setHomeTexts({ ...homeTexts, collectionsDesc2: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2] resize-none"
                  />
                </div>
                
                {/* Left Column Image */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Left Column Image</label>
                  <div className="aspect-video max-w-sm rounded-xl overflow-hidden border border-slate-100 bg-slate-50 mb-2">
                    {homeTexts.collectionsImage ? (
                      <img
                        loading="lazy"
                        src={getImageUrl(homeTexts.collectionsImage)}
                        className="w-full h-full object-cover"
                        alt="Collections section image preview"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
                        <Upload size={28} className="mb-2" />
                        <p className="font-semibold">No saved image yet</p>
                        <p className="text-xs mt-1">Upload one to show it on the homepage</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    {homeTexts.collectionsImage ? "Saved in MongoDB and shown on the homepage." : "No collections image saved yet."}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const { fileUrl: url } = await uploadFileToBackend(file);
                        setHomeTexts({ ...homeTexts, collectionsImage: url });
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                  />
                </div>

                {/* Right Column Video */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Right Column Video (Logo Motion)</label>
                  <div className="aspect-video max-w-sm rounded-xl overflow-hidden border border-slate-100 bg-black mb-2">
                    {homeTexts.collectionsVideo ? (
                      <video
                        key={homeTexts.collectionsVideo}
                        src={getImageUrl(homeTexts.collectionsVideo)}
                        muted
                        loop
                        playsInline
                        autoPlay
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-white/60 gap-3">
                        <Film size={40} className="opacity-40" />
                        <p className="font-semibold text-white/80 text-sm">No saved collections video yet</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    {homeTexts.collectionsVideo ? "Saved in MongoDB and shown on the homepage." : "No collections video saved yet."}
                  </p>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      try {
                        const { fileUrl: url } = await uploadFileToBackend(file);
                        const updatedHomeTexts = { ...homeTexts, collectionsVideo: url };
                        setHomeTexts(updatedHomeTexts);
                        await persistHomePage({ homeTexts: updatedHomeTexts });
                        toast.success('Why FLAIS video saved successfully!');
                      } catch (error) {
                        toast.error(error?.response?.data?.message || error?.message || 'Failed to save video');
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Marquee Section */}
            <div className="border-b border-slate-100 pb-6 space-y-4">
              <h3 className="text-md font-bold text-slate-700">Logo Marquee Section</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Section Title</label>
                <input
                  type="text"
                  value={homeTexts.marqueeTitle}
                  onChange={(e) => setHomeTexts({ ...homeTexts, marqueeTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                />
              </div>
            </div>

            {/* Sustainability Section */}
            <div className="border-b border-slate-100 pb-6 space-y-4">
              <h3 className="text-md font-bold text-slate-700">Sustainability Section</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section Title</label>
                  <input
                    type="text"
                    value={homeTexts.sustainabilityTitle}
                    onChange={(e) => setHomeTexts({ ...homeTexts, sustainabilityTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section Description</label>
                  <textarea
                    rows="3"
                    value={homeTexts.sustainabilityDesc}
                    onChange={(e) => setHomeTexts({ ...homeTexts, sustainabilityDesc: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2] resize-none"
                  />
                </div>
                <div className="md:col-span-2 space-y-3">
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section Image</label>
                  <div className="aspect-video max-w-md rounded-xl overflow-hidden border border-slate-100 bg-slate-50">
                    {homeTexts.sustainabilityImage ? (
                      <img
                        loading="lazy"
                        src={getImageUrl(homeTexts.sustainabilityImage)}
                        className="w-full h-full object-cover"
                        alt="Sustainability section preview"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
                        <Upload size={28} className="mb-2" />
                        <p className="font-semibold">No saved image yet</p>
                        <p className="text-xs mt-1">Upload one to show it on the homepage</p>
                      </div>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-2">
                    {homeTexts.sustainabilityImage ? "Saved in MongoDB and shown on the homepage." : "No sustainability image saved yet."}
                  </p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const { fileUrl: url } = await uploadFileToBackend(file);
                        setHomeTexts({ ...homeTexts, sustainabilityImage: url });
                      }
                    }}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100"
                  />
                </div>
              </div>
            </div>

            {/* Blog Section */}
            <div className="space-y-4">
              <h3 className="text-md font-bold text-slate-700">Blog Section</h3>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Blog Header Title (Use \n for new line)</label>
                <input
                  type="text"
                  value={homeTexts.blogTitle}
                  onChange={(e) => setHomeTexts({ ...homeTexts, blogTitle: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs focus:outline-none focus:border-[#0145F2]"
                />
              </div>
            </div>
          </form>
        </div>
      )}

      {activeTab === 'blog' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-800">"Our Blog" / Inspiration Section</h2>
              <p className="text-xs text-slate-400 mt-0.5">{blogs.length} published article{blogs.length === 1 ? '' : 's'} shown in the "Our Blog" section on the homepage.</p>
            </div>
            <button 
              onClick={() => { setIsAddingBlog(!isAddingBlog); setBlogImage(null); setBlogForm({ title: '', textColor: '#ffffff', content: '' }); }}
              className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 shadow-sm"
            >
              {isAddingBlog ? <X size={18} /> : <Plus size={18} />} {isAddingBlog ? 'Cancel' : 'Add Article'}
            </button>
          </div>

          {isAddingBlog && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h3 className="text-md font-bold mb-4 text-slate-800">Add New Article</h3>
              <form onSubmit={handleAddBlog} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-700">Article Title</label>
                    <input 
                      type="text" 
                      required 
                      value={blogForm.title} 
                      onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} 
                      className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="e.g. 9mm vs 15mm Full Body Tiles" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-700">Header Title Text Color</label>
                    <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-xl border border-slate-200">
                      <input 
                        type="color" 
                        value={blogForm.textColor} 
                        onChange={(e) => setBlogForm({ ...blogForm, textColor: e.target.value })} 
                        className="w-8 h-8 rounded border border-slate-300 cursor-pointer" 
                      />
                      <span className="text-xs font-mono text-slate-500 uppercase">{blogForm.textColor}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Cover Image</label>
                  <input 
                    type="file" 
                    required 
                    accept="image/*" 
                    onChange={(e) => setBlogImage(e.target.files[0])} 
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 file:hover:bg-blue-100" 
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1 text-slate-700">Content</label>
                  <textarea 
                    required 
                    rows="6" 
                    value={blogForm.content} 
                    onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} 
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                    placeholder="Write your article details here..."
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={isSubmittingBlog}
                    className="bg-[#0145F2] text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 text-xs disabled:opacity-50"
                  >
                    {isSubmittingBlog ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                    Save Article
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">
            {blogsLoading ? (
              <div className="p-10 text-center">
                <Loader2 className="animate-spin mx-auto text-blue-500" size={32} />
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                    <th className="px-6 py-4">Preview</th>
                    <th className="px-6 py-4">Title</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {blogs.length === 0 && (
                    <tr>
                      <td colSpan="4" className="p-6 text-center text-slate-500 text-sm">
                        No articles published yet. Publish one using the "Add Article" button.
                      </td>
                    </tr>
                  )}
                  {blogs.map((blog, idx) => (
                    <tr key={blog._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-[#0145F2]/10 text-[#0145F2] text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {idx + 1}
                          </span>
                          <img 
                            loading="lazy" 
                            src={getImageUrl(blog.image)} 
                            className="h-14 w-20 rounded-xl object-cover border border-slate-100" 
                            alt={blog.title} 
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-900 text-sm">
                        {blog.title}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(blog.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDeleteBlog(blog._id)} 
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Article"
                        >
                          <Trash2 size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};

export default AdminHome;
