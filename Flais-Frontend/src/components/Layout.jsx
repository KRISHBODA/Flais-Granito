import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';

const Layout = ({ children }) => {
  const { pathname } = useLocation();

  const isViewerPage = pathname.startsWith('/catalog/view');

  if (isViewerPage) {
    return (
      <div className="flex flex-col min-h-screen bg-zinc-950">
        <Toaster position="top-right" />
        <main className="flex-grow">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-right" />
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
};

export default Layout;
