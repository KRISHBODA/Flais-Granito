/**
 * Utility functions to resolve media URLs (images and videos) to local storage.
 */

const getStorageUrl = () => {
  if (import.meta.env.VITE_STORAGE_URL) {
    return import.meta.env.VITE_STORAGE_URL.trim().replace(/\/$/, '');
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `http://${hostname}:8000/media`;
  }
  return 'http://localhost:8000/media';
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
