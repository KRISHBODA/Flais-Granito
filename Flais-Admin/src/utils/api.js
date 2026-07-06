import axios from 'axios';

const api = axios.create({
  baseURL: `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').trim()}/api`,
  withCredentials: false,
  timeout: 120000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('adminToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('adminToken');
      if (typeof window !== 'undefined' && window.location.pathname.startsWith('/admin')) {
        window.location.replace('/admin/login');
      }
    }
    return Promise.reject(error);
  }
);

export const getImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('blob:') || url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const backendUrl = (import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').trim().replace(/\/$/, '');
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  
  if (cleanUrl.startsWith('media/') || cleanUrl.startsWith('uploads/')) {
    return `${backendUrl}/${cleanUrl}`;
  }
  return `${backendUrl}/media/${cleanUrl}`;
};

export default api;
