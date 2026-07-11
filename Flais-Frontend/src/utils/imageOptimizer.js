/**
 * Utility functions to resolve media URLs (images and videos) to local storage.
 */

const getStorageUrl = () => {
  if (import.meta.env.VITE_STORAGE_URL) {
    return import.meta.env.VITE_STORAGE_URL.trim().replace(/\/$/, '');
  }
  const envUrl = import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.trim().replace(/\/$/, '') : '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const runtimeUrl = hostname && hostname !== 'localhost' && hostname !== '127.0.0.1'
    ? `http://${hostname}:8000`
    : 'http://localhost:8000';

  let backendUrl = 'http://localhost:8000';
  if (!envUrl) {
    backendUrl = runtimeUrl;
  } else if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
    backendUrl = runtimeUrl;
  } else {
    backendUrl = envUrl;
  }

  return `${backendUrl}/media`;
};

export const getOptimizedImageUrl = (url) => {
  if (!url) return '';
  
  let cleanPath = url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      let pathname = parsed.pathname;
      if (pathname.startsWith('/media/')) {
        cleanPath = pathname.substring(7);
      } else if (pathname.startsWith('/uploads/')) {
        cleanPath = pathname.substring(9);
      } else if (pathname.startsWith('/')) {
        cleanPath = pathname.substring(1);
      }
    } catch (e) {
      cleanPath = url;
    }
  }
  
  return `${getStorageUrl()}/${cleanPath.replace(/^\//, '')}`;
};

/**
 * Resolves local relative paths to full storage URLs for videos, or returns absolute URLs as-is.
 * 
 * @param {string} url - The original video URL or relative path.
 * @returns {string} - The resolved URL.
 */
export const getOptimizedVideoUrl = (url) => {
  return getOptimizedImageUrl(url);
};
