import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import axios from 'axios';

const EditBlog = () => {
  const { id } = useParams(); // Grabs '6a00cafeb6502880d9901f36' from URL
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const BackendUrl = import.meta.env.VITE_BACKEND_URL;

  // 1. Fetch the specific blog data when the page loads
  useEffect(() => {
    const fetchBlogDetails = async () => {
      try {
        const response = await axios.get(`${BackendUrl}/api/blogs/${id}`);
        const { title, content, textColor } = response.data.blog;
        setTitle(title);
        setContent(content);
        if (textColor) setTextColor(textColor);
      } catch (error) {
        alert("Could not load the article.");
        navigate('/admin/blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogDetails();
  }, [id, navigate]);

  // 2. Handle the Update submission
  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      formData.append('title', title);
      formData.append('textColor', textColor);
      formData.append('content', content);
      if (image) {
        formData.append('image', image);
      }

      await axios.put(`${BackendUrl}/api/blogs/${id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert("Article updated successfully!");
      navigate('/admin/blogs');
    } catch (error) {
      alert("Failed to update article.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/admin/blogs')}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft size={18} /> Back to Management
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Edit Article</h1>
          <p className="text-slate-500">Modify your content and save changes.</p>
        </header>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Article Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Header Title Text Color</label>
            <div className="flex flex-wrap items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              {[
                { name: 'White', hex: '#ffffff' },
                { name: 'Charcoal/Black', hex: '#1a1a1a' },
                { name: 'Beige', hex: '#c5a880' },
              ].map((color) => (
                <button
                  key={color.hex}
                  type="button"
                  onClick={() => setTextColor(color.hex)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                    textColor === color.hex
                      ? 'border-[#0145F2] bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className="w-4 h-4 rounded-full border border-slate-300"
                    style={{ backgroundColor: color.hex }}
                  />
                  {color.name}
                </button>
              ))}
              <div className="h-6 w-px bg-slate-200 hidden sm:block" />
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer"
                />
                <span className="text-xs font-mono text-slate-500 uppercase">{textColor}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-slate-700">Update Cover Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Content</label>
            <textarea
              required
              rows="12"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin/blogs')}
              className="px-6 py-3 font-semibold text-slate-600 hover:text-slate-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="flex items-center gap-2 rounded-lg bg-[#0145F2] px-6 py-3 font-semibold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50 transition-all active:scale-95"
            >
              {updating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlog;