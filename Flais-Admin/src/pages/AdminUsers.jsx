import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, Plus, Edit, KeyRound, Copy, Check, Eye, EyeOff, ShieldAlert, CheckCircle2, X } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin',
    permissions: [],
    isActive: true
  });
  
  // Dedicated state for password reset dialog
  const [resetModalUser, setResetModalUser] = useState(null);
  const [resetMode, setResetMode] = useState('auto'); // 'auto' | 'custom'
  const [customPassword, setCustomPassword] = useState('');
  const [showCustomPassword, setShowCustomPassword] = useState(false);
  const [reset2FA, setReset2FA] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Dedicated modal for showing newly created or reset credentials
  const [credentialsModal, setCredentialsModal] = useState(null);
  const [hasCopiedPassword, setHasCopiedPassword] = useState(false);
  const [hasCopiedAll, setHasCopiedAll] = useState(false);

  const availablePermissions = [
    { id: 'home', label: 'Home' },
    { id: 'why-flais', label: 'Why FLAIS' },
    { id: 'collection', label: 'Collection' },
    { id: 'flais-park', label: 'Flais Park' },
    { id: 'catalog', label: 'Catalog' },
    { id: 'achievement', label: 'Achievement' },
    { id: 'contact', label: 'Contact' },
    { id: 'blog', label: 'Blog' },
    { id: 'settings', label: 'Settings' },
    { id: 'analytics', label: 'Analytics' },
    { id: 'website-files', label: '360 Virtual View' }
  ];

  const BackendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');
  const token = localStorage.getItem('adminToken');
  const axiosInstance = axios.create({
    headers: { Authorization: `Bearer ${token}` }
  });

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get(`${BackendUrl}/api/admin/users`);
      setUsers(res.data.users || []);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = (user = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions || [],
        isActive: user.isActive
      });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'admin',
        permissions: [],
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const openResetModal = (user) => {
    setResetModalUser(user);
    setResetMode('auto');
    setCustomPassword('');
    setShowCustomPassword(false);
    setReset2FA(false);
  };

  const handlePermissionToggle = (permissionId) => {
    setFormData(prev => {
      const current = prev.permissions || [];
      if (current.includes(permissionId)) {
        return { ...prev, permissions: current.filter(p => p !== permissionId) };
      } else {
        return { ...prev, permissions: [...current, permissionId] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await axiosInstance.put(`${BackendUrl}/api/admin/users/${editingUser._id}`, formData);
        toast.success('User updated successfully');
        setIsModalOpen(false);
      } else {
        const res = await axiosInstance.post(`${BackendUrl}/api/admin/users`, formData);
        setIsModalOpen(false);
        // Show credentials popup so admin can copy the new password
        setCredentialsModal({
          title: 'User Created Successfully',
          name: res.data.user?.name || formData.name,
          email: res.data.user?.email || formData.email,
          tempPassword: res.data.tempPassword,
          isNewUser: true
        });
        setHasCopiedPassword(false);
        setHasCopiedAll(false);
      }
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetModalUser) return;

    if (resetMode === 'custom' && customPassword.trim().length < 8) {
      return toast.error('Custom password must be at least 8 characters long');
    }

    setIsResetting(true);
    try {
      const payload = {};
      if (resetMode === 'custom' && customPassword.trim()) {
        payload.customPassword = customPassword.trim();
      }
      if (reset2FA) {
        payload.reset2FA = true;
      }

      const res = await axiosInstance.post(`${BackendUrl}/api/admin/users/${resetModalUser._id}/reset-password`, payload);
      
      const returnedPassword = res.data.tempPassword || customPassword;
      setResetModalUser(null);

      // Open credentials display modal with the new password
      setCredentialsModal({
        title: 'Password Reset Successfully',
        name: resetModalUser.name,
        email: resetModalUser.email,
        tempPassword: returnedPassword,
        isNewUser: false
      });
      setHasCopiedPassword(false);
      setHasCopiedAll(false);

      toast.success('Password reset successfully');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setIsResetting(false);
    }
  };

  const copyToClipboard = async (text, type = 'pass') => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      if (type === 'pass') {
        setHasCopiedPassword(true);
        setTimeout(() => setHasCopiedPassword(false), 3000);
      } else {
        setHasCopiedAll(true);
        setTimeout(() => setHasCopiedAll(false), 3000);
      }
      toast.success('Copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const getFullCredentialsText = (modalData) => {
    const loginUrl = `${window.location.origin}/admin/login`;
    return `FLAIS Admin Access Credentials:\n\nName: ${modalData.name}\nEmail: ${modalData.email}\nPassword: ${modalData.tempPassword}\nLogin Portal: ${loginUrl}\n\nNote: For security reasons, you will be prompted to create your own permanent password upon logging in.`;
  };

  const filteredUsers = users.filter(user => {
    if (statusFilter === 'active') return user.isActive;
    if (statusFilter === 'disabled') return !user.isActive;
    return true;
  });

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-[#0145F2]" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Manage Users</h1>
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-[#0145F2]"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="disabled">Disabled</option>
          </select>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
          >
            <Plus size={18} /> Add User
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-slate-700">
              <tr>
                <th className="px-6 py-4 font-semibold">Name</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Role</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map(user => (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-800">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4 capitalize">{user.role}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit User">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => openResetModal(user)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Reset Password">
                        <KeyRound size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingUser ? 'Edit User' : 'Create User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-[#0145F2] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-[#0145F2] outline-none"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                  <select
                    value={formData.role}
                    onChange={e => setFormData({...formData, role: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-[#0145F2] outline-none"
                  >
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={e => setFormData({...formData, isActive: e.target.checked})}
                      className="w-4 h-4 rounded text-[#0145F2] focus:ring-[#0145F2]"
                    />
                    <label htmlFor="isActive" className="text-sm text-slate-600">Active Account</label>
                  </div>
                </div>
              </div>

              {formData.role === 'admin' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">Permissions</label>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {availablePermissions.map(perm => (
                      <label key={perm.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.permissions.includes(perm.id)}
                          onChange={() => handlePermissionToggle(perm.id)}
                          className="w-4 h-4 rounded text-[#0145F2] focus:ring-[#0145F2]"
                        />
                        <span className="text-sm text-slate-600">{perm.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#0145F2] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Save User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">Reset User Password</h3>
                  <p className="text-xs text-slate-500">{resetModalUser.name} ({resetModalUser.email})</p>
                </div>
              </div>
              <button 
                onClick={() => setResetModalUser(null)} 
                disabled={isResetting}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="p-6 space-y-5">
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-xs text-blue-900 space-y-1.5">
                <p className="font-semibold text-blue-800 flex items-center gap-1.5">
                  <ShieldAlert size={15} /> How Password Reset Works
                </p>
                <p className="text-blue-700 leading-relaxed">
                  For security, passwords in modern web platforms are encrypted using one-way cryptographic hashing and <strong>cannot be retrieved or viewed</strong>. 
                  Resetting will set a new password so your user can log in immediately.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Choose Reset Option</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setResetMode('auto')}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                      resetMode === 'auto'
                        ? 'border-[#0145F2] bg-blue-50/40 ring-1 ring-[#0145F2]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-semibold text-slate-800">Auto-Generate</span>
                    <span className="text-xs text-slate-500 mt-1">Generate a secure temporary password</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResetMode('custom')}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all ${
                      resetMode === 'custom'
                        ? 'border-[#0145F2] bg-blue-50/40 ring-1 ring-[#0145F2]'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-sm font-semibold text-slate-800">Set Custom Password</span>
                    <span className="text-xs text-slate-500 mt-1">Type a specific password for this user</span>
                  </button>
                </div>
              </div>

              {resetMode === 'custom' && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">New Password (min 8 characters)</label>
                  <div className="relative">
                    <input
                      type={showCustomPassword ? 'text' : 'password'}
                      required
                      value={customPassword}
                      onChange={(e) => setCustomPassword(e.target.value)}
                      placeholder="e.g. Flais@2026!"
                      className="w-full rounded-xl border border-slate-200 py-2.5 pl-4 pr-11 text-sm outline-none focus:border-[#0145F2]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCustomPassword(!showCustomPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-400 hover:text-slate-600"
                    >
                      {showCustomPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {resetModalUser.role === 'superadmin' && (
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="reset2FA"
                    checked={reset2FA}
                    onChange={(e) => setReset2FA(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0145F2] focus:ring-[#0145F2]"
                  />
                  <label htmlFor="reset2FA" className="text-xs text-slate-600 cursor-pointer">
                    Also reset 2FA Authenticator (Use if the user lost their 2FA device)
                  </label>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  disabled={isResetting}
                  className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isResetting}
                  className="flex items-center gap-2 rounded-xl bg-orange-600 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-700 disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} /> Resetting...
                    </>
                  ) : (
                    <>
                      <KeyRound size={16} /> Reset Password
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREDENTIALS SUCCESS DISPLAY MODAL */}
      {credentialsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="bg-emerald-600 px-6 py-6 text-white text-center relative">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-md mb-2">
                <CheckCircle2 size={30} />
              </div>
              <h3 className="text-lg font-bold">{credentialsModal.title}</h3>
              <p className="text-xs text-emerald-100 mt-1">
                {credentialsModal.isNewUser ? 'Account has been created successfully' : 'The user’s password has been updated in the database'}
              </p>
            </div>

            <div className="p-6 space-y-5">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-200 pb-2">
                  <span>User</span>
                  <span className="font-semibold text-slate-800">{credentialsModal.name}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-500 border-b border-slate-200 pb-2">
                  <span>Email</span>
                  <span className="font-semibold text-slate-800 font-mono">{credentialsModal.email}</span>
                </div>
                <div>
                  <div className="flex justify-between items-center text-xs text-slate-500 mb-1.5">
                    <span className="font-semibold text-slate-700">New Password</span>
                    <span className="text-[11px] text-emerald-600 font-medium">Ready to share</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-slate-200 bg-white px-3.5 py-2 font-mono text-base font-bold text-slate-900 tracking-wide select-all overflow-x-auto">
                      {credentialsModal.tempPassword}
                    </div>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(credentialsModal.tempPassword, 'pass')}
                      className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-2 text-xs font-medium text-white transition-colors hover:bg-black"
                    >
                      {hasCopiedPassword ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                      {hasCopiedPassword ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5 text-xs text-amber-900 leading-relaxed">
                <p className="font-semibold mb-0.5">⚠️ Important Instructions:</p>
                <p>
                  Copy and share these credentials securely with the user. 
                  When they log in at <span className="font-mono font-medium underline">/admin/login</span> with this password, 
                  the platform will automatically prompt them to choose their own personal password.
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => copyToClipboard(getFullCredentialsText(credentialsModal), 'all')}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  {hasCopiedAll ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  {hasCopiedAll ? 'Full Credentials Copied!' : 'Copy Full Login Details'}
                </button>

                <button
                  type="button"
                  onClick={() => setCredentialsModal(null)}
                  className="flex w-full items-center justify-center rounded-xl bg-[#0145F2] py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
