import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import motionLogo from '../assets/Flais motion logo.mp4';

let preloaderShown = false;

const Preloader = () => {
  const [loading, setLoading] = useState(!preloaderShown);
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      preloaderShown = true;
      return;
    }
    // Fail-safe to ensure the app is accessible even if the video fails to load/end
    const timer = setTimeout(() => {
      setLoading(false);
      preloaderShown = true;
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading]);

  const handleVideoEnd = () => {
    setLoading(false);
    preloaderShown = true;
  };

  // Only return null for admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white overflow-hidden"
          exit={{
            y: "-100%",
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] }
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center bg-white overflow-hidden">
            <video
              src={motionLogo}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnd}
              className="w-[85%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[60%] max-w-6xl h-auto object-contain mx-auto"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
