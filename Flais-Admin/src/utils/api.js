import axios from 'axios';

const getBackendBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.trim().replace(/\/$/, '') : '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'http';
  const runtimeUrl = hostname && hostname !== 'localhost' && hostname !== '127.0.0.1'
    ? `${protocol}://${hostname}:8000`
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
  if (url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'http';
  const isProduction = hostname && hostname !== 'localhost' && hostname !== '127.0.0.1';
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      
      // Ensure protocol matches current page protocol
      parsed.protocol = protocol + ':';
      
      // Rewrite localhost / 127.0.0.1 URLs if we are on a remote domain/IP
      if (
        isProduction &&
        (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1')
      ) {
        parsed.hostname = hostname;
        // Only add port 8000 for staging IP, not for production domains with HTTPS
        if (hostname === '187.127.179.251') {
          parsed.port = '8000';
        } else {
          parsed.port = '';
        }
        return parsed.toString();
      }
      
      // If the URL hostname is the staging IP address but doesn't have a port, 
      // append the port 8000 because nginx doesn't proxy media requests.
      if (parsed.hostname === '187.127.179.251' && !parsed.port) {
        parsed.port = '8000';
        return parsed.toString();
      }
      
      return parsed.toString();
    } catch (e) {
      return url;
    }
  }
  
  const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
  
  // Resolve base URL for media (ensure it has port 8000 on staging/remote hosts)
  let resolvedBaseUrl = backendUrl;
  
  // Ensure the protocol matches current page
  if (resolvedBaseUrl.startsWith('http://') && protocol === 'https') {
    resolvedBaseUrl = resolvedBaseUrl.replace('http://', 'https://');
  } else if (resolvedBaseUrl.startsWith('https://') && protocol === 'http') {
    resolvedBaseUrl = resolvedBaseUrl.replace('https://', 'http://');
  }
  
  // For production HTTPS, don't add port 8000 - let nginx reverse proxy handle it
  if (isProduction && protocol === 'https') {
    // Just use the hostname without port for production HTTPS
    try {
      const parsed = new URL(resolvedBaseUrl);
      parsed.hostname = hostname;
      parsed.port = '';
      resolvedBaseUrl = parsed.toString().replace(/\/$/, '');
    } catch (e) {
      // Fallback: strip port from URL manually
      resolvedBaseUrl = resolvedBaseUrl.replace(/:8000/, '').replace(/\/$/, '');
    }
  } else if (resolvedBaseUrl.includes('187.127.179.251') && !resolvedBaseUrl.includes(':8000') && !resolvedBaseUrl.includes(':80')) {
    resolvedBaseUrl = resolvedBaseUrl.replace('187.127.179.251', '187.127.179.251:8000');
  } else if (hostname === '187.127.179.251' && !resolvedBaseUrl.includes(':8000') && !resolvedBaseUrl.includes(':80')) {
    if (resolvedBaseUrl.startsWith('http://') || resolvedBaseUrl.startsWith('https://')) {
      try {
        const parsed = new URL(resolvedBaseUrl);
        parsed.port = '8000';
        resolvedBaseUrl = parsed.toString().replace(/\/$/, '');
      } catch (e) {}
    }
  }
  
  if (cleanUrl.startsWith('media/') || cleanUrl.startsWith('uploads/')) {
    return `${resolvedBaseUrl}/${cleanUrl}`;
  }
  
  // Strip any trailing /media from resolvedBaseUrl if we are appending /media/
  const baseNoMedia = resolvedBaseUrl.endsWith('/media') ? resolvedBaseUrl.slice(0, -6) : resolvedBaseUrl;
  return `${baseNoMedia}/media/${cleanUrl}`;
};

export default api;
