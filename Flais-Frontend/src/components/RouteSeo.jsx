import { useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { matchRouteSeo } from '../config/seo';
import { DEFAULT_KEYWORDS, buildCanonicalUrl, buildTitle, truncate } from '../config/site';

/**
 * Guarantees every route has a correct title, description and canonical URL,
 * even when the page component does not render its own <SEO>.
 */
const RouteSeo = () => {
  const { pathname } = useLocation();
  const route = matchRouteSeo(pathname);

  const title = buildTitle(route.title);
  const description = truncate(route.description);
  const canonical = buildCanonicalUrl(pathname);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={route.keywords || DEFAULT_KEYWORDS} />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      {route.noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
};

export default RouteSeo;