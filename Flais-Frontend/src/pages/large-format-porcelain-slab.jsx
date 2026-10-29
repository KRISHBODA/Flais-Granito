import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import SEO from '../components/SEO';
import api from '../utils/api';
import { getOptimizedImageUrl } from '../utils/imageOptimizer';

// Same normalisation + matching rules as pages/Products.jsx
const normalizeFilterString = (value, removeSpaces = false) => {
  const str = (value || '')
    .toString()
    .toLowerCase()
    .replace(/×/g, 'x')
    .replace(/&/g, ' and ')
    .replace(/(mm|cm|inches|inch|in)/gi, '');
  if (removeSpaces) return str.replace(/[^a-z0-9x]+/g, '');
  return str.replace(/[^a-z0-9x ]+/g, ' ').replace(/\s+/g, ' ').trim();
};

const matchesSize = (productSize, size) => {
  const p = normalizeFilterString(productSize, true);
  const o = normalizeFilterString(size, true);
  if (!p || !o) return false;
  const [a, b] = o.split('x');
  const swapped = a && b ? `${b}x${a}` : o;
  return p === o || p === swapped;
};

// Matches the first number in the thickness value, e.g. "15MM", "15 mm" -> 15
const matchesThickness = (productThickness, thickness) => {
  const pick = (v) => {
    const m = (v || '').toString().toLowerCase().match(/\d+(\.\d+)?/);
    return m ? parseFloat(m[0]) : null;
  };
  const p = pick(productThickness);
  const t = pick(thickness);
  return p !== null && t !== null && p === t;
};

const matchesApplication = (productApp, app) => {
  const p = normalizeFilterString(productApp, false);
  const o = normalizeFilterString(app, false);
  if (!p || !o) return false;
  return p.includes(o) || o.includes(p);
};

const toList = (v) => (Array.isArray(v) ? v : v ? [v] : []);
const norm = (v) => (v || '').toString().trim().toLowerCase();

// A product is shown when it passes every filter that is set in FILTERS
const matchesFilters = (p, f) => {
  const sizes = toList(f.sizes);
  const thickness = toList(f.thickness);
  const colors = toList(f.colors).map(norm);
  const categories = toList(f.categories).map(norm);
  return (
    (!sizes.length || sizes.some((s) => matchesSize(p.size, s))) &&
    (!thickness.length || thickness.some((t) => matchesThickness(p.thickness, t))) &&
    (!f.application || matchesApplication(p.application, f.application)) &&
    (!colors.length || colors.includes(norm(p.color))) &&
    (!categories.length || categories.includes(norm(p.category))) &&
    (!f.text || new RegExp(f.text, 'i').test(`${p.title} ${p.category} ${p.finishes}`))
  );
};

const BODY_TYPE_SWATCHES = {
  white: '#F8F9FA',
  ivory: '#FFFFF0',
  grey: '#9E9E9E',
  black: '#212121',
  green: '#2E7D32',
  brown: '#6D4C41',
  choco: '#3E2723',
  verde: '#004D40',
};

const ProductSkeleton = () => (
  <div className="p-3 pb-6 rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-[1rem] rounded-bl-[1rem] bg-[#FAF8F5] border border-[#D2C9B1]/30 animate-pulse">
    <div className="aspect-[3/4] rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-[0.75rem] rounded-bl-[0.75rem] bg-zinc-200" />
    <div className="pt-5 px-2 space-y-3">
      <div className="h-4 w-20 bg-zinc-200 rounded" />
      <div className="h-6 w-3/4 bg-zinc-200 rounded" />
    </div>
  </div>
);

// ============================================================
// SEO SETTINGS - edit these values to update this page's SEO tags
// ============================================================
const SEO_SETTINGS = {
  title: 'Large Format Porcelain Slabs',
  description:
    'Explore FLAIS GRANITO large format porcelain slabs in 1200x1800 mm and 1200x2400 mm. Premium GVT and PGVT slabs for floors and walls.',
  keywords:
    'large format porcelain slab, porcelain slabs, 1200x1800 slabs, 1200x2400 slabs, GVT slabs, FLAIS GRANITO',
  image: '', // optional: full image URL used for social sharing (og:image)
  noindex: false, // set true to hide this page from search engines
};

// Maximum number of products shown on this page
const MAX_PRODUCTS = 8;

// ============================================================
// PRODUCT FILTERS - decides which products appear on this page
// (1200x1800 and 1200x2400 mm)
// sizes / thickness / colors / categories accept one or more values;
// application = 'floor' | 'wall' | 'outdoor'; text = word searched in title/collection/finish.
// Leave a filter out to ignore it.
// ============================================================
const FILTERS = {
  sizes: ['1200x1800', '1200x2400'],
};
const HEADING = 'Large Format Porcelain Slabs';
const INTRO = 'Premium 1200 x 1800 mm and 1200 x 2400 mm porcelain slabs.';

// Sidebar-less, 4-per-row product grid, filtered by FILTERS above.
const LargeFormatPorcelainSlab = () => {
  const { data: products = [], isLoading, isError } = useQuery({
    queryKey: ['products', 'all-for-size'],
    queryFn: async () => {
      const res = await api.get('/products?limit=all');
      return res.data.products || [];
    },
  });

  const filtered = useMemo(
    () =>
      products.filter((p) => matchesFilters(p, FILTERS)).slice(0, MAX_PRODUCTS),
    [products]
  );

  return (
    <div className="bg-white min-h-screen">
      <SEO
        title={SEO_SETTINGS.title}
        description={SEO_SETTINGS.description}
        keywords={SEO_SETTINGS.keywords}
        image={SEO_SETTINGS.image || undefined}
        noindex={SEO_SETTINGS.noindex}
      />

      <section className="pt-32 pb-10 px-6 md:px-12 max-w-[1600px] mx-auto">
        <h1 className="font-sans font-bold text-4xl md:text-5xl text-zinc-900">{HEADING}</h1>
        <p className="mt-4 text-zinc-600 max-w-2xl">{INTRO}</p>
      </section>

      <section className="px-6 md:px-12 pb-24 max-w-[1600px] mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : isError ? (
          <p className="text-center text-zinc-600 py-20">
            Failed to load products. Please check your connection and refresh.
          </p>
        ) : filtered.length === 0 ? (
          <p className="text-center text-zinc-600 py-20">No products found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map((product, index) => {
              const image =
                product.images && product.images.length > 0
                  ? product.images[0]
                  : product.image || 'https://via.placeholder.com/400x400?text=No+Image';
              const link = `/products/${product.slug || product._id}`;
              return (
                <div
                  key={product._id}
                  className="p-3 pb-6 rounded-tl-[2.5rem] rounded-br-[2.5rem] rounded-tr-[1rem] rounded-bl-[1rem] bg-[#FAF8F5] border border-[#D2C9B1]/30 group flex flex-col h-full hover:shadow-xl hover:border-[#5D4037]/30 transition-shadow"
                >
                  <Link
                    to={link}
                    className="block relative aspect-[3/4] overflow-hidden rounded-tl-[2rem] rounded-br-[2rem] rounded-tr-[0.75rem] rounded-bl-[0.75rem] bg-zinc-100"
                  >
                    <img
                      src={getOptimizedImageUrl(image, 600)}
                      alt={product.title || product.name}
                      loading={index < 8 ? 'eager' : 'lazy'}
                      decoding="async"
                      className={`w-full h-full object-cover transition-all duration-500 ${
                        product.images && product.images.length > 1
                          ? 'group-hover:opacity-0'
                          : 'group-hover:scale-105'
                      }`}
                    />
                    {product.images && product.images.length > 1 && (
                      <img
                        src={getOptimizedImageUrl(product.images[1], 600)}
                        alt={`${product.title || product.name} tile face`}
                        loading="lazy"
                        decoding="async"
                        className="absolute inset-0 w-full h-full object-contain p-4 bg-[#FAF8F5] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      />
                    )}
                  </Link>
                  <div className="pt-5 px-2 flex flex-col flex-1">
                    <div className="mb-2 flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-[#5D4037] bg-[#5D4037]/5 px-2.5 py-0.5 rounded border border-[#5D4037]/10">
                        {product.category || 'Standard'}
                      </span>
                      {(() => {
                        const color = (product.color || '').trim();
                        const upper = color.toUpperCase();
                        if (!color || upper.includes('GVT')) return null;
                        return (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-zinc-200 bg-white text-zinc-700 flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full border border-black/20"
                              style={{ backgroundColor: BODY_TYPE_SWATCHES[color.toLowerCase()] || '#A0A0A0' }}
                            />
                            {color} Body
                          </span>
                        );
                      })()}
                      {product.tagReview && String(product.tagReview).trim() !== '' && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                            /best\s*selling/i.test(product.tagReview)
                              ? 'bg-amber-500/10 text-amber-900 border-amber-500/30'
                              : /new\s*arrival/i.test(product.tagReview)
                              ? 'bg-emerald-500/10 text-emerald-900 border-emerald-500/30'
                              : 'bg-[#5D4037]/10 text-[#5D4037] border-[#5D4037]/20'
                          }`}
                        >
                          {product.tagReview}
                        </span>
                      )}
                    </div>
                    <h3 className="font-sans font-bold text-xl text-zinc-900 mb-5">
                      {product.title || product.name}
                    </h3>
                    <div className="mt-auto">
                      <Link
                        to={link}
                        className="inline-flex items-center text-sm font-medium text-zinc-900 hover:text-[#5D4037] transition-colors"
                      >
                        View More <ArrowRight size={16} className="ml-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default LargeFormatPorcelainSlab;
