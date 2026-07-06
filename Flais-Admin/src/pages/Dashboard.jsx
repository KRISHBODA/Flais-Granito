import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Package, 
  Layers, 
  BookOpen,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Loader2
} from 'lucide-react';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import api, { getImageUrl } from '../utils/api';

// Keeping visitor chart as dummy for now as per your request
const visitorChartData = [
  { name: 'Mon', visitors: 400 },
  { name: 'Tue', visitors: 700 },
  { name: 'Wed', visitors: 500 },
  { name: 'Thu', visitors: 900 },
  { name: 'Fri', visitors: 1100 },
  { name: 'Sat', visitors: 800 },
  { name: 'Sun', visitors: 1000 },
];

  const Dashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    activeCatalog: 0,
    totalCategories: 0,
    totalBlogs: 0,
    totalEnquiries: 0,
    recentProducts: [],
    recentBlogs: [],
    recentMessages: []
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get('/dashboard/stats');

        setData({
          activeCatalog: res.data.stats.activeCatalog || 0,
          totalCategories: res.data.stats.totalCategories || 0,
          totalBlogs: res.data.stats.totalBlogs || 0,
          totalEnquiries: res.data.stats.totalEnquiries || 0,
          recentProducts: res.data.recentData.recentProducts || [],
          recentBlogs: res.data.recentData.recentBlogs || [],
          recentMessages: res.data.recentData.recentMessages || []
        });
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] w-full flex-col items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mb-2" size={32} />
        <p>Loading Dashboard Stats...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500">Welcome back, Admin! Real-time stats from your inventory and customer engagements.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Products Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Catalog</p>
              <h3 className="mt-1 text-3xl font-bold text-slate-900">{data.activeCatalog}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-200">
              <Package size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-blue-500">
            <ArrowUpRight size={16} className="mr-1" />
            <span className="font-medium">Active Catalog</span>
          </div>
        </div>

        {/* Total Categories Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Categories</p>
              <h3 className="mt-1 text-3xl font-bold text-slate-900">{data.totalCategories}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500 text-white shadow-lg shadow-purple-200">
              <Layers size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-purple-500">
            <TrendingUp size={16} className="mr-1" />
            <span className="font-medium">Design Series</span>
          </div>
        </div>

        {/* Total Blogs Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Blogs</p>
              <h3 className="mt-1 text-3xl font-bold text-slate-900">{data.totalBlogs}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-200">
              <BookOpen size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-emerald-500">
            <ArrowUpRight size={16} className="mr-1" />
            <span className="font-medium">Published Articles</span>
          </div>
        </div>

        {/* Total Inquiries Card */}
        <div className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm transition-all hover:shadow-md border border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Inquiries</p>
              <h3 className="mt-1 text-3xl font-bold text-slate-900">{data.totalEnquiries}</h3>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-200">
              <MessageSquare size={24} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-amber-500">
            <TrendingUp size={16} className="mr-1" />
            <span className="font-medium">Customer Messages</span>
          </div>
        </div>
      </div>

      {/* Visitor Analytics Section (Dummy) */}
      <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900">Website Visitor Analysis</h3>
          <p className="text-sm text-slate-500">Engagement trends for the current week.</p>
        </div>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={visitorChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="visitors" 
                stroke="#8b5cf6" 
                strokeWidth={4} 
                dot={{ fill: '#8b5cf6', strokeWidth: 2, r: 4, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Products Table */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900">Recently Added Products</h3>
              <button 
                onClick={() => navigate('/admin/products')}
                className="text-sm font-semibold text-[#0145F2] hover:underline"
              >
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-4">Product</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Stock</th>
                    <th className="px-6 py-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.recentProducts.slice(0, 5).map((product) => (
                    <tr key={product._id} className="transition-colors hover:bg-slate-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img loading="lazy" 
                            src={getImageUrl(product.images?.[0]) || 'https://via.placeholder.com/40'} 
                            alt={product.title} 
                            className="h-10 w-10 rounded-lg object-cover bg-slate-100" 
                          />
                          <span className="font-medium text-slate-900 truncate max-w-[120px]">{product.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">{product.category}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{product.stock}</td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          product.stock > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {data.recentProducts.length === 0 && (
                    <tr>
                      <td colSpan="4" className="py-10 text-center text-slate-400">No products found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Recent Inquiries List */}
        <div className="rounded-2xl bg-white shadow-sm overflow-hidden border border-slate-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-900">Recent Inquiries</h3>
              <button 
                onClick={() => navigate('/admin/messages')}
                className="text-sm font-semibold text-[#0145F2] hover:underline"
              >
                View All
              </button>
            </div>
            <div className="p-6 divide-y divide-slate-100">
              {data.recentMessages.slice(0, 5).map((message) => (
                <div key={message._id} className="py-4 first:pt-0 last:pb-0 flex items-start gap-4">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    message.isRead ? 'bg-slate-100 text-slate-600' : 'bg-blue-50 text-blue-600 border border-blue-100'
                  }`}>
                    {message.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-slate-900 truncate">{message.name}</p>
                      <span className="text-xs text-slate-400">
                        {new Date(message.createdAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate">{message.email}</p>
                    <p className="text-sm text-slate-600 mt-1 line-clamp-1 italic">"{message.message}"</p>
                  </div>
                </div>
              ))}
              {data.recentMessages.length === 0 && (
                <div className="py-10 text-center text-slate-400">No contact messages found.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
