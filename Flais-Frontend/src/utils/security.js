/**
 * Security Utilities
 * Provides functions for input validation, sanitization, and security best practices
 */

/**
 * Sanitize input string to prevent XSS attacks
 * Removes potentially dangerous HTML and JavaScript
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Validate phone number (basic international format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
  return phoneRegex.test(phone);
};

/**
 * Validate URL to prevent malicious redirects
 * Only allows http, https, and relative URLs
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL
 */
export const isValidUrl = (url) => {
  try {
    // Check for javascript: protocol and data: URIs
    if (url.toLowerCase().includes('javascript:') || url.toLowerCase().includes('data:')) {
      return false;
    }
    
    // Allow relative URLs
    if (url.startsWith('/') || url.startsWith('.')) {
      return true;
    }
    
    // Validate absolute URLs
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

/**
 * Remove HTML tags from string (for display purposes)
 * @param {string} html - HTML string to strip
 * @returns {string} Plain text
 */
export const stripHtmlTags = (html) => {
  if (typeof html !== 'string') return '';
  return html.replace(/<[^>]*>/g, '');
};

/**
 * Escape HTML special characters
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export const escapeHtml = (text) => {
  if (typeof text !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;'
  };
  
  return text.replace(/[&<>"'\/]/g, (char) => map[char]);
};

/**
 * Validate and sanitize object keys (prevent prototype pollution)
 * @param {Object} obj - Object to validate
 * @returns {Object} Clean object
 */
export const sanitizeObject = (obj) => {
  if (typeof obj !== 'object' || obj === null) return {};
  
  const dangerous = ['__proto__', 'constructor', 'prototype'];
  const cleaned = {};
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      if (!dangerous.includes(key)) {
        cleaned[key] = obj[key];
      }
    }
  }
  
  return cleaned;
};

/**
 * Generate CSRF token for forms
 * @returns {string} Random token
 */
export const generateCsrfToken = () => {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Get CSRF token from meta tag or session
 * @returns {string|null} CSRF token if available
 */
export const getCsrfToken = () => {
  const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  return token || sessionStorage.getItem('csrf-token');
};

/**
 * Validate CSRF token
 * @param {string} token - Token to validate
 * @returns {boolean} True if token is valid format
 */
export const isValidCsrfToken = (token) => {
  return /^[a-f0-9]{64}$/.test(token);
};

/**
 * Rate limit helper (client-side, for UX purposes)
 * Should be paired with server-side rate limiting
 * @param {string} key - Unique identifier for the action
 * @param {number} limit - Number of allowed actions
 * @param {number} windowMs - Time window in milliseconds
 * @returns {boolean} True if action is allowed
 */
export const checkRateLimit = (key, limit = 5, windowMs = 60000) => {
  const now = Date.now();
  const key_name = `ratelimit_${key}`;
  const stored = sessionStorage.getItem(key_name);
  
  let attempts = [];
  if (stored) {
    attempts = JSON.parse(stored).filter(timestamp => now - timestamp < windowMs);
  }
  
  if (attempts.length < limit) {
    attempts.push(now);
    sessionStorage.setItem(key_name, JSON.stringify(attempts));
    return true;
  }
  
  return false;
};

/**
 * Securely store sensitive data (uses sessionStorage by default)
 * @param {string} key - Storage key
 * @param {string} value - Value to store
 * @param {string} type - 'session' or 'local'
 */
export const secureStore = (key, value, type = 'session') => {
  const storage = type === 'session' ? sessionStorage : localStorage;
  storage.setItem(key, value);
};

/**
 * Securely retrieve stored data
 * @param {string} key - Storage key
 * @param {string} type - 'session' or 'local'
 * @returns {string|null} Stored value or null
 */
export const secureRetrieve = (key, type = 'session') => {
  const storage = type === 'session' ? sessionStorage : localStorage;
  return storage.getItem(key);
};

/**
 * Securely clear sensitive data
 * @param {string} key - Storage key (optional, clears all if not provided)
 * @param {string} type - 'session' or 'local'
 */
export const secureClear = (key, type = 'session') => {
  const storage = type === 'session' ? sessionStorage : localStorage;
  if (key) {
    storage.removeItem(key);
  } else {
    storage.clear();
  }
};

/**
 * Validate file upload (client-side check)
 * @param {File} file - File to validate
 * @param {Object} options - Validation options
 * @returns {Object} Validation result with isValid and error message
 */
export const validateFileUpload = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf']
  } = options;
  
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }
  
  if (file.size > maxSize) {
    return { isValid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type not allowed. Allowed: ${allowedTypes.join(', ')}` };
  }
  
  const extension = file.name.split('.').pop().toLowerCase();
  if (!allowedExtensions.includes(extension)) {
    return { isValid: false, error: `File extension not allowed. Allowed: ${allowedExtensions.join(', ')}` };
  }
  
  return { isValid: true, error: null };
};

/**
 * Detect and prevent common XSS patterns
 * @param {string} input - Input to check
 * @returns {boolean} True if suspicious content detected
 */
export const detectXssPatterns = (input) => {
  if (typeof input !== 'string') return false;
  
  const xssPatterns = [
    /<script[^>]*>.*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<img[^>]+src=[^>]*>/gi
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Hash a string using SHA-256 (for client-side verification only)
 * @param {string} message - String to hash
 * @returns {Promise<string>} Hex-encoded hash
 */
export const hashString = async (message) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Generate a secure random string
 * @param {number} length - Length of string to generate
 * @returns {string} Random string
 */
export const generateRandomString = (length = 32) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(randomValues)
    .map(x => characters[x % characters.length])
    .join('');
};

/**
 * Log security events for monitoring
 * @param {string} eventType - Type of security event
 * @param {Object} details - Event details
 */
export const logSecurityEvent = (eventType, details = {}) => {
  if (process.env.NODE_ENV === 'production') {
    // Send to monitoring service in production
        
    // Example: Send to backend monitoring
    // fetch('/api/security/events', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ type: eventType, ...details, timestamp: new Date() })
    // }).catch(err => );
  } else {
      }
};

export default {
  sanitizeInput,
  isValidEmail,
  isValidPhone,
  isValidUrl,
  stripHtmlTags,
  escapeHtml,
  sanitizeObject,
  generateCsrfToken,
  getCsrfToken,
  isValidCsrfToken,
  checkRateLimit,
  secureStore,
  secureRetrieve,
  secureClear,
  validateFileUpload,
  detectXssPatterns,
  hashString,
  generateRandomString,
  logSecurityEvent
};
