import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import ScanHero from '../components/scan/ScanHero';
import QRScannerView from '../components/scan/QRScannerView';
import UploadQRView from '../components/scan/UploadQRView';
import ManualCodeView from '../components/scan/ManualCodeView';
import ProductScanResult from '../components/scan/ProductScanResult';
import ScanErrorView from '../components/scan/ScanErrorView';
import ScanInstructions from '../components/scan/ScanInstructions';
import { lookupProduct } from '../utils/qrScannerEngine';

const Scan = () => {
  const [searchParams] = useSearchParams();
  const [activeMode, setActiveMode] = useState('camera'); // 'camera' | 'upload' | 'manual'
  const [scanStatus, setScanStatus] = useState('IDLE'); // 'IDLE' | 'LOADING' | 'SUCCESS' | 'NOT_FOUND' | 'ERROR'
  const [product, setProduct] = useState(null);
  const [lastScannedCode, setLastScannedCode] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Core handler for looking up product from code or URL
  const handleProcessCode = useCallback(async (rawCode) => {
    if (!rawCode) return;

    setScanStatus('LOADING');
    setLastScannedCode(rawCode);
    setErrorMessage('');

    try {
      const foundProduct = await lookupProduct(rawCode);
      if (foundProduct) {
        setProduct(foundProduct);
        setScanStatus('SUCCESS');
      } else {
        setProduct(null);
        setScanStatus('NOT_FOUND');
        setErrorMessage("We couldn't find a FLAIS Granito product associated with this code. Please check the code or try scanning again.");
      }
    } catch (err) {
      setProduct(null);
      setScanStatus('ERROR');
      setErrorMessage(err.message || 'An unexpected error occurred while looking up the product. Please try again.');
    }
  }, []);

  // Handle URL query parameter auto-scan on initial mount (e.g. /scan?code=VERA+WHITE)
  useEffect(() => {
    const codeParam = searchParams.get('code') || searchParams.get('id');
    if (codeParam && codeParam.trim()) {
      handleProcessCode(codeParam.trim());
    }
  }, [searchParams, handleProcessCode]);

  // Reset to initial scan state
  const handleScanAnother = () => {
    setProduct(null);
    setScanStatus('IDLE');
    setErrorMessage('');
    setLastScannedCode('');
  };

  const handleRetry = () => {
    setProduct(null);
    setScanStatus('IDLE');
    setErrorMessage('');
  };

  const handleSelectMode = (mode) => {
    setActiveMode(mode);
    if (scanStatus === 'NOT_FOUND' || scanStatus === 'ERROR') {
      setScanStatus('IDLE');
      setErrorMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-white pt-28 sm:pt-32 pb-16 sm:pb-24 font-sans selection:bg-[#5D4037] selection:text-white">
      <SEO
        title="Scan Product"
        description="Scan your FLAIS Granito product QR code to explore product details, specifications and collection information."
        keywords="scan product, qr scanner, flais granito code, tile verification, vitrified tiles catalog"
      />

      <div className="container-custom">
        {/* Hero Section (Hidden when product is found to focus on product card) */}
        {scanStatus !== 'SUCCESS' && (
          <ScanHero
            activeMode={activeMode}
            onSelectMode={handleSelectMode}
          />
        )}

        {/* Dynamic Scanning Viewport / Result Area */}
        <div className="min-h-[420px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            {/* 1. LOADING STATE */}
            {scanStatus === 'LOADING' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="w-full max-w-xl mx-auto bg-white rounded-3xl border border-zinc-200 shadow-sm p-12 text-center"
              >
                <div className="flex flex-col items-center space-y-5">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 rounded-full border-4 border-[#5D4037]/10" />
                    <div className="absolute inset-0 rounded-full border-4 border-t-[#5D4037] border-l-[#C0A060] animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-bold text-zinc-900 mb-1">
                      Verifying Product
                    </h3>
                    <p className="text-xs text-zinc-500 font-light">
                      Retrieving authentic specifications from FLAIS Granito catalog...
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. SUCCESS STATE: PRODUCT RESULT CARD */}
            {scanStatus === 'SUCCESS' && product && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full"
              >
                <ProductScanResult
                  product={product}
                  onScanAnother={handleScanAnother}
                />
              </motion.div>
            )}

            {/* 3. NOT FOUND / ERROR STATE */}
            {(scanStatus === 'NOT_FOUND' || scanStatus === 'ERROR') && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="w-full"
              >
                <ScanErrorView
                  title={scanStatus === 'NOT_FOUND' ? 'Product Not Found' : 'Lookup Unavailable'}
                  message={errorMessage}
                  onRetry={handleRetry}
                  onSwitchToManual={() => {
                    handleRetry();
                    setActiveMode('manual');
                  }}
                />
              </motion.div>
            )}

            {/* 4. IDLE SCANNING MODES */}
            {scanStatus === 'IDLE' && (
              <motion.div
                key={activeMode}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {activeMode === 'camera' && (
                  <QRScannerView
                    onCodeDetected={handleProcessCode}
                    onSwitchToUpload={() => setActiveMode('upload')}
                    onSwitchToManual={() => setActiveMode('manual')}
                    isScanningActive={scanStatus === 'IDLE'}
                  />
                )}

                {activeMode === 'upload' && (
                  <UploadQRView
                    onCodeDetected={handleProcessCode}
                  />
                )}

                {activeMode === 'manual' && (
                  <ManualCodeView
                    onSubmitCode={handleProcessCode}
                    isLoading={scanStatus === 'LOADING'}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Informative Instructions & Authentic Craftsmanship Section */}
        <ScanInstructions />
      </div>
    </div>
  );
};

export default Scan;
