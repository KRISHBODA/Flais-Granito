import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import motionLogo from "../assets/Flais motion logo.mp4";

let preloaderShown = false;

const Preloader = () => {
  const [loading, setLoading] = useState(!preloaderShown);
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      preloaderShown = true;
      return;
    }

    const timer = setTimeout(() => {
      setLoading(false);
      preloaderShown = true;
    }, 5000);

    return () => clearTimeout(timer);
  }, [loading]);

  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <AnimatePresence>
      {loading && (
        <motion.div className="fixed inset-0 z-[9999] overflow-hidden bg-white">
          <video
            src={motionLogo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 h-full w-full object-cover object-center opacity-[100] blur-[1px] scale-105 pointer-events-none select-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
