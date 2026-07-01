import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';

const AddBlog = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const BackendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append('title', title);
    formData.append('textColor', textColor);
    formData.append('content', content);
    if (image) formData.append('image', image);

    try {
      const token = localStorage.getItem('adminToken');
      await axios.post(`${BackendUrl}/api/blogs`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      alert("Blog published!");
      navigate('/admin/blogs');
    } catch (error) {
      alert("Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/admin/blogs')} className="flex items-center gap-2 text-slate-500 hover:text-slate-800">
        <ArrowLeft size={18} /> Back to List
      </button>

      <div className="bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">New Article</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">Cover Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Title</label>
            <input
              type="text" required value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Header Title Text Color</label>
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

          <div>
            <label className="block text-sm font-semibold mb-2">Content</label>
            <textarea
              required rows="10" value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-3 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0145F2] py-4 font-bold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Send size={18} /> {loading ? "Publishing..." : "Publish Blog"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddBlog;