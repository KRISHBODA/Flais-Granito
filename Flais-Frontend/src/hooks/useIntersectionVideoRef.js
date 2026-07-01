import { useCallback, useRef } from 'react';

/**
 * A custom React hook that plays a video when it is in the viewport and pauses it when it goes offscreen.
 * This saves system resources (CPU/GPU) and improves rendering performance on content-heavy pages.
 *
 * Uses a callback ref so the IntersectionObserver is created (or re-created) whenever the
 * video element actually mounts into the DOM — even if it's conditionally rendered.
 */
export const useIntersectionVideoRef = () => {
  const observerRef = useRef(null);
  const videoElRef = useRef(null);

  const callbackRef = useCallback((video) => {
    // Clean up previous observer
    if (observerRef.current && videoElRef.current) {
      observerRef.current.unobserve(videoElRef.current);
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    videoElRef.current = video;

    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Play the video when in viewport
          video.play().catch((err) => {
            // Muted autoplay is generally allowed by browsers, but we catch potential errors
                      });
        } else {
          // Pause the video when out of viewport
          video.pause();
        }
      },
      {
        threshold: 0.05, // Trigger when at least 5% of the video is visible
        rootMargin: '100px 0px 100px 0px', // Start playing slightly before entering / keep playing slightly after leaving
      }
    );

    observer.observe(video);
    observerRef.current = observer;
  }, []);

  // Return an object that works as both a callback ref and has a .current property
  // so existing code using videoRef.current (e.g. toggleMute) continues to work.
  const ref = useCallback(
    (node) => {
      callbackRef(node);
    },
    [callbackRef]
  );

  // Attach .current as a getter so code like videoRef.current.muted still works
  Object.defineProperty(ref, 'current', {
    get: () => videoElRef.current,
    configurable: true,
  });

  return ref;
};

export default useIntersectionVideoRef;
