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
  
  const defaultKeywords = 'FLAIS GRANITO Porcelain Slabs, Porcelain Slabs Manufacturer, Porcelain Slabs Exporter, Large Format Porcelain Slabs, Premium Porcelain Slabs, Porcelain Slabs Supplier, Porcelain Slabs Company, Porcelain Slabs India, Porcelain Slabs Manufacturer in India, Porcelain Slabs Exporter from India, Wholesale Porcelain Slabs, 1600x3200 Porcelain Slabs, 1200x2400 Porcelain Slabs, Sintered Stone Slabs, Indian Porcelain Slabs Manufacturer, Best Porcelain Slabs Manufacturer in India, premium tiles, floor tiles, wall tiles, kitchen tiles, bathroom tiles, luxury tiles, Flais Granito, ceramic tiles, vitrified tiles';
  const siteKeywords = keywords || defaultKeywords;
  
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
