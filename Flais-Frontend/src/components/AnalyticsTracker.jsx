import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from '../utils/analytics';

const AnalyticsTracker = () => {
  const location = useLocation();
  const lastTrackedRef = useRef('');

  useEffect(() => {
    const routeKey = `${location.pathname}${location.search}`;
    if (lastTrackedRef.current === routeKey) return;
    lastTrackedRef.current = routeKey;
    trackPageView(location.pathname, location.search);
  }, [location.pathname, location.search]);

  return null;
};

export default AnalyticsTracker;
