import React from 'react';

/**
 * Reusable SEO Component for React 19.
 * Leverage React 19's native metadata tag hoisting, supporting:
 * - <title>
 * - <meta> (description, keywords, robots, open-graph, twitter-cards)
 * - <link> (canonical)
 * - <script> (JSON-LD structured schemas)
 */
const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  schema
}) => {
  const baseTitle = 'FLAIS GRANITO';
  const siteTitle = title ? `${title} | ${baseTitle}` : `${baseTitle} | Premium Tiles for Modern Living`;
  
  const defaultDesc = 'FLAIS GRANITO offers a wide range of premium floor, wall, bathroom, and kitchen tiles. Discover exquisite designs and durable solutions for your home or commercial projects.';
  const siteDescription = description || defaultDesc;
  
  const defaultKeywords = 'Tile manufacturer in morbi, premium tile factory in morbi, porcelain tile exporter in india, tile supplier in India, biggest tile manufacturing in morbi gujarat, gvt / pgvt / color body / full body manufacturing in morbi , size 600x1200 mm gvt tiles / 1200x1800 mm color body slabs & tiles / 1200x1800 mm gvt tiles in morbi,  800x1600mm gvt porcelian tiles 1200x2400 mm color body slabs, 800x2400 mm full body slabs , 800x3000 mm full body slabs , High gloss tiles, matte finish flooring, outdoor cladding slabs, elevator wall cladding slabs, slip-resistant bathroom surfaces, water proof tiles, Global tiles supplier, Tiles factory in Morbi, Tiles factory in gujarat, Large format tile slabs, 9mm thick porcelain tiles, 15mm thick porcelain tiles, 12mm thick porcelain tiles, Satin finish vitrified tiles in morbi , Super white PGVT tiles, Italian marble design tiles, italian technology, Anti-skid floor tiles, DG matt finish vitrified tiles & color body,  liso finish vitrified tiles, liso + carving finish vitrified tiles, carving finish vitrified tiles, marvel xollection, extra max collection, liso gollection, marble gloss collection, marble gloss finish vitrified tiles, Luxury living room tiles in morbi, best Airport terminal flooring tiles, Residential flooring solutions, one stop solution, Scratch-resistant flooring tiles, Stain-resistant kitchen surfaces, Low water absorption tiles, Top tile manufacturers list, Best vitrified tiles brand, Direct from factory tiles, Premium tile exporters, expoter of porcelian slabs from india, High-end GVT PGVT collection, Architectural grade porcelain slabs, Frost-resistant outdoor porcelain, Chemical resistant industrial flooring, Keval Granito LLP division, flais granito - india, Standard tile testing parameters (ISO standards), Best tiles for high-traffic public areas, exporting to 55+ country from india';
  const siteKeywords = keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords;
  
  const defaultImage = 'https://www.flaisgranito.com/its_different.jpg';
  const siteImage = image || defaultImage;
  
  const siteUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://www.flaisgranito.com');

  return (
    <>
      <title>{siteTitle}</title>
      <meta name="description" content={siteDescription} />
      <meta name="keywords" content={siteKeywords} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={siteDescription} />
      <meta property="og:image" content={siteImage} />
      <meta property="og:url" content={siteUrl} />
      <meta property="og:site_name" content="FLAIS GRANITO" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={siteDescription} />
      <meta name="twitter:image" content={siteImage} />

      {/* Canonical Link */}
      <link rel="canonical" href={siteUrl} />

      {/* Structured Schema Data */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </>
  );
};

export default SEO;
