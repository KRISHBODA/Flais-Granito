import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ChangePassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const BackendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast.error("Passwords do not match");
    }

    if (password.length < 8) {
      return toast.error("Password must be at least 8 characters");
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.post(`${BackendUrl}/api/admin/change-password`, 
        { newPassword: password },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success('Password changed successfully!');
        
        // Remove the flag
        const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
        adminData.requirePasswordChange = false;
        localStorage.setItem('adminData', JSON.stringify(adminData));

        navigate('/admin/home');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to change password";
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EDF1F5] px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100">
        <div className="bg-[#0145F2] px-8 py-10 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold">Update Password</h1>
          <p className="mt-2 text-blue-100">You must change your password before continuing.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">New Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-12 text-sm transition-all focus:border-[#0145F2] outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Confirm Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm transition-all focus:border-[#0145F2] outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-xl bg-[#0145F2] py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Updating...
                </>
              ) : (
                'Change Password'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
