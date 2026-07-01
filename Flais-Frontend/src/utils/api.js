import axios from 'axios';
import { logSecurityEvent } from './security';

const api = axios.create({
  baseURL: `${(import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000').trim()}/api`,
  timeout: 30000, // 30 second timeout
});

// Request interceptor: Add security headers for public website
api.interceptors.request.use(
  (config) => {
    // Log request in development
    if (process.env.NODE_ENV === 'development') {
      // API logs removed
    }

    // Add security headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest';
    config.headers['Content-Type'] = 'application/json';

    // Add CSRF token if available (for form submissions)
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
  },
  (error) => {
    logSecurityEvent('API_REQUEST_ERROR', { message: error.message });
        return Promise.reject(error);
  }
);

// Response interceptor: Handle errors gracefully
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development') {
      // API logs removed
    }
    return response;
  },
  (error) => {
    // Log error details
    const errorMsg = error.response?.data?.message || error.message || 'Unknown error';
    const status = error.response?.status || 'Network Error';
    
    
    // Handle 429 Too Many Requests - Rate limit exceeded
    if (error.response?.status === 429) {
      logSecurityEvent('RATE_LIMIT_EXCEEDED', { url: error.config?.url });
          }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
          }

    // Handle server errors (5xx)
    if (error.response?.status >= 500) {
      logSecurityEvent('SERVER_ERROR', { 
        status: error.response.status,
        url: error.config?.url 
      });
          }

    // Handle CORS errors
    if (error.code === 'ERR_NETWORK' && !error.response) {
      logSecurityEvent('CORS_OR_NETWORK_ERROR', { 
        message: error.message,
        url: error.config?.url 
      });
          }

    // Handle network errors
    if (!error.response) {
      logSecurityEvent('NETWORK_ERROR', { message: error.message });
          }

    return Promise.reject(error);
  }
);

export default api;

