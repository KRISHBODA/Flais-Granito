import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Loader2, Plus, Edit, Trash2, KeyRound } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin',
    permissions: [],
    isActive: true
  });
  
  const [tempPassword, setTempPassword] = useState('');

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
    { id: 'website-files', label: 'Website Files' }
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
    setTempPassword('');
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
      } else {
        const res = await axiosInstance.post(`${BackendUrl}/api/admin/users`, formData);
        setTempPassword(res.data.tempPassword);
        toast.success('User created successfully');
      }
      fetchUsers();
      if (editingUser) {
        setIsModalOpen(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    }
  };

  const handleResetPassword = async (id) => {
    if (!window.confirm("Are you sure you want to reset this user's password?")) return;
    try {
      const res = await axiosInstance.post(`${BackendUrl}/api/admin/users/${id}/reset-password`);
      setTempPassword(res.data.tempPassword);
      toast.success('Password reset successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    }
  };

  if (loading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-[#0145F2]" size={32} /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Admin Users</h1>
        <button
          onClick={() => openModal()}
          className="flex items-center gap-2 rounded-xl bg-[#0145F2] px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
        >
          <Plus size={18} /> Add User
        </button>
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
              {users.map(user => (
                <tr key={user._id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4 capitalize">{user.role}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openModal(user)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleResetPassword(user._id)} className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg" title="Reset Password">
                        <KeyRound size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-slate-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h3 className="text-lg font-semibold text-slate-800">
                {editingUser ? 'Edit User' : 'Create User'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">×</button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {tempPassword && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 mb-4">
                  <p className="font-semibold text-sm mb-1">Temporary Password Generated</p>
                  <p className="text-lg font-mono bg-white inline-block px-3 py-1 rounded border border-yellow-300">
                    {tempPassword}
                  </p>
                  <p className="text-xs mt-2 opacity-80">Please share this securely with the user. They will be forced to change it on their first login.</p>
                </div>
              )}
              
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
                    disabled={!!editingUser}
                    value={formData.email}
                    onChange={e => setFormData({...formData, email: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2 focus:border-[#0145F2] outline-none disabled:bg-slate-50 disabled:text-slate-400"
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
    </div>
  );
};

export default AdminUsers;
