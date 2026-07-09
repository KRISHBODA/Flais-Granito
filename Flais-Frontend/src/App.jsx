import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';

// Pages
import Home from './pages/Home';
const About = lazy(() => import('./pages/About'));
const Products = lazy(() => import('./pages/Products'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Catalog = lazy(() => import('./pages/Catalog'));
const CatalogViewer = lazy(() => import('./pages/CatalogViewer'));
const Blog = lazy(() => import('./pages/Blog'));
const BlogDetails = lazy(() => import('./pages/BlogDetails'));
const Contact = lazy(() => import('./pages/Contact'));
const WhereToBuy = lazy(() => import('./pages/WhereToBuy'));

import SmoothScroll from './components/SmoothScroll';
import Preloader from './components/Preloader';

const Certifications = lazy(() => import('./pages/Certifications'));
const InstallationGuide = lazy(() => import('./pages/InstallationGuide'));
const TileCalculator = lazy(() => import('./pages/TileCalculator'));

function App() {
  // App rendering
  return (
    <ErrorBoundary>
      <Router>
        <Preloader />
        <SmoothScroll>
          <Layout>
            <Suspense fallback={
              <div className="w-full h-screen flex flex-col items-center justify-center bg-[#f8f5f0] px-6">
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
