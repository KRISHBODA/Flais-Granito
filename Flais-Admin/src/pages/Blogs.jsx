import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, FileText, Loader2 } from 'lucide-react';
import axios from 'axios';

const Blogs = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
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
    
    return `${getBackendBaseUrl()}/media/${cleanPath.replace(/^\//, '')}`;
  };

  const BackendUrl = import.meta.env.VITE_BACKEND_URL;

  const fetchBlogs = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.get(`${BackendUrl}/api/blogs`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setBlogs(res.data.blogs);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBlogs(); }, []);

  const deleteBlog = async (id) => {
    if (window.confirm("Delete this article?")) {
      try {
        const token = localStorage.getItem('adminToken');
        await axios.delete(`${BackendUrl}/api/blogs/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setBlogs(blogs.filter(b => b._id !== id));
      } catch (err) {
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Blog Management</h1>
        <button 
          onClick={() => navigate('/admin/blogs/add')}
          className="bg-[#0145F2] text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={18} /> New Article
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-20 flex justify-center"><Loader2 className="animate-spin" /></div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
              <tr>
                <th className="p-6">Article</th>
                <th className="p-6">Date</th>
                <th className="p-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {blogs.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-12 text-center text-slate-400">
                    <FileText className="mx-auto mb-2 text-slate-300" size={36} />
                    <p className="font-medium text-sm">No articles published yet</p>
                    <p className="text-xs text-slate-400">Click "New Article" to create your first post.</p>
                  </td>
                </tr>
              ) : (
                blogs.map((blog) => (
                  <tr key={blog._id} className="hover:bg-slate-50">
                    <td className="p-6 flex items-center gap-4">
                      {blog.image ? (
                        <img loading="lazy" src={getImageUrl(blog.image)} className="w-12 h-12 rounded object-cover" alt="" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center text-slate-400">
                          <FileText size={20} />
                        </div>
                      )}
                      <span className="font-bold">{blog.title}</span>
                    </td>
                    <td className="p-6 text-slate-500">{new Date(blog.createdAt).toLocaleDateString()}</td>
                    <td className="p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => navigate(`/admin/blogs/edit/${blog._id}`)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg">
                          <FileText size={18} />
                        </button>
                        <button onClick={() => deleteBlog(blog._id)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Blogs;