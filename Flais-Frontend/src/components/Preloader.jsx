import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import motionLogo from "../assets/Logo Animation 3 (1).mp4";

let preloaderShown = false;

const Preloader = () => {
  const [loading, setLoading] = useState(!preloaderShown);
  const [isFading, setIsFading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!loading) {
      preloaderShown = true;
      return;
    }

    // Backup timer: if video doesn't end, fade out and unmount after 5 seconds
    const timer = setTimeout(() => {
      setIsFading(true);
      const closeTimer = setTimeout(() => {
        setLoading(false);
        preloaderShown = true;
      }, 500);
      return () => clearTimeout(closeTimer);
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

  const handleVideoEnded = () => {
    setIsFading(true);
    setTimeout(() => {
      setLoading(false);
      preloaderShown = true;
    }, 500);
  };

  if (location.pathname.startsWith("/admin") || !loading) {
    return null;
  }

  return (
    <div
      style={{
        transition: "opacity 500ms ease-in-out",
        opacity: isFading ? 0 : 1,
      }}
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-white ${
        isFading ? "pointer-events-none" : "pointer-events-auto"
      }`}
    >
      <video
        src={motionLogo}
        autoPlay
        muted
        playsInline
        preload="auto"
        onEnded={handleVideoEnded}
        className="w-[85%] max-w-[700px] md:max-w-[950px] lg:max-w-[1140px] h-auto object-contain pointer-events-none select-none"
      />
    </div>
  );
};

export default Preloader;
