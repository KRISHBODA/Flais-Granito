import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2, ShieldCheck, Key } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [loginState, setLoginState] = useState('LOGIN_FORM'); // LOGIN_FORM, SETUP_2FA, VERIFY_2FA
  const [challengeToken, setChallengeToken] = useState(null);
  
  // 2FA Setup state
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [manualSecret, setManualSecret] = useState('');
  const [totpCode, setTotpCode] = useState('');
  
  // Recovery state
  const [useRecovery, setUseRecovery] = useState(false);
  const [recoveryCode, setRecoveryCode] = useState('');
  const [generatedRecoveryCodes, setGeneratedRecoveryCodes] = useState([]);

  const navigate = useNavigate();
  const BackendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

  const saveAuthAndRedirect = (data) => {
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('adminData', JSON.stringify({
      email: data.email,
      role: data.role,
      permissions: data.permissions || [],
      requirePasswordChange: data.requirePasswordChange
    }));
    
    if (data.requirePasswordChange) {
      navigate('/admin/change-password');
    } else {
      navigate('/admin/home');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(`${BackendUrl}/api/admin/login`, {
        email,
        password,
      });

      if (response.data.requires2FASetup) {
        setChallengeToken(response.data.challengeToken);
        await initiate2FASetup(response.data.challengeToken);
        setLoginState('SETUP_2FA');
      } else if (response.data.requires2FA) {
        setChallengeToken(response.data.challengeToken);
        setLoginState('VERIFY_2FA');
      } else if (response.data.success) {
        toast.success('Login successful!');
        saveAuthAndRedirect(response.data);
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Connection failed";
      toast.error("Login Error: " + errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const initiate2FASetup = async (token) => {
    try {
      const response = await axios.post(`${BackendUrl}/api/admin/2fa/setup`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setQrCodeDataUrl(response.data.qrCodeDataUrl);
        setManualSecret(response.data.manualSecret);
      }
    } catch (error) {
      toast.error("Failed to initiate 2FA setup");
      setLoginState('LOGIN_FORM');
    }
  };

  const handleVerifySetup = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${BackendUrl}/api/admin/2fa/verify-setup`, 
        { token: totpCode },
        { headers: { Authorization: `Bearer ${challengeToken}` } }
      );
      if (response.data.success) {
        toast.success('2FA Setup successful!');
        setGeneratedRecoveryCodes(response.data.recoveryCodes);
        // We do not immediately redirect so user can copy recovery codes
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid setup code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (useRecovery) {
        const response = await axios.post(`${BackendUrl}/api/admin/2fa/recover`, 
          { recoveryCode },
          { headers: { Authorization: `Bearer ${challengeToken}` } }
        );
        if (response.data.success) {
          toast.success('Login successful via recovery code!');
          saveAuthAndRedirect(response.data);
        }
      } else {
        const response = await axios.post(`${BackendUrl}/api/admin/2fa/verify`, 
          { token: totpCode },
          { headers: { Authorization: `Bearer ${challengeToken}` } }
        );
        if (response.data.success) {
          toast.success('Login successful!');
          saveAuthAndRedirect(response.data);
        }
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueAfterRecoveryCodes = () => {
    // Assuming backend returns normal token in setup response too, we need it.
    // Actually we can just fetch it from the previous response or force a re-login.
    // Let's reset to LOGIN_FORM and force them to login again for simplicity, 
    // OR we can save the token in state during verifySetup.
    // Since we didn't save it in state, forcing a re-login is safest.
    toast.success("Please login again with your new 2FA setup.");
    setLoginState('LOGIN_FORM');
    setTotpCode('');
    setGeneratedRecoveryCodes([]);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#EDF1F5] px-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100">
        <div className="bg-[#0145F2] px-8 py-10 text-center text-white">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-4">
            {loginState === 'LOGIN_FORM' ? <span className="text-3xl font-bold">F</span> : <ShieldCheck size={32} />}
          </div>
          <h1 className="text-2xl font-bold">Flais Granito</h1>
          <p className="mt-2 text-blue-100">
            {loginState === 'LOGIN_FORM' ? 'Admin Control Panel' : 'Two-Factor Authentication'}
          </p>
        </div>

        {loginState === 'LOGIN_FORM' && (
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
                    placeholder="Enter email"
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
                {isLoading ? <><Loader2 className="mr-2 animate-spin" size={18} />Authenticating...</> : 'Sign In'}
              </button>
            </div>
          </form>
        )}

        {loginState === 'SETUP_2FA' && (
          <div className="p-8">
            {generatedRecoveryCodes.length > 0 ? (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl text-yellow-800 text-sm">
                  <p className="font-bold mb-2">Save your recovery codes!</p>
                  <p>These codes will only be shown once. Keep them in a safe place. You can use them to access your account if you lose your authenticator app.</p>
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                  {generatedRecoveryCodes.map((code, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-2 text-center rounded">{code}</div>
                  ))}
                </div>
                <button
                  onClick={handleContinueAfterRecoveryCodes}
                  className="w-full bg-[#0145F2] text-white rounded-xl py-3 font-semibold mt-4"
                >
                  I have saved them. Continue.
                </button>
              </div>
            ) : (
              <form onSubmit={handleVerifySetup} className="space-y-6">
                <div className="text-center">
                  <p className="text-sm text-slate-600 mb-4">
                    Protect your Super Admin account using an authenticator app.
                  </p>
                  <ol className="text-xs text-slate-500 text-left list-decimal list-inside space-y-1 mb-4">
                    <li>Open your authenticator app.</li>
                    <li>Scan the QR code below.</li>
                    <li>Enter the 6-digit code generated by the app.</li>
                  </ol>
                  {qrCodeDataUrl && <img src={qrCodeDataUrl} alt="QR Code" className="mx-auto w-40 h-40 border p-2 rounded-xl mb-2" />}
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700 text-center">6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-center text-xl font-mono tracking-widest focus:border-[#0145F2] outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || totpCode.length !== 6}
                  className="flex w-full items-center justify-center rounded-xl bg-[#0145F2] py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isLoading ? <><Loader2 className="mr-2 animate-spin" size={18} />Verifying...</> : 'Verify & Enable 2FA'}
                </button>
              </form>
            )}
          </div>
        )}

        {loginState === 'VERIFY_2FA' && (
          <form onSubmit={handleVerify2FA} className="p-8">
            <div className="space-y-6">
              <p className="text-sm text-slate-600 text-center">
                {useRecovery 
                  ? "Enter one of your 8-character recovery codes."
                  : "Enter the 6-digit verification code from your authenticator app."}
              </p>

              <div>
                <input
                  type="text"
                  required
                  maxLength={useRecovery ? 8 : 6}
                  value={useRecovery ? recoveryCode : totpCode}
                  onChange={(e) => {
                    if (useRecovery) {
                      setRecoveryCode(e.target.value.trim().toLowerCase());
                    } else {
                      setTotpCode(e.target.value.replace(/\D/g, ''));
                    }
                  }}
                  placeholder={useRecovery ? "xxxxxxxx" : "000000"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 text-center text-xl font-mono tracking-widest focus:border-[#0145F2] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || (useRecovery ? recoveryCode.length < 8 : totpCode.length !== 6)}
                className="flex w-full items-center justify-center rounded-xl bg-[#0145F2] py-4 text-sm font-bold text-white shadow-lg transition-all hover:bg-blue-700 disabled:bg-blue-300"
              >
                {isLoading ? <><Loader2 className="mr-2 animate-spin" size={18} />Verifying...</> : 'Verify'}
              </button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => setUseRecovery(!useRecovery)}
                  className="text-xs text-[#0145F2] font-semibold hover:underline"
                >
                  {useRecovery ? "Use Authenticator App Instead" : "Use a Recovery Code"}
                </button>
              </div>
            </div>
          </form>
        )}

        <div className="pb-8">
          <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest">
            &copy; 2026 Flais Granito Admin
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
