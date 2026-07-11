import axios from 'axios';

const getBackendBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.trim().replace(/\/$/, '') : '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const runtimeUrl = hostname && hostname !== 'localhost' && hostname !== '127.0.0.1'
    ? `http://${hostname}:8000`
    : 'http://localhost:8000';

  if (!envUrl) {
    return runtimeUrl;
  }

  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
    return runtimeUrl;
  }

  return envUrl;
};

const backendUrl = getBackendBaseUrl();

const api = axios.create({
  baseURL: `${backendUrl}/api`,
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
  
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  
  if (cleanUrl.startsWith('media/') || cleanUrl.startsWith('uploads/')) {
    return `${backendUrl}/${cleanUrl}`;
  }
  return `${backendUrl}/media/${cleanUrl}`;
};

export default api;
