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

  // Disable body scroll when preloader is active
  useEffect(() => {
    if (loading && !location.pathname.startsWith("/admin")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [loading, location.pathname]);

  if (location.pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-white"
        >
          <video
            src={motionLogo}
            autoPlay
            muted
            playsInline
            preload="auto"
            onEnded={() => setLoading(false)}
            className="w-[85%] max-w-[500px] md:max-w-[600px] h-auto object-contain pointer-events-none select-none"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Preloader;
