import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import motionLogo from '../assets/Flais motion logo.mp4';
import logo from '../assets/Flais White.png';

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
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f8f5f0] overflow-hidden"
          exit={{
            y: "-100%",
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] }
          }}
        >
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-[#f8f5f0]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(197,168,128,0.18),_transparent_45%),linear-gradient(180deg,_#f8f5f0_0%,_#ffffff_100%)]" />
            <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
              <img
                src={logo}
                alt="FLAIS GRANITO"
                className="w-[180px] sm:w-[220px] md:w-[260px] h-auto object-contain drop-shadow-sm mb-6"
              />
              <div className="flex items-center gap-3 text-[#5D4037]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#5D4037] animate-pulse" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.35em]">
                  Loading experience
                </span>
              </div>
            </div>
            <video
              src={motionLogo}
              autoPlay
              muted
              playsInline
              onEnded={handleVideoEnd}
              className="absolute inset-0 w-[85%] sm:w-[80%] md:w-[75%] lg:w-[70%] xl:w-[60%] max-w-6xl h-auto object-contain mx-auto opacity-90"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
