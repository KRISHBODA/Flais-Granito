import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

const SmoothScroll = ({ children }) => {
  const lenisRef = useRef(null);
  const rafRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Disable Lenis smooth scroll on the calculator route to avoid height computation
    // and scrolling issues, restoring native scroll behavior on this page.
    if (location.pathname === '/calculator') {
      if (lenisRef.current) {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        lenisRef.current.destroy();
        lenisRef.current = null;
      }
      // Always scroll to top on route change (native fallback)
      window.scrollTo(0, 0);
      return;
    }

    // Detect touch-capable devices. Lenis attaches non-passive wheel listeners
    // which can cause jank on desktop mouse wheel. Only enable Lenis on
    // touch devices (coarse pointer / touch support) to avoid intercepting
    // desktop wheel events that lead to the DevTools warnings and lag.
    const isTouchDevice = typeof window !== 'undefined' && (
      'ontouchstart' in window ||
      (navigator && navigator.maxTouchPoints && navigator.maxTouchPoints > 0) ||
      (window.matchMedia && window.matchMedia('(pointer: coarse)').matches)
    );

    if (!isTouchDevice) {
      // Desktop: prefer native scrolling (do not initialize Lenis)
      window.scrollTo(0, 0);
      return;
    }

    // Initialize Lenis on other routes if not already initialized
    if (!lenisRef.current) {
      const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.5,
        infinite: false,
      });

      lenisRef.current = lenis;

      const raf = (time) => {
        if (lenisRef.current) {
          lenisRef.current.raf(time);
          rafRef.current = requestAnimationFrame(raf);
        }
      };

      rafRef.current = requestAnimationFrame(raf);
      lenis.resize();
    }

    // Always scroll to top on every route change (pathname or search)
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
    }
    // Native fallback to ensure scroll resets even before Lenis takes over
    window.scrollTo(0, 0);

    // Force scroll to top again after a brief delay to account for React Suspense
    // lazy loading the new route components into the DOM.
    const suspenseScrollTimer = setTimeout(() => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
      window.scrollTo(0, 0);
    }, 150);

    // Debounced ResizeObserver: recalculates Lenis scroll height when page
    // content changes (e.g. after lazy Suspense resolves or images load).
    // Debounced at 100ms to avoid firing on every paint during fast scroll.
    let resizeTimer;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (lenisRef.current) lenisRef.current.resize();
      }, 100);
    });
    resizeObserver.observe(document.documentElement);

    return () => {
      // clear the suspense scroll timer (if set) and the debounced resize timer
      clearTimeout(suspenseScrollTimer);
      clearTimeout(resizeTimer);
      resizeObserver.disconnect();
    };
  }, [location.pathname, location.search]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, []);

  return <>{children}</>;
};

export default SmoothScroll;
