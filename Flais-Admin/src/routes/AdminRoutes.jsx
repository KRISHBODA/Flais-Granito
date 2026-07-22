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

  return <Outlet />;
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
            <Route path="products" element={<ProductsList />} />
            <Route path="products/add" element={<AddProduct />} />
            <Route path="products/edit/:id" element={<EditProduct />} />
            <Route path="categories" element={<Categories />} />
            <Route path="messages" element={<Messages />} />
            <Route path="blogs" element={<Blogs />} />
            <Route path="settings" element={<Settings />} />
            <Route path="blogs/add" element={<AddBlog />} />
            <Route path="blogs/edit/:id" element={<EditBlog />} />
            <Route path="home" element={<AdminHome />} />
            <Route path="why-flais" element={<AdminWhyFlais />} />
            <Route path="catalog" element={<AdminCatalog />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="flais-park" element={<AdminFlaisPark />} />
            <Route path="achievement" element={<AdminAchievement />} />
          </Route>
        </Route>

        {/* Catch all - Redirect unknown paths to login */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AdminRoutes;
