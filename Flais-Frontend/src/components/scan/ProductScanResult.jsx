import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircle2, 
  ArrowRight, 
  Calculator, 
  MapPin, 
  RotateCw, 
  RefreshCw, 
  Layers, 
  Sparkles, 
  Share2,
  Check
} from 'lucide-react';
import { getOptimizedImageUrl } from '../../utils/imageOptimizer';

const ProductScanResult = ({ product, onScanAnother }) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const rawImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : product.image ? [product.image] : [];
  
  const optimizedImages = rawImages.map(img => getOptimizedImageUrl(img, 800));
  const currentImage = optimizedImages[activeImageIndex] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=800&auto=format&fit=crop';

  const productCode = product.slug 
    ? `FG-${product.slug.toUpperCase()}` 
    : `FG-${(product._id || '').slice(-6).toUpperCase()}`;

  const handleShare = () => {
    const url = `${window.location.origin}/products/${product.slug || product._id}`;
    if (navigator.share) {
      navigator.share({
        title: `${product.title} | FLAIS Granito`,
        text: `View specifications for ${product.title} from FLAIS Granito`,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-3xl border border-zinc-200/90 shadow-xl overflow-hidden transition-all duration-500 animate-fade-in">
      {/* Verification Header Banner */}
      <div className="bg-[#FAF8F5] border-b border-[#D2C9B1]/40 px-6 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-700">
            <CheckCircle2 size={16} />
          </span>
          <span className="text-xs font-bold uppercase tracking-widest text-zinc-900">
            Verified Authentic FLAIS Granito Product
          </span>
        </div>

        <button
          type="button"
          onClick={handleShare}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5D4037] hover:text-[#4a332c] transition-colors cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-600" />
              <span className="text-emerald-600">Link Copied</span>
            </>
          ) : (
            <>
              <Share2 size={14} />
              <span>Share Product</span>
            </>
          )}
        </button>
      </div>

      {/* Main Product Presentation Grid */}
      <div className="grid md:grid-cols-12 gap-8 p-6 sm:p-8 lg:p-10">
        {/* Left: Product Image & Gallery */}
        <div className="md:col-span-5 flex flex-col space-y-4">
          <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200/70 shadow-sm group">
            <img
              src={currentImage}
              alt={product.title || product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Category Tag Overlay */}
            {product.category && (
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-[#5D4037] border border-zinc-200/60 shadow-xs">
                {product.category}
              </div>
            )}
          </div>

          {/* Image Thumbnails if multiple images exist */}
          {optimizedImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {optimizedImages.map((thumbUrl, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#5D4037] ring-1 ring-[#5D4037]'
                      : 'border-zinc-200 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={thumbUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Specifications */}
        <div className="md:col-span-7 flex flex-col justify-between space-y-6">
          <div>
            {/* Collection & Code */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {product.productCollection && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#C0A060] bg-[#C0A060]/10 px-2.5 py-0.5 rounded border border-[#C0A060]/20">
                  {product.productCollection}
                </span>
              )}
              <span className="text-xs font-mono font-medium text-zinc-400">
                {productCode}
              </span>
            </div>

            {/* Product Title */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-display font-bold text-zinc-900 tracking-tight mb-4">
              {product.title || product.name}
            </h2>

            {/* Description if present */}
            {product.description && (
              <p className="text-sm text-zinc-600 leading-relaxed mb-6 font-light line-clamp-3">
                {product.description}
              </p>
            )}

            {/* Specifications Matrix */}
            <div className="border-y border-zinc-100 py-4 grid grid-cols-2 gap-4">
              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                  Size
                </span>
                <span className="text-sm font-semibold text-zinc-900">
                  {product.size || 'N/A'}
                </span>
              </div>

              <div>
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                  Finish
                </span>
                <span className="text-sm font-semibold text-zinc-900">
                  {product.finishes || product.finish || 'Standard'}
                </span>
              </div>

              <div className="border-t border-zinc-100 pt-3">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                  Thickness
                </span>
                <span className="text-sm font-semibold text-zinc-900">
                  {product.thickness || 'N/A'}
                </span>
              </div>

              <div className="border-t border-zinc-100 pt-3">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                  Body Type / Color
                </span>
                <span className="text-sm font-semibold text-zinc-900">
                  {product.color || 'Standard'}
                </span>
              </div>

              <div className="border-t border-zinc-100 pt-3">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                  Application
                </span>
                <span className="text-sm font-semibold text-zinc-900 uppercase">
                  {product.application || 'Floor & Wall'}
                </span>
              </div>

              <div className="border-t border-zinc-100 pt-3">
                <span className="block text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">
                  Random Faces
                </span>
                <span className="text-sm font-semibold text-zinc-900">
                  {product.randoms ? `${product.randoms} Faces` : 'Uniform'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            {/* Primary Action: View Product Details */}
            <Link
              to={`/products/${product.slug || product._id}`}
              className="w-full py-4 bg-[#5D4037] hover:bg-[#4a332c] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>View Full Product Details</span>
              <ArrowRight size={15} />
            </Link>

            {/* Secondary Actions Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              <Link
                to="/calculator"
                className="py-3 px-3 rounded-xl bg-[#FAF8F5] hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 text-center"
              >
                <Calculator size={14} className="text-[#5D4037]" />
                <span>Tile Calculator</span>
              </Link>

              <Link
                to="/where-to-buy"
                className="py-3 px-3 rounded-xl bg-[#FAF8F5] hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 text-center"
              >
                <MapPin size={14} className="text-[#5D4037]" />
                <span>Find Showroom</span>
              </Link>

              {product.link360 ? (
                <a
                  href={product.link360}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="col-span-2 sm:col-span-1 py-3 px-3 rounded-xl bg-[#FAF8F5] hover:bg-zinc-100 border border-zinc-200 text-zinc-800 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 text-center"
                >
                  <RotateCw size={14} className="text-[#C0A060]" />
                  <span>360° View</span>
                </a>
              ) : (
                <button
                  type="button"
                  onClick={onScanAnother}
                  className="col-span-2 sm:col-span-1 py-3 px-3 rounded-xl bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 text-center cursor-pointer"
                >
                  <RefreshCw size={14} />
                  <span>Scan Another</span>
                </button>
              )}
            </div>

            {product.link360 && (
              <button
                type="button"
                onClick={onScanAnother}
                className="w-full py-2.5 text-zinc-500 hover:text-zinc-800 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>Scan Another Tile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductScanResult;
