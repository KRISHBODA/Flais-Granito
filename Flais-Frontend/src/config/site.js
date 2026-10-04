export const SITE_URL = 'https://www.flaisgranito.com';

export const BRAND_NAME = 'FLAIS GRANITO';

export const DEFAULT_TITLE = `${BRAND_NAME} | Premium Tiles for Modern Living`;

export const DEFAULT_DESCRIPTION =
  'FLAIS GRANITO offers a wide range of premium floor, wall, bathroom, and kitchen tiles. Discover exquisite designs and durable solutions for your home or commercial projects.';

export const DEFAULT_OG_IMAGE = `${SITE_URL}/its_different.jpg`;

export const DEFAULT_KEYWORDS =
  'Tile manufacturer in morbi, premium tile factory in morbi, porcelain tile exporter in india, tile supplier in India, biggest tile manufacturing in morbi gujarat, gvt / pgvt / color body / full body manufacturing in morbi , size 600x1200 mm gvt tiles / 1200x1800 mm color body slabs & tiles / 1200x1800 mm gvt tiles in morbi,  800x1600mm gvt porcelian tiles 1200x2400 mm color body slabs, 800x2400 mm full body slabs , 800x3000 mm full body slabs , High gloss tiles, matte finish flooring, outdoor cladding slabs, elevator wall cladding slabs, slip-resistant bathroom surfaces, water proof tiles, Global tiles supplier, Tiles factory in Morbi, Tiles factory in gujarat, Large format tile slabs, 9mm thick porcelain tiles, 15mm thick porcelain tiles, 12mm thick porcelain tiles, Satin finish vitrified tiles in morbi , Super white PGVT tiles, Italian marble design tiles, italian technology, Anti-skid floor tiles, DG matt finish vitrified tiles & color body,  liso finish vitrified tiles, liso + carving finish vitrified tiles, carving finish vitrified tiles, marvel xollection, extra max collection, liso gollection, marble gloss collection, marble gloss finish vitrified tiles, Luxury living room tiles in morbi, best Airport terminal flooring tiles, Residential flooring solutions, one stop solution, Scratch-resistant flooring tiles, Stain-resistant kitchen surfaces, Low water absorption tiles, Top tile manufacturers list, Best vitrified tiles brand, Direct from factory tiles, Premium tile exporters, expoter of porcelian slabs from india, High-end GVT PGVT collection, Architectural grade porcelain slabs, Frost-resistant outdoor porcelain, Chemical resistant industrial flooring, Keval Granito LLP division, flais granito - india, Standard tile testing parameters (ISO standards), Best tiles for high-traffic public areas, exporting to 55+ country from india';

export const BUSINESS = {
  name: BRAND_NAME,
  legalName: 'Keval Granito LLP',
  url: SITE_URL,
  logo: `${SITE_URL}/favicon-32x32.png`,
  telephone: '+919586733300',
  telephoneDisplay: '+91 95867 33300',
  email: 'info@flaisgranito.com',
  streetAddress: 'Survey No. 151/pl, Unchi Mandal, Halvad Highway',
  addressLocality: 'Morbi',
  addressRegion: 'Gujarat',
  postalCode: '363642',
  addressCountry: 'IN',
};

export const SOCIAL_PROFILES = [
  'https://www.facebook.com/share/1Eqo7HDYNb/',
  'https://www.linkedin.com/company/flais-granito',
  'https://www.instagram.com/flais_tiles.and.adhesives/',
  'https://www.youtube.com/@flais_tiles.and.adhesives',
  'https://pin.it/3NKlK8ujW',
];

const stripTrailingSlash = (value) => String(value || '').replace(/\/+$/, '');

export const normalizePath = (pathname) => stripTrailingSlash(pathname) || '/';

export const buildCanonicalUrl = (pathname) => `${SITE_URL}${normalizePath(pathname)}`;

export const absoluteUrl = (url) => {
  if (!url) return DEFAULT_OG_IMAGE;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_URL}${url.startsWith('/') ? url : `/${url}`}`;
};

export const buildTitle = (title) => {
  if (!title) return DEFAULT_TITLE;
  if (title === BRAND_NAME || title === DEFAULT_TITLE) return title;
  if (title.includes(BRAND_NAME)) return title;
  return `${title} | ${BRAND_NAME}`;
};

export const truncate = (text, maxLength = 158) => {
  const value = String(text || '').replace(/\s+/g, ' ').trim();
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).replace(/[\s,.:;-]+\S*$/, '')}...`;
};