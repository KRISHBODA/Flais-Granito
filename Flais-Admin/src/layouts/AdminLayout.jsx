import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar.jsx';
import Navbar from '../components/Navbar.jsx';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        if (!token) return navigate('/admin/login');
        
        const BackendUrl = import.meta.env.VITE_BACKEND_URL;
        const res = await axios.get(`${BackendUrl}/api/admin/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.data.success) {
          if (res.data.isActive === false) {
            localStorage.removeItem('adminToken');
            localStorage.removeItem('adminData');
            navigate('/admin/login');
            return;
          }
          const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
          
          // Check if anything actually changed to avoid unnecessary re-renders
          const oldPerms = JSON.stringify(adminData.permissions || []);
          const newPerms = JSON.stringify(res.data.permissions || []);
          
          if (adminData.role !== res.data.role || oldPerms !== newPerms) {
             adminData.role = res.data.role;
             adminData.permissions = res.data.permissions || [];
             localStorage.setItem('adminData', JSON.stringify(adminData));
             setProfileLoaded(prev => !prev);
          }
        }
      } catch (err) {
        console.error("Failed to fetch admin profile", err);
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
           if (err.response.data && err.response.data.requirePasswordChange) {
             navigate('/admin/change-password');
           } else {
             localStorage.removeItem('adminToken');
             localStorage.removeItem('adminData');
             navigate('/admin/login');
           }
        }
      }
    };
    fetchProfile();
  }, [navigate, location.pathname]);

  return (
    <div className="flex h-screen bg-[#EDF1F5] text-slate-800">
      <Toaster position="top-right" />
      
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Navbar */}
        <Navbar setSidebarOpen={setSidebarOpen} />

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default AdminLayout;
