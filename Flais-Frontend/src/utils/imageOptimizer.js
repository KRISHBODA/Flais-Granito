/**
 * Utility functions to resolve media URLs (images and videos) to local storage.
 */

const getStorageUrl = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  // Prefer the current site origin for production hosts so media loads
  // same-origin when the frontend is served from www / apex variants.
  if (origin && hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${origin}/media`;
  }

  if (import.meta.env.VITE_STORAGE_URL) {
    return import.meta.env.VITE_STORAGE_URL.trim().replace(/\/$/, '');
  }
  const envUrl = import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.trim().replace(/\/$/, '') : '';
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

const stripMediaPrefix = (pathname) => {
  if (!pathname) return '';
  if (pathname.startsWith('/media/')) {
    return pathname.substring(7);
  }
  if (pathname.startsWith('/uploads/')) {
    return pathname.substring(9);
  }
  return pathname.replace(/^\/+/, '');
};

export const isLocalMediaUrl = (url) => {
  if (!url) return false;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    // Relative path is always local media
    return true;
  }
  try {
    const parsed = new URL(url);
    if (
      parsed.hostname === 'localhost' ||
      parsed.hostname === '127.0.0.1' ||
      parsed.pathname.startsWith('/media/') ||
      parsed.pathname.startsWith('/uploads/')
    ) {
      return true;
    }
  } catch (e) {
    // Ignore
  }
  return false;
};

export const getRelativeMediaPath = (url) => {
  if (!url) return '';

  if (url.startsWith('http://') || url.startsWith('https://')) {
    try {
      const parsed = new URL(url);
      return stripMediaPrefix(parsed.pathname);
    } catch (e) {
      return url.replace(/^\/+/, '');
    }
  }

  return stripMediaPrefix(url);
};

export const resolveMediaUrl = (url) => {
  if (!url) return '';
  if (!isLocalMediaUrl(url)) {
    return url;
  }

  return `${getStorageUrl()}/${getRelativeMediaPath(url)}`;
};

export const getOptimizedImageUrl = (url) => {
  if (!url) return '';
  if (!isLocalMediaUrl(url)) {
    return url;
  }

  return resolveMediaUrl(url);
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
