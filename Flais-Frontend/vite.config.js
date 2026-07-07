import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  server: {
    // Security headers in development
        allowedHosts: [
      'metathetical-desiringly-korey.ngrok-free.dev'
    ],
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    },
    cors: {
      origin: process.env.VITE_BACKEND_URL || 'http://localhost:8000',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    },
    // Serve WASM with correct MIME type
    mimetype: {
      wasm: 'application/wasm'
    }
  },
  build: {
    // Security optimizations for production build
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    sourcemap: false, // Disable source maps in production
    rollupOptions: {
      output: {
        // Prevent external source exposure
        sourcemap: false,
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('framer-motion') || id.includes('lenis')) {
              return 'vendor-motion';
            }
            if (id.includes('swiper')) {
              return 'vendor-swiper';
            }
            if (id.includes('pdfjs-dist') || id.includes('react-pdf') || id.includes('page-flip')) {
              return 'vendor-pdf';
            }
            if (id.includes('recharts') || id.includes('d3')) {
              return 'vendor-charts';
            }
            return 'vendor-others';
          }
        }
      }
    }
  }
})

