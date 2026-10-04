import React from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppButton from './WhatsAppButton';
import AnalyticsTracker from './AnalyticsTracker';
import RouteSeo from './RouteSeo';

const Layout = ({ children }) => {
  const { pathname } = useLocation();

  const isViewerPage = pathname.startsWith('/catalog/view');
  const isSmartpage = pathname.startsWith('/box-countertop-15mm');

  if (isViewerPage || isSmartpage) {
    return (
      <div className={`flex flex-col min-h-screen ${isViewerPage ? 'bg-zinc-950' : ''}`}>
        <Toaster position="top-right" />
        <RouteSeo />
        <AnalyticsTracker />
        <main className="flex-grow">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster position="top-right" />
      <RouteSeo />
      <AnalyticsTracker />
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
