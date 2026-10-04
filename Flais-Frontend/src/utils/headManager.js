import {
  BRAND_NAME,
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
  buildCanonicalUrl,
  buildTitle,
  normalizePath,
  truncate,
} from '../config/site';

const INDEXABLE_ROBOTS = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
const NOINDEX_ROBOTS = 'noindex, follow';

const setMeta = (attribute, key, content) => {
  if (!document.head) return;
  const value = content === null || content === undefined ? '' : String(content);
  let tag = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', value);
};

const setLink = (rel, href) => {
  if (!document.head) return;
  let tag = document.head.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
};

const setSchema = (schema) => {
  const json =
    typeof schema === 'string' ? schema : schema ? JSON.stringify(schema) : '';

  const existing = document.head?.querySelector('script[data-seo-schema]');

  if (!json) {
    existing?.remove();
    return;
  }

  let tag = existing;
  if (!tag) {
    tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.setAttribute('data-seo-schema', 'true');
    document.head.appendChild(tag);
  }

  tag.textContent = json;
};

export const setManagedHead = ({
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
} = {}) => {
  if (typeof document === 'undefined') return;

  const pathname = normalizePath(window.location.pathname);
  const pageTitle = buildTitle(title);
  const pageDescription = truncate(description || DEFAULT_DESCRIPTION);
  const pageKeywords = keywords ? `${keywords}, ${DEFAULT_KEYWORDS}` : DEFAULT_KEYWORDS;
  const pageImage = absoluteUrl(image || DEFAULT_OG_IMAGE);
  const canonical = url || buildCanonicalUrl(pathname);
  const robots = noindex ? NOINDEX_ROBOTS : INDEXABLE_ROBOTS;

  document.title = pageTitle;

  setMeta('name', 'description', pageDescription);
  setMeta('name', 'keywords', pageKeywords);
  setMeta('name', 'robots', robots);
  if (author) setMeta('name', 'author', author);

  setMeta('property', 'og:type', type);
  setMeta('property', 'og:site_name', BRAND_NAME);
  setMeta('property', 'og:locale', 'en_US');
  setMeta('property', 'og:title', pageTitle);
  setMeta('property', 'og:description', pageDescription);
  setMeta('property', 'og:image', pageImage);
  setMeta('property', 'og:image:alt', pageTitle);
  setMeta('property', 'og:url', canonical);
  if (section) setMeta('property', 'article:section', section);
  if (tags) setMeta('property', 'article:tag', tags);
  if (publishedTime) setMeta('property', 'article:published_time', publishedTime);

  setMeta('name', 'twitter:card', 'summary_large_image');
  setMeta('name', 'twitter:title', pageTitle);
  setMeta('name', 'twitter:description', pageDescription);
  setMeta('name', 'twitter:image', pageImage);
  setMeta('name', 'twitter:url', canonical);
  if (publishedTime) {
    setMeta('name', 'twitter:label1', 'Published');
    setMeta('name', 'twitter:data1', publishedTime);
  }

  setLink('canonical', canonical);
  setSchema(schema);
};