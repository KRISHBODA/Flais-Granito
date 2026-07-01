import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  ChevronRight, 
  Crown, 
  Layers, 
  Compass, 
  RotateCw, 
  Calculator, 
  MapPin, 
  Info, 
  ChevronLeft 
} from 'lucide-react';
import SEO from '../components/SEO';
import api from '../utils/api';

const ProductDetails = () => {
  const { id } = useParams();
  const { data: product, isLoading: loading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const res = await api.get(`/products/${id}`);
      return res.data.product;
    },
    enabled: !!id,
  });

  const loadError = isError ? 'Failed to load product details.' : '';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  // Dynamic spec extraction from title / description
  const getProductSpecs = () => {
    if (!product) {
      return { size: 'N/A', finish: 'N/A', color: 'N/A', thickness: 'N/A', application: '' };
    }

    return {
      size: product.size || 'N/A',
      finish: product.finishes || product.finish || 'N/A',
      color: product.color || 'N/A',
      thickness: product.thickness || 'N/A',
      application: product.application || '',
    };
  };

  const { size, finish, color, thickness, application } = getProductSpecs();

  if (loading) {
    return (
      <div className="pt-40 pb-24 text-center min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#5D4037]"></div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="pt-40 pb-24 text-center min-h-screen flex items-center justify-center">
        <div className="max-w-md rounded-3xl border border-zinc-200 bg-zinc-50 p-8 text-zinc-600">
          <h2 className="text-2xl font-bold text-zinc-900">Product unavailable</h2>
          <p className="mt-3 text-sm">{loadError}</p>
          <Link to="/products" className="text-[#5D4037] hover:underline mt-4 block">Back to products</Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-40 pb-24 text-center min-h-screen">
        <h2 className="text-2xl font-bold">Product not found</h2>
        <Link to="/products" className="text-[#5D4037] hover:underline mt-4 block">Back to products</Link>
      </div>
    );
  }

  const allImages = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title || product.name,
    "image": allImages,
    "description": product.description || 'Premium quality tile from Flais Granito.',
    "brand": {
      "@type": "Brand",
      "name": "FLAIS GRANITO"
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "INR",
      "price": product.price || "0",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-white text-zinc-950">
      <SEO 
        title={product.title || product.name}
        description={product.description || `Premium quality ${product.category || ''} tile from Flais Granito.`}
        keywords={`flais granito, ${product.title || product.name}, ${product.category || 'tiles'}, premium vitrified tile, Porcelain Slabs, Large Format Slabs, ${product.size || ''} Porcelain Slabs, ${product.finishes || product.finish || ''} Porcelain Slabs`}
        image={allImages[0]}
        schema={productSchema}
      />
      
      <div className="container-custom py-12 max-w-7xl">
        {/* Top Header Row with Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 pb-4 mb-8">
          <nav className="flex items-center space-x-2 text-xs uppercase tracking-widest text-zinc-500 font-medium">
            <Link to="/" className="hover:text-zinc-950 transition-colors">Home</Link>
            <ChevronRight size={12} className="text-zinc-300" />
            <Link to="/products" className="hover:text-zinc-950 transition-colors">Product</Link>
            <ChevronRight size={12} className="text-zinc-300" />
            <span className="text-zinc-900 font-semibold">{product.title || product.name}</span>
          </nav>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-start">
          {/* Left: Image Carousel */}
          <div className="relative aspect-[4/3] md:aspect-[1.1] w-full rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 shadow-md group">
            {allImages.length > 0 ? (
              <img 
                src={allImages[currentImageIndex]} 
                alt={product.title || product.name} 
                loading="lazy" 
                className="w-full h-full object-cover transition-all duration-500" 
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-center px-6 bg-zinc-50 text-zinc-400">
                <div>
                  <p className="font-semibold text-zinc-600">No product image available</p>
                  <p className="mt-1 text-sm">This product has not been assigned any images yet.</p>
                </div>
              </div>
            )}
            {allImages.length > 1 && (
              <>
                <button 
                  onClick={prevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-zinc-700 hover:bg-white hover:scale-105 transition-all active:scale-95 z-10"
                >
                  <ChevronLeft size={20} />
                </button>
                <button 
                  onClick={nextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 shadow-md flex items-center justify-center text-zinc-700 hover:bg-white hover:scale-105 transition-all active:scale-95 z-10"
                >
                  <ChevronRight size={20} />
                </button>
                {/* Carousel Indicator Dots */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentImageIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        currentImageIndex === i ? 'bg-[#5D4037] w-4' : 'bg-white/60'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right: Premium Information Panel */}
            <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-zinc-900 tracking-tight">
                {product.title || product.name}
              </h1>
              
              {/* Material and Type Subheaders */}
              <div className="flex flex-wrap items-center gap-3 text-zinc-500">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
                  <Layers size={14} className="text-[#C0A060]" />
                  {(product.application || "WALL TILE - FLOOR TILE").toUpperCase()}
                </span>
              </div>
            </div>

            {/* Sizes, Finishes, Thickness, Color Specification Grid */}
            <div className="border-y border-zinc-200 py-5 grid grid-cols-2 gap-y-4 gap-x-4">
              <div className="border-r border-zinc-200 pr-4">
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Sizes
                </span>
                <span className="text-zinc-800 font-bold text-sm">
                  {size}
                </span>
              </div>
              <div className="pl-6">
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Finishes
                </span>
                <span className="text-zinc-800 font-bold text-sm">
                  {finish}
                </span>
              </div>
              <div className="border-t border-r border-zinc-200 pt-4 pr-4">
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Thickness
                </span>
                <span className="text-zinc-800 font-bold text-sm">
                  {thickness}
                </span>
              </div>
              <div className="border-t border-zinc-200 pt-4 pl-6">
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Color
                </span>
                <span className="text-zinc-800 font-bold text-sm">
                  {color}
                </span>
              </div>
              {application && (
                <>
                  <div className="border-t border-r border-zinc-200 pt-4 pr-4">
                    <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                      Application
                    </span>
                    <span className="text-zinc-800 font-bold text-sm">
                      {application}
                    </span>
                  </div>
                  <div className="border-t border-zinc-200 pt-4 pl-6">
                    {/* Empty cell to balance the grid */}
                  </div>
                </>
              )}
            </div>

            {/* Experience Our Tools Section */}
            <div className="space-y-4">
              <span className="block text-xs font-bold uppercase tracking-widest text-[#C0A060]">
                Experience Our Tools
              </span>
              <div className="flex flex-wrap gap-x-8 gap-y-6 items-center">
                <Link to="/calculator" className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-full border border-[#C0A060] flex items-center justify-center text-[#C0A060] group-hover:bg-[#C0A060] group-hover:text-white transition-all shadow-sm">
                    <RotateCw size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-600 tracking-wider">360° VIEW</span>
                </Link>
                
                <Link to="/calculator" className="flex items-center gap-3 group">
                  <div className="w-12 h-12 rounded-full border border-[#C0A060] flex items-center justify-center text-[#C0A060] group-hover:bg-[#C0A060] group-hover:text-white transition-all shadow-sm">
                    <Calculator size={18} />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-600 tracking-wider">TILE CALCULATOR</span>
                </Link>
              </div>
            </div>

            {/* Actions: Where to Buy Button */}
            <div className="pt-2">
              <Link
                to="/where-to-buy"
                className="w-full sm:w-auto px-8 py-4 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg font-bold flex items-center justify-center gap-2.5 transition-colors uppercase tracking-wider text-xs shadow-md active:scale-98"
              >
                <span>Where To Buy</span>
                <MapPin size={15} />
              </Link>
            </div>

            {/* Best Results Advisory Note */}
            <div className="flex items-start gap-2.5 text-[11px] text-zinc-500 bg-zinc-50 p-4 rounded-xl border border-zinc-100 leading-relaxed">
              <Info size={15} className="text-zinc-400 shrink-0 mt-0.5" />
              <span>
                FOR BEST RESULTS, USE GRESBOND <strong className="text-zinc-700 font-bold">VX-1</strong>, <strong className="text-zinc-700 font-bold">VX-2</strong> FOR INTERNAL USE AND <strong className="text-zinc-700 font-bold">EX-5</strong> FOR EXTERNAL USE.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
