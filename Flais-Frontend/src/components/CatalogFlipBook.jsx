import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import HTMLFlipBook from 'react-pageflip';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  RotateCcw,
  AlertTriangle,
} from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './CatalogFlipBook.css';

// Configure the PDF.js web worker from /public (same-origin, .js extension).
// CSP blocks external CDNs and blob workers; the server misserves .mjs files.
// The worker file is copied from node_modules/pdfjs-dist/build/pdf.worker.min.mjs
// to public/pdf.worker.min.js during setup.
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
// ── ForwardRef Page Wrapper ──────────────────────────────────────
// react-pageflip injects a ref into each child to manage DOM-level
// flip animations. Every child of HTMLFlipBook MUST forward its ref.
const FlipPage = forwardRef(
  ({ pageNumber, width, height, isVisible, onRenderSuccess, onRenderError }, ref) => {
    return (
      <div className="flipbook-page" ref={ref} style={{ width, height }}>
        {isVisible ? (
          <Page
            pageNumber={pageNumber}
            width={width}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            onRenderSuccess={() => onRenderSuccess?.(pageNumber)}
            onRenderError={(error) => onRenderError?.(pageNumber, error)}
            loading={
              <div className="flipbook-page-loading">
                <div className="page-spinner" />
                <span>Page {pageNumber}</span>
              </div>
            }
          />
        ) : (
        <div className="flipbook-page-loading">
          <div className="page-spinner" />
          <span>Page {pageNumber}</span>
        </div>
      )}
    </div>
  );
});

FlipPage.displayName = 'FlipPage';

// ── Dimension Calculator ─────────────────────────────────────────
// Returns page dimensions that fit within the available viewport
// while maintaining a standard page aspect ratio (~0.707 for A4).
const PAGE_ASPECT_RATIO = 1.414; // height / width (A4 standard)

function calcDimensions(isFullscreen) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const isMobile = vw < 640;
  const isTablet = vw >= 640 && vw < 1024;

  // Reserve space for header (60px) + toolbar (60px) + padding
  const availHeight = vh - (isFullscreen ? 140 : 160);
  const availWidth = vw - (isMobile ? 24 : isTablet ? 60 : 120);

  // On mobile, show single page; on desktop/tablet show two-page spread
  const pageCountVisible = isMobile ? 1 : 2;
  const maxTotalWidth = availWidth;
  const maxPageWidth = Math.floor(maxTotalWidth / pageCountVisible);
  const maxPageHeight = availHeight;

  // Calculate from height constraint
  let pageWidth = Math.floor(maxPageHeight / PAGE_ASPECT_RATIO);
  let pageHeight = maxPageHeight;

  // If width-constrained, recalculate
  if (pageWidth > maxPageWidth) {
    pageWidth = maxPageWidth;
    pageHeight = Math.floor(pageWidth * PAGE_ASPECT_RATIO);
  }

  // Enforce minimums
  pageWidth = Math.max(pageWidth, 180);
  pageHeight = Math.max(pageHeight, 250);

  return {
    pageWidth,
    pageHeight,
    isMobile,
    showCover: true,
  };
}

// ── Main Component ───────────────────────────────────────────────
const CatalogFlipBook = ({ pdfUrl, catalogTitle, onClose }) => {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dimensions, setDimensions] = useState(() => calcDimensions(false));

  const flipBookRef = useRef(null);
  const overlayRef = useRef(null);
  const loadMetricsRef = useRef({
    start: 0,
    documentLoaded: 0,
    firstPageRendered: 0,
    progressLastPct: 0,
  });
  const stageTimeoutRef = useRef(null);
  const hideLoaderTimeoutRef = useRef(null);
  const displayProgressRef = useRef(0);

  const [downloadProgress, setDownloadProgress] = useState(0);
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [downloadedMB, setDownloadedMB] = useState(0);
  const [totalMB, setTotalMB] = useState(0);
  const [loadingStage, setLoadingStage] = useState('Connecting');
  const [showLoader, setShowLoader] = useState(true);

  const STAGE_ORDER = [
    'Connecting',
    'Downloading PDF',
    'Preparing Pages',
    'Rendering First Page',
  ];

  const formatMB = (value) => {
    if (value === null || value === undefined || Number.isNaN(value)) {
      return '-- MB';
    }
    const mb = Number(value);
    return mb < 10 ? `${mb.toFixed(1)} MB` : `${Math.round(mb)} MB`;
  };

  const getStageState = (stage) => {
    if (loadingStage === 'Loaded') {
      return 'complete';
    }

    const currentIndex = STAGE_ORDER.indexOf(loadingStage);
    const stageIndex = STAGE_ORDER.indexOf(stage);

    if (stageIndex < currentIndex) return 'complete';
    if (stageIndex === currentIndex) return 'active';
    return 'pending';
  };

  const getStageItems = () => [
    { label: 'Connecting...', key: 'Connecting' },
    { label: 'Downloading PDF...', key: 'Downloading PDF' },
    { label: 'Preparing Pages...', key: 'Preparing Pages' },
    { label: 'Rendering First Page...', key: 'Rendering First Page' },
  ];

  const getDisplayedProgress = () => Math.max(0, Math.min(100, Math.round(animatedProgress)));

  // ── Recalculate on resize ──────────────────────────────────────
  useEffect(() => {
    const handleResize = () => setDimensions(calcDimensions(isFullscreen));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  useEffect(() => {
    if (!pdfUrl) return;

    loadMetricsRef.current = {
      start: performance.now(),
      documentLoaded: 0,
      firstPageRendered: 0,
      progressLastPct: 0,
    };
    displayProgressRef.current = 0;

    const resetTimer = window.setTimeout(() => {
      setDownloadProgress(0);
      setAnimatedProgress(0);
      setDownloadedMB(0);
      setTotalMB(0);
      setLoadingStage('Connecting');
      setShowLoader(true);
    }, 0);

    if (hideLoaderTimeoutRef.current) {
      window.clearTimeout(hideLoaderTimeoutRef.current);
      hideLoaderTimeoutRef.current = null;
    }
    if (stageTimeoutRef.current) {
      window.clearTimeout(stageTimeoutRef.current);
      stageTimeoutRef.current = null;
    }

    console.log('[CatalogFlipBook] PDF load started:', pdfUrl);
    return () => window.clearTimeout(resetTimer);
  }, [pdfUrl]);

  // ── Lock body scroll while modal is open ───────────────────────
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // ── Flip navigation ────────────────────────────────────────────
  const flipNext = useCallback(() => {
    flipBookRef.current?.pageFlip()?.flipNext();
  }, []);

  const flipPrev = useCallback(() => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const onFlip = useCallback((e) => {
    setCurrentPage(e.data);
  }, []);

  // ── Keyboard navigation ────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowRight') {
        flipNext();
        return;
      }
      if (e.key === 'ArrowLeft') {
        flipPrev();
        return;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, flipNext, flipPrev]);

  // ── PDF load callbacks ─────────────────────────────────────────
  const onDocumentLoadProgress = useCallback((progress) => {
    const loaded = progress?.loaded ?? 0;
    const total = progress?.total ?? 0;
    const percent = total ? Math.min(100, Math.round((loaded / total) * 100)) : 0;

    setDownloadProgress((prev) => {
      if (prev === percent) return prev;
      return percent;
    });

    setDownloadedMB(loaded / 1024 / 1024);
    setTotalMB(total ? total / 1024 / 1024 : null);

    setLoadingStage((prev) => {
      if (loaded > 0 && prev === 'Connecting') {
        return 'Downloading PDF';
      }
      if (percent === 100 && prev !== 'Loaded') {
        return 'Preparing Pages';
      }
      return prev;
    });

    if (percent >= loadMetricsRef.current.progressLastPct + 10 || percent === 100) {
      loadMetricsRef.current.progressLastPct = percent;
      console.log(`[CatalogFlipBook] Document load progress: ${percent}%`);
    }
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages: total }) => {
    setNumPages(total);
    setLoadError(null);
    setLoadingStage((prev) => (prev === 'Loaded' ? 'Loaded' : 'Preparing Pages'));

    if (stageTimeoutRef.current) {
      window.clearTimeout(stageTimeoutRef.current);
    }
    stageTimeoutRef.current = window.setTimeout(() => {
      setLoadingStage((prev) =>
        prev === 'Preparing Pages' || prev === 'Downloading PDF'
          ? 'Rendering First Page'
          : prev
      );
    }, 300);

    const now = performance.now();
    const elapsed = loadMetricsRef.current.start
      ? Math.round(now - loadMetricsRef.current.start)
      : null;
    loadMetricsRef.current.documentLoaded = now;
    console.log(
      `[CatalogFlipBook] Document loaded (${total} pages)` +
        (elapsed !== null ? ` in ${elapsed}ms` : '')
    );
  }, []);

  const onDocumentLoadError = useCallback((error) => {
    console.error('[CatalogFlipBook] Load error', error);
    setLoadError(error?.message || 'Failed to load the PDF document.');
  }, []);

  const onDocumentSourceError = useCallback((error) => {
    console.error('[CatalogFlipBook] Source error', error);
  }, []);

  const onPageRenderSuccess = useCallback((pageNumber) => {
    console.log(`[CatalogFlipBook] Page ${pageNumber} rendered`);
    if (pageNumber === 1 && !loadMetricsRef.current.firstPageRendered) {
      const now = performance.now();
      const elapsed = loadMetricsRef.current.start
        ? Math.round(now - loadMetricsRef.current.start)
        : null;
      loadMetricsRef.current.firstPageRendered = now;
      setLoadingStage('Loaded');
      setDownloadProgress(100);
      hideLoaderTimeoutRef.current = window.setTimeout(() => {
        setShowLoader(false);
      }, 360);
      console.log(
        `[CatalogFlipBook] First page rendered` +
          (elapsed !== null ? ` in ${elapsed}ms` : '')
      );
    }
  }, []);

  const onPageRenderError = useCallback((pageNumber, error) => {
    console.error(`[CatalogFlipBook] Page ${pageNumber} render error`, error);
  }, []);

  useEffect(() => {
    if (!showLoader) {
      return;
    }

    let rafId = 0;
    const animateProgress = () => {
      const current = displayProgressRef.current;
      const next = current + (downloadProgress - current) * 0.16;
      const smoothed = Math.abs(downloadProgress - next) < 0.25 ? downloadProgress : next;

      displayProgressRef.current = smoothed;
      setAnimatedProgress(smoothed);

      if (Math.abs(downloadProgress - smoothed) >= 0.25) {
        rafId = requestAnimationFrame(animateProgress);
      }
    };

    rafId = requestAnimationFrame(animateProgress);
    return () => window.cancelAnimationFrame(rafId);
  }, [downloadProgress, showLoader]);

  useEffect(() => {
    return () => {
      if (stageTimeoutRef.current) {
        window.clearTimeout(stageTimeoutRef.current);
      }
      if (hideLoaderTimeoutRef.current) {
        window.clearTimeout(hideLoaderTimeoutRef.current);
      }
    };
  }, []);

  // ── Zoom ───────────────────────────────────────────────────────
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 0.6));
  };

  // ── Fullscreen ─────────────────────────────────────────────────
  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await overlayRef.current?.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch {
      // Fullscreen not supported — toggle internal flag for layout
      setIsFullscreen((prev) => !prev);
    }
  };

  useEffect(() => {
    const handleFSChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFSChange);
    return () => document.removeEventListener('fullscreenchange', handleFSChange);
  }, []);

  // ── Lazy visibility: render only pages near the current spread ─
  const isPageVisible = (pageIndex) => {
    const BUFFER = 3; // render ±3 pages around current
    return Math.abs(pageIndex - currentPage) <= BUFFER;
  };

  // ── Displayed page number(s) ───────────────────────────────────
  const getDisplayedPages = () => {
    if (!numPages) return '';
    if (dimensions.isMobile) {
      return `Page ${currentPage + 1} of ${numPages}`;
    }
    // In double-page mode, show the current spread
    const left = currentPage + 1;
    const right = Math.min(currentPage + 2, numPages);
    if (left === right) return `Page ${left} of ${numPages}`;
    return `${left}–${right} of ${numPages}`;
  };

  // ── Close on overlay click (not on book) ───────────────────────
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div
      ref={overlayRef}
      className={`flipbook-overlay${isFullscreen ? ' is-fullscreen' : ''}`}
      onClick={handleOverlayClick}
    >
      {/* Header */}
      <div className="flipbook-header">
        <span className="flipbook-header-title">
          {catalogTitle || 'Catalog Viewer'}
        </span>
        <button
          className="flipbook-close-btn"
          onClick={onClose}
          title="Close (Esc)"
          aria-label="Close viewer"
        >
          <X size={20} />
        </button>
      </div>

      {/* Book Area */}
      <div className="flipbook-container" onClick={handleOverlayClick}>
        <Document
          file={pdfUrl}
          options={{
            useWasm: true,
            useWorkerFetch: true,
            wasmUrl: '/',
            iccUrl: '/',
          }}
          onLoadProgress={onDocumentLoadProgress}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          onSourceError={onDocumentSourceError}
          loading={
            <div className="flipbook-loading">
              <div className="flipbook-loading-spinner">
                <div className="ring-outer" />
                <div className="ring-inner" />
              </div>
              <span className="flipbook-loading-text">Loading Catalog</span>
              <span className="flipbook-loading-subtext">Preparing your flipbook experience…</span>
            </div>
          }
          error={
            <div className="flipbook-error">
              <div className="flipbook-error-icon">
                <AlertTriangle size={28} />
              </div>
              <p className="flipbook-error-title">Unable to Load PDF</p>
              <p className="flipbook-error-message">Something went wrong. Please try again.</p>
              <button
                className="flipbook-retry-btn"
                onClick={() => {
                  setLoadError(null);
                  setNumPages(null);
                }}
              >
                <RotateCcw size={16} />
                Try Again
              </button>
            </div>
          }
        >
          {loadError ? (
            <div className="flipbook-error">
              <div className="flipbook-error-icon">
                <AlertTriangle size={28} />
              </div>
              <p className="flipbook-error-title">Unable to Load PDF</p>
              <p className="flipbook-error-message">{loadError}</p>
              <button
                className="flipbook-retry-btn"
                onClick={() => {
                  setLoadError(null);
                  setNumPages(null);
                }}
              >
                <RotateCcw size={16} />
                Try Again
              </button>
            </div>
          ) : numPages ? (
            <>
              {/* Side navigation arrows */}
              <button
                className="flipbook-nav-arrow prev"
                onClick={flipPrev}
                disabled={currentPage === 0}
                title="Previous page"
                aria-label="Previous page"
              >
                <ChevronLeft size={22} />
              </button>

              <div
                className="flipbook-book-wrapper"
                style={{ transform: `scale(${zoom})` }}
              >
                <HTMLFlipBook
                  ref={flipBookRef}
                  width={dimensions.pageWidth}
                  height={dimensions.pageHeight}
                  size="fixed"
                  minWidth={180}
                  minHeight={250}
                  maxWidth={800}
                  maxHeight={1130}
                  showCover={dimensions.showCover}
                  mobileScrollSupport={true}
                  usePortrait={dimensions.isMobile}
                  onFlip={onFlip}
                  flippingTime={600}
                  useMouseEvents={true}
                  swipeDistance={30}
                  showPageCorners={true}
                  maxShadowOpacity={0.4}
                  drawShadow={true}
                  className="flipbook-stpageflip"
                  startPage={0}
                  autoSize={false}
                >
                  {Array.from({ length: numPages }, (_, i) => (
                    <FlipPage
                      key={`page-${i + 1}`}
                      pageNumber={i + 1}
                      width={dimensions.pageWidth}
                      height={dimensions.pageHeight}
                      isVisible={isPageVisible(i)}
                      onRenderSuccess={onPageRenderSuccess}
                      onRenderError={onPageRenderError}
                    />
                  ))}
                </HTMLFlipBook>
              </div>

              <button
                className="flipbook-nav-arrow next"
                onClick={flipNext}
                disabled={numPages && currentPage >= numPages - 1}
                title="Next page"
                aria-label="Next page"
              >
                <ChevronRight size={22} />
              </button>
            </>
          ) : null}
        </Document>

        <AnimatePresence>
          {showLoader && (
            <motion.div
              className="flipbook-loading-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
            >
              <motion.div
                className="flipbook-loading-card"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flipbook-loading-badge">
                  <div className="ring-outer">
                    <div className="ring-inner" />
                  </div>
                </div>

                <div className="flipbook-loading-headline">
                  <div>
                    <p className="flipbook-loading-title">Loading Catalog</p>
                    <p className="flipbook-loading-note">A premium PDF experience is being prepared.</p>
                  </div>
                  <span className="flipbook-loading-percentage">
                    {getDisplayedProgress()}%
                  </span>
                </div>

                <div className="flipbook-loading-meta">
                  {formatMB(downloadedMB)} / {formatMB(totalMB)}
                </div>

                <div className="flipbook-progress-track">
                  <motion.div
                    className="flipbook-progress-fill"
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.max(0, Math.min(100, animatedProgress))}%` }}
                    transition={{ duration: 0.35, ease: 'easeOut' }}
                  />
                </div>

                <div className="flipbook-stage-list">
                  {getStageItems().map((stage) => {
                    const state = getStageState(stage.key);
                    return (
                      <motion.div
                        key={stage.key}
                        className={`stage-item ${state}`}
                        layout
                        initial={{ opacity: 0.8, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="stage-state">
                          {state === 'complete' ? '✓' : state === 'active' ? '⏳' : '•'}
                        </div>
                        <div>
                          <p className="stage-label">{stage.label}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Toolbar */}
      {numPages && !loadError && (
        <div className="flipbook-toolbar">
          {/* Navigation */}
          <button
            className="flipbook-toolbar-btn"
            onClick={flipPrev}
            disabled={currentPage === 0}
            title="Previous page"
            aria-label="Previous page"
          >
            <ChevronLeft size={18} />
          </button>

          <span className="flipbook-page-indicator">{getDisplayedPages()}</span>

          <button
            className="flipbook-toolbar-btn"
            onClick={flipNext}
            disabled={currentPage >= numPages - 1}
            title="Next page"
            aria-label="Next page"
          >
            <ChevronRight size={18} />
          </button>

          <div className="flipbook-toolbar-divider" />

          {/* Zoom */}
          <button
            className="flipbook-toolbar-btn"
            onClick={handleZoomOut}
            disabled={zoom <= 0.6}
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          <button
            className="flipbook-toolbar-btn"
            onClick={handleZoomIn}
            disabled={zoom >= 2.0}
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn size={18} />
          </button>

          <div className="flipbook-toolbar-divider" />

          {/* Fullscreen */}
          <button
            className="flipbook-toolbar-btn"
            onClick={toggleFullscreen}
            title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>
        </div>
      )}
    </div>
  );
};

export default CatalogFlipBook;
