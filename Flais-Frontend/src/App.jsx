import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Helper to wrap lazy imports and catch chunk loading / network errors (e.g. after new deployments)
const lazyWithRetry = (componentImport) => {
  return lazy(async () => {
    const hasReloadedKey = 'chunk-load-has-reloaded';
    try {
      return await componentImport();
    } catch (error) {
      const isChunkLoadFailed = error.name === 'ChunkLoadError' || 
                                error.message?.includes('Failed to fetch dynamically imported module') ||
                                error.message?.includes('Importing a module script failed');
      
      const hasReloaded = sessionStorage.getItem(hasReloadedKey);

      if (isChunkLoadFailed && !hasReloaded) {
        sessionStorage.setItem(hasReloadedKey, 'true');
        window.location.reload();
        // Return a pending promise to keep the suspense boundary active while reloading
        return new Promise(() => {});
      }
      
      throw error;
    }
  });
};

// Pages
import Home from './pages/Home';
const About = lazyWithRetry(() => import('./pages/About'));
const Products = lazyWithRetry(() => import('./pages/Products'));
const ProductDetails = lazyWithRetry(() => import('./pages/ProductDetails'));
const Catalog = lazyWithRetry(() => import('./pages/Catalog'));
const CatalogViewer = lazyWithRetry(() => import('./pages/CatalogViewer'));
const Blog = lazyWithRetry(() => import('./pages/Blog'));
const BlogDetails = lazyWithRetry(() => import('./pages/BlogDetails'));
const Contact = lazyWithRetry(() => import('./pages/Contact'));
const WhereToBuy = lazyWithRetry(() => import('./pages/WhereToBuy'));

import SmoothScroll from './components/SmoothScroll';
import Preloader from './components/Preloader';

const Certifications = lazyWithRetry(() => import('./pages/Certifications'));
const InstallationGuide = lazyWithRetry(() => import('./pages/InstallationGuide'));
const TileCalculator = lazyWithRetry(() => import('./pages/TileCalculator'));

import ComingSoon from './pages/ComingSoon';

const appStatus = import.meta.env.VITE_APP_STATUS || "LIVE";

function App() {
  React.useEffect(() => {
    sessionStorage.removeItem('chunk-load-has-reloaded');
  }, []);

  if (appStatus === "COMING_SOON") {
    return <ComingSoon />;
  }

  // App rendering
  return (
    <ErrorBoundary>
      <Router>
        <Preloader />
        <SmoothScroll>
          <Layout>
            <Suspense fallback={
              <div className="w-full h-screen flex flex-col items-center justify-center bg-white px-6">
                <div className="flex flex-col items-center space-y-4">
                  <div className="relative w-14 h-14">
                    <div className="absolute inset-0 rounded-full border-4 border-[#5D4037]/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#5D4037] border-l-[#c5a880] animate-spin" />
                  </div>
                  <p className="text-xs sm:text-sm font-sans font-medium tracking-[0.2em] text-[#5D4037]/80 uppercase animate-pulse">
                    Loading Flais Granito
                  </p>
                </div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetails />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/catalog/view" element={<CatalogViewer />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:id" element={<BlogDetails />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/where-to-buy" element={<WhereToBuy />} />
                <Route path="/certifications" element={<Certifications />} />
                <Route path="/installation-guide" element={<InstallationGuide />} />
                <Route path="/calculator" element={<TileCalculator />} />
              </Routes>
            </Suspense>
          </Layout>
        </SmoothScroll>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
