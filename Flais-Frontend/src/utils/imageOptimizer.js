/**
 * Utility functions to optimize media URLs (images and videos) for better web performance,
 * particularly for mobile devices.
 */

/**
 * Optimizes Cloudinary image URLs by injecting automatic formatting, compression, and width adjustments.
 * 
 * @param {string} url - The original image URL.
 * @param {number|string} [width] - The desired width to resize the image to.
 * @returns {string} - The optimized URL.
 */
export const getOptimizedImageUrl = (url, width) => {
  if (!url) return '';
  
  // Verify it is a Cloudinary URL
  if (url.includes('cloudinary.com') && url.includes('/image/upload/')) {
    // Avoid double transforming if already present
    if (!url.includes('/f_auto') && !url.includes('/q_auto')) {
      const transform = width ? `f_auto,q_auto,w_${width}` : 'f_auto,q_auto';
      return url.replace('/image/upload/', `/image/upload/${transform}/`);
    }
  }
  return url;
};

/**
 * Optimizes Cloudinary video URLs by injecting automatic formatting and quality compression.
 * 
 * @param {string} url - The original video URL.
 * @returns {string} - The optimized URL.
 */
export const getOptimizedVideoUrl = (url) => {
  if (!url) return '';
  
  if (url.includes('cloudinary.com') && url.includes('/video/upload/')) {
    if (!url.includes('/f_auto') && !url.includes('/q_auto')) {
      return url.replace('/video/upload/', '/video/upload/f_auto,q_auto/');
    }
  }
  return url;
};
