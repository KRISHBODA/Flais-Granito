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

  // Only return null for admin routes
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          className="fixed inset-0 z-[9999] overflow-hidden bg-[#f8f5f0]"
          exit={{
            y: "-100%",
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] }
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(197,168,128,0.20),_transparent_45%),linear-gradient(180deg,_#f8f5f0_0%,_#fffdf9_100%)]" />
          <video
            src={motionLogo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.16] pointer-events-none select-none"
          />
          <div className="relative z-10 flex h-full w-full items-center justify-center px-6 text-center">
            <div className="flex flex-col items-center justify-center">
              <img
                src={logo}
                alt="FLAIS GRANITO"
                className="w-[190px] sm:w-[240px] md:w-[280px] h-auto object-contain drop-shadow-sm"
              />
              <div className="mt-6 flex items-center gap-3 text-[#5D4037]">
                <span className="h-2.5 w-2.5 rounded-full bg-[#5D4037] animate-pulse" />
                <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.35em]">
                  Loading experience
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
