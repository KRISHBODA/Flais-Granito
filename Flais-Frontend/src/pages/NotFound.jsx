import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NotFound = () => {
  const location = useLocation();
  const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '') || '';

  useEffect(() => {
    // If the path looks like a file (e.g. .pdf, .jpg, .png), redirect to backend
    if (location.pathname.match(/\.[a-zA-Z0-9]+$/)) {
      window.location.replace(`${backendUrl}${location.pathname}`);
    }
  }, [location, backendUrl]);

  // If it's a file, we are redirecting, so show a loading state
  if (location.pathname.match(/\.[a-zA-Z0-9]+$/)) {
    return (
      <div className="w-full h-[60vh] flex flex-col items-center justify-center bg-white px-6">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-4 border-[#5D4037]/10" />
            <div className="absolute inset-0 rounded-full border-4 border-t-[#5D4037] border-l-[#c5a880] animate-spin" />
          </div>
          <p className="text-sm font-sans font-medium text-[#5D4037]/80 animate-pulse">
            Loading file...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-[#5D4037] mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
      <p className="text-gray-600 mb-8 max-w-md">
        The page or file you are looking for doesn't exist or has been moved.
      </p>
      <a 
        href="/"
        className="px-8 py-3 bg-[#5D4037] text-white rounded hover:bg-[#4a332c] transition-colors"
      >
        Return Home
      </a>
    </div>
  );
};

export default NotFound;
