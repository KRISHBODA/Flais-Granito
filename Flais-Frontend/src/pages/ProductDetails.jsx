import React, { useState, useEffect, useMemo } from 'react';
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
  ChevronLeft,
  ArrowRight
} from 'lucide-react';
import SEO from '../components/SEO';
import api from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

const ProductImage = ({ src, alt }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`w-full h-full transition-all duration-300 ${!loaded ? 'animate-pulse bg-zinc-200' : ''}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
      />
    </div>
  );
};

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

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related-products', product?.category],
    queryFn: async () => {
      if (!product?.category) return [];
      const res = await api.get(`/products?category=${product.category}`);
      return res.data.products || [];
    },
    enabled: !!product?.category,
  });

  const filteredRelated = useMemo(() => {
    if (!product) return [];
    return relatedProducts.filter(item => item._id !== product._id);
  }, [relatedProducts, product]);

  const loadError = isError ? 'Failed to load product details.' : '';
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  // Dynamic spec extraction from title / description
  const getProductSpecs = () => {
    if (!product) {
      return { size: 'N/A', finish: 'N/A', color: 'N/A', thickness: 'N/A', application: '', randoms: '', collection: '', tagReview: '' };
    }

    return {
      size: product.size || 'N/A',
      finish: product.finishes || product.finish || 'N/A',
      color: product.color || 'N/A',
      thickness: product.thickness || 'N/A',
      application: product.application || '',
      randoms: product.randoms || '',
      collection: product.productCollection || '',
      tagReview: product.tagReview || '',
    };
  };

  const { size, finish, color, thickness, application, randoms, collection, tagReview } = getProductSpecs();

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

  const rawImages = product.images?.length > 0 ? product.images : (product.image ? [product.image] : []);
  const allImages = rawImages.map(img => getOptimizedImageUrl(img));

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const minSwipeDistance = 50;
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
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
      
      <div className="w-full mx-auto px-4 sm:px-6 md:px-10 lg:px-12 py-12 max-w-[1536px]">
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

        <div className="grid lg:grid-cols-[1.3fr_0.7fr] gap-8 sm:gap-10 md:gap-12 lg:gap-16 items-stretch">
          {/* Left: Image Carousel */}
          <div className="relative aspect-[4/3] md:aspect-[1.1] lg:aspect-auto lg:h-full w-full rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 shadow-md group">
            <div className={`w-full h-full lg:absolute lg:inset-0 flex items-center justify-center ${currentImageIndex === 0 ? 'p-0' : 'p-6'}`}>
              {allImages.length > 0 ? (
                <img 
                  src={allImages[currentImageIndex]} 
                  alt={product.title || product.name} 
                  loading="lazy" 
                  className={`${currentImageIndex === 0 ? 'w-full h-full object-cover' : 'max-w-full max-h-full object-contain'} transition-all duration-500 select-none cursor-grab active:cursor-grabbing`} 
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onTouchEnd}
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
          </div>

          {/* Right: Premium Information Panel */}
          <div className="flex flex-col justify-between h-full py-2 gap-y-8">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-zinc-900 tracking-tight">
                  {product.title || product.name}
                </h1>
              </div>

              {/* Sizes, Finishes, Thickness, Color Specification Grid */}
              <div className="border-y border-zinc-200 py-5 grid grid-cols-2 gap-y-4 gap-x-4">
                <div className="border-r border-zinc-200 pr-4">
                  <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Available Size
                  </span>
                  <span className="text-zinc-800 font-bold text-sm">
                    {size}
                  </span>
                </div>
                <div className="pl-6">
                  <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Available Finish
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
                    Body Type
                  </span>
                  <span className="text-zinc-800 font-bold text-sm">
                    {color}
                  </span>
                </div>
                <div className="border-t border-r border-zinc-200 pt-4 pr-4">
                  <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Application
                  </span>
                  <span className="text-zinc-800 font-bold text-sm">
                    {application || 'N/A'}
                  </span>
                </div>
                <div className="border-t border-zinc-200 pt-4 pl-6">
                  <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Randoms
                  </span>
                  <span className="text-zinc-800 font-bold text-sm">
                    {randoms || 'N/A'}
                  </span>
                </div>
                <div className="border-t border-r border-zinc-200 pt-4 pr-4">
                  <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Collection
                  </span>
                  <span className="text-zinc-800 font-bold text-sm">
                    {collection || 'N/A'}
                  </span>
                </div>
                <div className="border-t border-zinc-200 pt-4 pl-6">
                  <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                    Tag/Review
                  </span>
                  <span className="text-zinc-800 font-bold text-sm">
                    {tagReview || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Experience Our Tools Section */}
              <div className="space-y-4">
                <span className="block text-xs font-bold uppercase tracking-widest text-[#C0A060]">
                  Experience Our Tools
                </span>
                <div className="flex flex-wrap gap-x-8 gap-y-6 items-center">
                  {product?.link360 && (
                    <a 
                      href={product.link360} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 group"
                    >
                      <div className="w-12 h-12 rounded-full border border-[#C0A060] flex items-center justify-center text-[#C0A060] group-hover:bg-[#C0A060] group-hover:text-white transition-all shadow-sm">
                        <RotateCw size={18} />
                      </div>
                      <span className="text-[10px] font-bold text-zinc-600 tracking-wider">360° VIEW</span>
                    </a>
                  )}
                  
                  <Link to="/calculator" className="flex items-center gap-3 group">
                    <div className="w-12 h-12 rounded-full border border-[#C0A060] flex items-center justify-center text-[#C0A060] group-hover:bg-[#C0A060] group-hover:text-white transition-all shadow-sm">
                      <Calculator size={18} />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-600 tracking-wider">TILE CALCULATOR</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Actions: Where to Buy Button */}
            <div>
              <Link
                to="/where-to-buy"
                className="w-full sm:w-auto px-8 py-4 bg-zinc-950 hover:bg-zinc-900 text-white rounded-lg font-bold flex items-center justify-center gap-2.5 transition-colors uppercase tracking-wider text-xs shadow-md active:scale-98"
              >
                <span>Where To Buy</span>
                <MapPin size={15} />
              </Link>
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {filteredRelated.length > 0 && (
          <div className="border-t border-zinc-100 mt-20 pt-16">
            <h2 className="text-2xl sm:text-3xl font-sans font-bold text-zinc-950 mb-8 uppercase tracking-wide">
              More from the {product.category || 'this Collection'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredRelated.slice(0, 4).map((item) => (
                <div
                  key={item._id}
                  className="p-4 pb-8 rounded-tl-[3.5rem] rounded-br-[3.5rem] rounded-tr-[1.25rem] rounded-bl-[1.25rem] bg-[#FAF8F5] border border-[#D2C9B1]/30 group flex flex-col h-full transform-gpu transition-all duration-500 hover:shadow-xl hover:border-[#5D4037]/30"
                >
                  <Link to={`/products/${item.slug || item._id}`} className="block relative aspect-[3/4] overflow-hidden rounded-tl-[2.75rem] rounded-br-[2.75rem] rounded-tr-[0.85rem] rounded-bl-[0.85rem] bg-zinc-100 transform-gpu">
                    <ProductImage
                      src={getOptimizedImageUrl(item.images?.[0] || item.image || 'https://via.placeholder.com/400x400?text=No+Image', 600)}
                      alt={item.title || item.name}
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </Link>
                  <div className="pt-6 px-2 flex flex-col flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#5D4037] bg-[#5D4037]/5 px-2.5 py-0.5 rounded border border-[#5D4037]/10">{item.category || 'Standard'}</span>
                    </div>
                    <h3 className="font-sans font-bold text-2xl text-zinc-900 mb-6">
                      {item.title || item.name}
                    </h3>
                    <div className="mt-auto">
                      <Link to={`/products/${item.slug || item._id}`} className="inline-flex items-center group/btn relative py-2">
                        <div className="absolute left-[-12px] w-10 h-10 bg-[#D2C9B1] rounded-full transition-all duration-500 ease-out group-hover/btn:w-[calc(100%+24px)] group-hover/btn:bg-[#5D4037]"></div>
                        <span className="relative z-10 flex items-center text-sm font-medium text-zinc-900 group-hover/btn:text-white transition-colors duration-300 pl-4">
                          View More <ArrowRight size={16} className="ml-3 transition-transform duration-300 group-hover/btn:translate-x-1" />
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default ProductDetails;
