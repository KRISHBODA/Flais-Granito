import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const BackendUrl = import.meta.env.VITE_BACKEND_URL;

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${BackendUrl}/api/admin/login`, {
        email,
        password,
      });

      if (response.data.success) {
        toast.success('Login successful!');
        
        // Save token for auth
        localStorage.setItem('adminToken', response.data.token);
        
        navigate('/admin/dashboard');
      }
    } catch (error) {
      // FIX: Ensure we extract the string message to avoid crash
      const errorMsg = error.response?.data?.message || "Connection failed";
      alert("Login Error: " + errorMsg);
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
            <span className="text-3xl font-bold">F</span>
          </div>
          <h1 className="text-2xl font-bold">Flais Granito</h1>
          <p className="mt-2 text-blue-100">Admin Control Panel</p>
        </div>

        <form onSubmit={handleLogin} className="p-8">
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@flais.com"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm transition-all focus:border-[#0145F2] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Lock size={18} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
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

            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center rounded-xl bg-[#0145F2] py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 animate-spin" size={18} />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>
          <p className="mt-8 text-center text-[10px] text-slate-400 uppercase tracking-widest">
            &copy; 2026 Flais Granito Dashboard
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
