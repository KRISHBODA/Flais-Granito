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

    // Backup timer: fade out and unmount after 5 seconds
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
      className={`fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden bg-white ${
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
        className="w-[min(90vw,1080px)] max-h-[80vh] object-contain select-none pointer-events-none mix-blend-multiply"
      />
    </div>
  );
};

export default Preloader;
