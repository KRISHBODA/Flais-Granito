import { DEFAULT_DESCRIPTION, normalizePath } from './site';

export const ROUTE_SEO = {
  '/': {
    title: 'Premium Tiles for Modern Living',
    description:
      'Discover FLAIS GRANITO premium floor, wall, kitchen and bathroom tiles. GVT, PGVT and full body porcelain slabs manufactured in Morbi, Gujarat and exported to 55+ countries.',
  },
  '/about': {
    title: 'About Us',
    description:
      'Learn about FLAIS GRANITO journey, our commitment to quality, eco-friendly manufacturing, and how we deliver luxury ceramic and vitrified tiles to 55+ countries from Morbi, Gujarat.',
  },
  '/products': {
    title: 'Tiles Collection',
    description:
      'Browse FLAIS GRANITO tile collections - GVT, PGVT, full body porcelain, large format slabs up to 800x3000 mm, marble design, liso, carving, matt and gloss finishes for floor and wall.',
  },
  '/products/': {
    title: 'Product Details',
    description:
      'Explore FLAIS GRANITO porcelain and vitrified tile product details including size, thickness, finish, water absorption, technical specifications and standard tile testing parameters.',
  },
  '/catalog': {
    title: 'Tile Catalog',
    description:
      'View the FLAIS GRANITO digital tile catalog. Browse our latest GVT, PGVT and full body tile designs, marble look slabs, large format tiles and surface finishes in one place.',
  },
  '/catalog/view': {
    title: 'Catalog Viewer',
    description: 'FLAIS GRANITO catalog PDF viewer.',
    noindex: true,
  },
  '/blog': {
    title: 'Blog',
    description:
      'Read tile design trends, installation tips, tile care guides and industry insights from FLAIS GRANITO, a leading tile manufacturer in Morbi, Gujarat.',
  },
  '/blog/': {
    title: 'Tile Design Blog & Guides',
    description:
      'Read tile design trends, installation tips and care guides from FLAIS GRANITO. Learn how to choose the right tile finish, size and thickness for your project.',
  },
  '/contact': {
    title: 'Contact Us',
    description:
      'Contact FLAIS GRANITO, tile manufacturer in Morbi, Gujarat. Call +91 95867 33300 or email info@flaisgranito.com for tile enquiries, dealer information and export inquiries.',
  },
  '/where-to-buy': {
    title: 'Where to Buy',
    description:
      'Find FLAIS GRANITO tile dealers and distributors near you. Our vitrified and porcelain tiles are available across India and exported to 55+ countries worldwide.',
  },
  '/certifications': {
    title: 'Certifications',
    description:
      'View FLAIS GRANITO quality certifications and ISO standard tile testing parameters, including water absorption, chemical resistance, frost resistance and slip resistance.',
  },
  '/installation-guide': {
    title: 'Installation Guide',
    description:
      'Step by step tile installation guide for FLAIS GRANITO vitrified, GVT and large format porcelain slabs covering surface preparation, adhesives, laying, grouting and post installation care.',
  },
  '/calculator': {
    title: 'Tile Calculator',
    description:
      'Calculate how many tiles and boxes you need for your floor or wall area using the FLAIS GRANITO tile calculator, with wastage allowance for a perfect order.',
  },
  '/scan': {
    title: 'Scan Tile QR Code',
    description: 'Scan a FLAIS GRANITO tile QR code to view its technical specifications.',
    noindex: true,
  },
  '/box-countertop-15mm': {
    title: '15mm Countertop Box QR',
    description: 'Scan the QR code on your FLAIS GRANITO 15mm countertop box.',
    noindex: true,
  },
  '/box-countertop-15mm-english': {
    title: '15mm Countertop Box QR (English)',
    description: 'Scan the QR code on your FLAIS GRANITO 15mm countertop box.',
    noindex: true,
  },
};

const FALLBACK_SEO = {
  title: 'Page Not Found',
  description: DEFAULT_DESCRIPTION,
  noindex: true,
};

export const matchRouteSeo = (pathname) => {
  const path = normalizePath(pathname);
  if (ROUTE_SEO[path]) return ROUTE_SEO[path];

  for (const key of Object.keys(ROUTE_SEO)) {
    if (key === '/' || !key.endsWith('/')) continue;
    if (path.startsWith(key)) return ROUTE_SEO[key];
  }

  return FALLBACK_SEO;
};