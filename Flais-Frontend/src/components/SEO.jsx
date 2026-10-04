import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * Applies per-route metadata to document.head using react-helmet-async.
 */
const SEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  schema,
  noindex = false,
  author,
  publishedTime,
  section,
  tags,
}) => {
  const schemaKey = schema && typeof schema === 'object' ? JSON.stringify(schema) : schema;
  const defaultTitle = "FLAIS GRANITO | Premium Tiles for Modern Living";
  
  let seoTitle = defaultTitle;
  if (title) {
    seoTitle = title.includes("FLAIS GRANITO") ? title : `${title} | FLAIS GRANITO`;
  }

  return (
    <Helmet>
      <title>{seoTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      <meta property="og:title" content={seoTitle} />
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content={type} />
      <meta name="twitter:title" content={seoTitle} />
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {author && <meta name="author" content={author} />}
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {section && <meta property="article:section" content={section} />}
      {tags && tags.map((tag) => (
        <meta property="article:tag" content={tag} key={tag} />
      ))}
      {schemaKey && (
        <script type="application/ld+json">
          {schemaKey}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;