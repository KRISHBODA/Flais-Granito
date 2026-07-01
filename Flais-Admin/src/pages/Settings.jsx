import React, { useState, useEffect } from 'react';
import { Mail, Lock, Save, ShieldCheck, Loader2, Phone, MapPin } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Settings = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingFooter, setSavingFooter] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Footer settings state
  const [footerSettings, setFooterSettings] = useState({
    phone1: '+91 95867 33300',
    phone2: '+91 98983 04831',
    email: 'info@flaisgranito.com',
    address: 'Survey No. 151/pl, Unchi Mandal, Halvad Highway, Gujarat 363642, India.'
  });

  const BackendUrl = import.meta.env.VITE_BACKEND_URL;

  // Load profile settings & footer settings
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const res = await axios.get(`${BackendUrl}/api/admin/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setEmail(res.data.email);
      } catch (err) {
        toast.error("Failed to load profile settings.");
      }
    };
    
    const fetchFooterSettings = async () => {
      try {
        const res = await axios.get(`${BackendUrl}/api/settings`);
        if (res.data.success && res.data.settings) {
          setFooterSettings(res.data.settings);
        }
      } catch (err) {
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
    fetchFooterSettings();
  }, [BackendUrl]);

  const handleSave = async (e) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
      return toast.error('Passwords do not match!');
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      await axios.put(`${BackendUrl}/api/admin/profile`, {
        email,
        password: password || undefined // Only send if not empty
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('Credentials updated successfully!');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveFooter = async (e) => {
    e.preventDefault();
    setSavingFooter(true);
    try {
      const token = localStorage.getItem('adminToken');
      const res = await axios.put(`${BackendUrl}/api/settings`, footerSettings, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.data.success) {
        toast.success('Footer contact details saved successfully!');
      }
    } catch (err) {
      toast.error('Failed to save footer details to database');
    } finally {
      setSavingFooter(false);
    }
  };

  if (fetching) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Account settings section */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Account Security & General Settings</h1>
        <p className="text-slate-500">Configure administrative credentials and footer info details.</p>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <ShieldCheck size={20} className="text-[#0145F2]" /> Account Credentials
        </h2>
        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#0145F2]">
              <Mail size={18} />
              <h3 className="font-bold text-sm text-slate-700">Email Address</h3>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Email</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#0145F2] focus:outline-none transition-all"
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[#0145F2]">
              <Lock size={18} />
              <h3 className="font-bold text-sm text-slate-700">Change Password</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#0145F2] focus:outline-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Confirm Password</label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-[#0145F2] focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0145F2] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-70"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {loading ? 'Updating...' : 'Update Credentials'}
            </button>
          </div>
        </form>
      </div>

      {/* Footer info settings section */}
      <div className="rounded-2xl bg-white p-6 shadow-sm md:p-8">
        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Phone size={20} className="text-[#0145F2]" /> Footer Contact Details
        </h2>
        <p className="text-xs text-slate-400 mb-6">These numbers, emails, and address values are visible in the website footer.</p>

        <form onSubmit={handleSaveFooter} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Primary Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={16} /></span>
                <input 
                  type="text" 
                  required
                  value={footerSettings.phone1}
                  onChange={(e) => setFooterSettings({ ...footerSettings, phone1: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-2.5 text-sm focus:border-[#0145F2] focus:outline-none transition-all"
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-600">Secondary Phone Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Phone size={16} /></span>
                <input 
                  type="text" 
                  value={footerSettings.phone2}
                  onChange={(e) => setFooterSettings({ ...footerSettings, phone2: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-2.5 text-sm focus:border-[#0145F2] focus:outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Contact Email</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><Mail size={16} /></span>
              <input 
                type="email" 
                required
                value={footerSettings.email}
                onChange={(e) => setFooterSettings({ ...footerSettings, email: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-2.5 text-sm focus:border-[#0145F2] focus:outline-none transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-600">Factory Address</label>
            <div className="relative">
              <span className="absolute left-4 top-4 text-slate-400"><MapPin size={16} /></span>
              <textarea 
                rows="3"
                required
                value={footerSettings.address}
                onChange={(e) => setFooterSettings({ ...footerSettings, address: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-2.5 text-sm focus:border-[#0145F2] focus:outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="pt-2">
            <button 
              type="submit"
              disabled={savingFooter}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0145F2] px-6 py-3 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-700 disabled:opacity-70"
            >
              {savingFooter ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {savingFooter ? 'Saving Footer...' : 'Save Footer Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
