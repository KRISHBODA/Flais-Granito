import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const NotFound = () => {
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
