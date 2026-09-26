import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import AdminLayout from '../layouts/AdminLayout.jsx';
import { jwtDecode } from 'jwt-decode';

// Lazy load pages
const Login = lazy(() => import('../pages/Login.jsx'));
const ProductsList = lazy(() => import('../pages/ProductsList.jsx'));
const AddProduct = lazy(() => import('../pages/AddProduct.jsx'));
const EditProduct = lazy(() => import('../pages/EditProduct.jsx'));
const Categories = lazy(() => import('../pages/Categories.jsx'));
const Messages = lazy(() => import('../pages/Messages.jsx'));
const Blogs = lazy(() => import('../pages/Blogs.jsx'));
const Settings = lazy(() => import('../pages/Settings.jsx'));
const AddBlog = lazy(() => import('../pages/AddBlog.jsx'));
const EditBlog = lazy(() => import('../pages/EditBlog.jsx'));
const AdminHome = lazy(() => import('../pages/AdminHome.jsx'));
const AdminCatalog = lazy(() => import('../pages/AdminCatalog.jsx'));
const AdminWhyFlais = lazy(() => import('../pages/AdminWhyFlais.jsx'));
const AdminFlaisPark = lazy(() => import('../pages/AdminFlaisPark.jsx'));
const AdminAchievement = lazy(() => import('../pages/AdminAchievement.jsx'));
const Analytics = lazy(() => import('../pages/Analytics.jsx'));
const WebsiteFileManager = lazy(() => import('../pages/WebsiteFileManager.jsx'));
const ChangePassword = lazy(() => import('../pages/ChangePassword.jsx'));
const AdminUsers = lazy(() => import('../pages/AdminUsers.jsx'));

// Loading Spinner Component
const Loading = () => (
  <div className="flex h-screen w-full items-center justify-center bg-[#EDF1F5]">
    <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#0145F2] border-t-transparent"></div>
  </div>
);

// --- PROTECTED ROUTE COMPONENT ---
const ProtectedRoute = () => {
  const token = localStorage.getItem('adminToken');
  
  if (!token) {
    return <Navigate to="/admin/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTime = Date.now() / 1000; // in seconds

    // Check if current time is past the expiration time
    if (decoded.exp < currentTime) {
      localStorage.removeItem('adminToken');
      return <Navigate to="/admin/login" replace />;
    }
  } catch (error) {
    // If token is malformed/invalid
    localStorage.removeItem('adminToken');
    return <Navigate to="/admin/login" replace />;
  }

  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  if (adminData.requirePasswordChange) {
    return <Navigate to="/admin/change-password" replace />;
  }

  return <Outlet />;
};

// --- UNAUTHORIZED COMPONENT ---
const Unauthorized = () => (
  <div className="flex h-[80vh] w-full flex-col items-center justify-center">
    <h2 className="text-3xl font-bold text-slate-800">Access Denied</h2>
    <p className="text-slate-600 mt-2">You don't have permission to view this page.</p>
  </div>
);

// --- PERMISSION GUARD ---
const PermissionGuard = ({ permission, children }) => {
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  const role = adminData.role;
  const permissions = adminData.permissions || [];
  
  if (role === 'superadmin' || permissions.includes(permission)) {
    return children;
  }
  
  return <Unauthorized />;
};

// --- SUPER ADMIN GUARD ---
const SuperAdminGuard = ({ children }) => {
  const adminData = JSON.parse(localStorage.getItem('adminData') || '{}');
  if (adminData.role === 'superadmin') {
    return children;
  }
  return <Unauthorized />;
};

const AdminRoutes = () => {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Public Admin Route */}
        <Route path="/admin/login" element={<Login />} />
        <Route path="/login" element={<Navigate to="/admin/login" replace />} />

        {/* PROTECTED ROUTES GROUP */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/home" replace />} />
            <Route path="products" element={<PermissionGuard permission="collection"><ProductsList /></PermissionGuard>} />
            <Route path="products/add" element={<PermissionGuard permission="collection"><AddProduct /></PermissionGuard>} />
            <Route path="products/edit/:id" element={<PermissionGuard permission="collection"><EditProduct /></PermissionGuard>} />
            <Route path="categories" element={<PermissionGuard permission="collection"><Categories /></PermissionGuard>} />
            <Route path="messages" element={<PermissionGuard permission="contact"><Messages /></PermissionGuard>} />
            <Route path="blogs" element={<PermissionGuard permission="blog"><Blogs /></PermissionGuard>} />
            <Route path="settings" element={<PermissionGuard permission="settings"><Settings /></PermissionGuard>} />
            <Route path="blogs/add" element={<PermissionGuard permission="blog"><AddBlog /></PermissionGuard>} />
            <Route path="blogs/edit/:id" element={<PermissionGuard permission="blog"><EditBlog /></PermissionGuard>} />
            <Route path="home" element={<PermissionGuard permission="home"><AdminHome /></PermissionGuard>} />
            <Route path="why-flais" element={<PermissionGuard permission="why-flais"><AdminWhyFlais /></PermissionGuard>} />
            <Route path="catalog" element={<PermissionGuard permission="catalog"><AdminCatalog /></PermissionGuard>} />
            <Route path="analytics" element={<PermissionGuard permission="analytics"><Analytics /></PermissionGuard>} />
            <Route path="website-files" element={<PermissionGuard permission="website-files"><WebsiteFileManager /></PermissionGuard>} />
            <Route path="flais-park" element={<PermissionGuard permission="flais-park"><AdminFlaisPark /></PermissionGuard>} />
            <Route path="achievement" element={<PermissionGuard permission="achievement"><AdminAchievement /></PermissionGuard>} />
            <Route path="users" element={<SuperAdminGuard><AdminUsers /></SuperAdminGuard>} />
          </Route>
        </Route>

        <Route path="/admin/change-password" element={<ChangePassword />} />

        {/* Catch all - Redirect unknown paths to login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
