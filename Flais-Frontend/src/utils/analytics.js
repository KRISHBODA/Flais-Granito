const getBackendBaseUrl = () => {
  const envUrl = import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.trim().replace(/\/$/, '') : '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const protocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'https' : 'http';
  const runtimeUrl = hostname && hostname !== 'localhost' && hostname !== '127.0.0.1'
    ? `${protocol}://${hostname}:8000`
    : 'http://localhost:8000';

  if (!envUrl) {
    return runtimeUrl;
  }

  if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
    return runtimeUrl;
  }

  return envUrl;
};

const backendBaseUrl = getBackendBaseUrl();
const EVENT_ENDPOINT = `${backendBaseUrl}/api/analytics/events`;

const memoryIds = {
  visitorId: '',
  sessionId: '',
};

const getStorageId = (storage, key, prefix) => {
  if (typeof window === 'undefined') return `${prefix}-${Date.now()}`;

  try {
    const existing = storage.getItem(key);
    if (existing) return existing;

    const generated = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    storage.setItem(key, generated);
    return generated;
  } catch {
    const memoryKey = prefix === 'visitor' ? 'visitorId' : 'sessionId';
    if (memoryIds[memoryKey]) return memoryIds[memoryKey];
    const generated = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now()}`;
    memoryIds[memoryKey] = generated;
    return generated;
  }
};

export const getVisitorId = () => getStorageId(localStorage, 'flais_visitor_id', 'visitor');
export const getSessionId = () => getStorageId(sessionStorage, 'flais_session_id', 'session');

export const getPageAnalyticsMeta = (pathname = '', search = '') => {
  const path = `${pathname || ''}${search || ''}`;
  if (pathname === '/') {
    return { pageKey: 'home', pageLabel: 'Home', path };
  }
  if (pathname === '/products') {
    return { pageKey: 'products', pageLabel: 'Products Listing', path };
  }
  if (pathname.startsWith('/products/')) {
    return { pageKey: 'product-details', pageLabel: 'Product Details', path };
  }
  if (pathname === '/catalog') {
    return { pageKey: 'catalog', pageLabel: 'Catalog Library', path };
  }
  if (pathname === '/catalog/view') {
    return { pageKey: 'catalog-viewer', pageLabel: 'Catalog PDF Viewer', path };
  }
  if (pathname === '/blog') {
    return { pageKey: 'blog', pageLabel: 'Blog Listing', path };
  }
  if (pathname.startsWith('/blog/')) {
    return { pageKey: 'blog-post', pageLabel: 'Blog Article', path };
  }
  if (pathname === '/contact') {
    return { pageKey: 'contact', pageLabel: 'Contact', path };
  }
  if (pathname === '/where-to-buy') {
    return { pageKey: 'where-to-buy', pageLabel: 'Where to Buy', path };
  }
  if (pathname === '/about') {
    return { pageKey: 'about', pageLabel: 'About', path };
  }
  if (pathname === '/certifications') {
    return { pageKey: 'certifications', pageLabel: 'Certifications', path };
  }
  if (pathname === '/installation-guide') {
    return { pageKey: 'installation-guide', pageLabel: 'Installation Guide', path };
  }
  if (pathname === '/calculator') {
    return { pageKey: 'calculator', pageLabel: 'Tile Calculator', path };
  }
  return { pageKey: pathname.replace(/^\//, '') || 'unknown', pageLabel: pathname === '/' ? 'Home' : pathname.replace(/^\//, '').replace(/-/g, ' '), path };
};

export const trackAnalyticsEvent = async (eventType, payload = {}) => {
  if (typeof window === 'undefined') return false;

  const body = {
    eventType,
    sessionId: getSessionId(),
    visitorId: getVisitorId(),
    referrer: document.referrer || '',
    ...payload,
  };

  try {
    const json = JSON.stringify(body);
    if (navigator.sendBeacon) {
      const blob = new Blob([json], { type: 'application/json' });
      const ok = navigator.sendBeacon(EVENT_ENDPOINT, blob);
      if (ok) return true;
    }

    const response = await fetch(EVENT_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
      body: json,
      keepalive: true,
      mode: 'cors',
    });

    return response.ok;
  } catch (error) {
    return false;
  }
};

export const trackPageView = (pathname, search = '') => {
  const meta = getPageAnalyticsMeta(pathname, search);
  return trackAnalyticsEvent('page_view', meta);
};
