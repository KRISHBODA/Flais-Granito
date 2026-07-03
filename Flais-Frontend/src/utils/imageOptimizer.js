/**
 * Utility functions to resolve media URLs (images and videos) to local storage.
 */

const getStorageUrl = () => {
  const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/media';
  return baseUrl.replace(/\/$/, '');
};

export const getOptimizedImageUrl = (url) => {
  if (!url) return '';
  
  // Self-healing check for Hostinger VPS missing proxy on port 80
  if (url.startsWith('http://187.127.179.251/media/') || url.startsWith('http://187.127.179.251/uploads/')) {
    url = url.replace('http://187.127.179.251/', 'http://187.127.179.251:8000/');
  }
  
  // If it is already an absolute URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // Otherwise resolve relative to the local storage base URL
  return `${getStorageUrl()}/${url.replace(/^\//, '')}`;
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
