import React, { useState, useEffect, useMemo, useRef, useCallback, forwardRef } from 'react';
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
  Download,
} from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import './CatalogFlipBook.css';
import { resolveMediaUrl } from '../utils/imageOptimizer';

const ASSETS_BASE_URL = import.meta.env.BASE_URL || '/';

// Configure the PDF.js web worker and WASM/ICC asset base paths.
// Use Vite BASE_URL so URLs are correct when the app is hosted under a subpath.
pdfjs.GlobalWorkerOptions.workerSrc = `${ASSETS_BASE_URL}pdf.worker.min.js`;

// ── Storage URL for resolving flipbook image paths ───────────────
const getStorageBaseUrl = () => {
  const hostname = typeof window !== 'undefined' ? window.location.hostname : '';
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  if (origin && hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
    return `${origin}/media`;
  }

  if (import.meta.env.VITE_STORAGE_URL) {
    return import.meta.env.VITE_STORAGE_URL.trim().replace(/\/$/, '');
  }
  const envUrl = import.meta.env.VITE_BACKEND_URL ? import.meta.env.VITE_BACKEND_URL.trim().replace(/\/$/, '') : '';
  const runtimeUrl = hostname && hostname !== 'localhost' && hostname !== '127.0.0.1'
    ? `http://${hostname}:8000`
    : 'http://localhost:8000';

  let backendUrl = 'http://localhost:8000';
  if (!envUrl) {
    backendUrl = runtimeUrl;
  } else if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1' && (envUrl.includes('localhost') || envUrl.includes('127.0.0.1'))) {
    backendUrl = runtimeUrl;
  } else {
    backendUrl = envUrl;
  }

  return `${backendUrl}/media`;
};
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

// ── ForwardRef Image Page Wrapper (for pre-rendered flipbooks) ───
// Used when flipPath is available — renders a lightweight <img> instead
// of the heavy react-pdf <Page> canvas.
const FlipPageImage = forwardRef(({ src, pageNumber, width, height, isVisible }, ref) => {
  return (
    <div className="flipbook-page" ref={ref} style={{ width, height }}>
      {isVisible ? (
        <img
          src={src}
          alt={`Page ${pageNumber}`}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          loading="lazy"
          draggable={false}
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

FlipPageImage.displayName = 'FlipPageImage';

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
const CatalogFlipBook = ({ pdfUrl, flipPath, catalogTitle, onClose }) => {
  const resolvedPdfUrl = useMemo(() => resolveMediaUrl(pdfUrl), [pdfUrl]);
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [loadError, setLoadError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [dimensions, setDimensions] = useState(() => calcDimensions(false));

  // ── Pre-rendered flipbook state ──────────────────────────────────
  const [flipManifest, setFlipManifest] = useState(null);
  const [flipMode, setFlipMode] = useState(false); // true = use images, false = use react-pdf
  const [flipLoading, setFlipLoading] = useState(!!flipPath);
  const [documentSource, setDocumentSource] = useState(resolvedPdfUrl);
  const [isPdfReady, setIsPdfReady] = useState(false);

  const flipBookRef = useRef(null);
  const options = useMemo(
    () => ({
      useWasm: true,
      useWorkerFetch: true,
      wasmUrl: ASSETS_BASE_URL,
      iccUrl: ASSETS_BASE_URL,
    }),
    []
  );
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

  const [_downloadProgress, setDownloadProgress] = useState(0);
  const [_loadingStage, setLoadingStage] = useState('Connecting');
  const [showLoader, setShowLoader] = useState(true);

  const STAGE_ORDER = [
    'Connecting',
    'Downloading PDF',
    'Preparing Pages',
    'Rendering First Page',
  ];
  // Detailed stage UI removed — loader simplified to a spinner and 'Loading...'.

  // ── Prefetch PDF as a blob to avoid browser-native download handling ──
  useEffect(() => {
    if (!resolvedPdfUrl) {
      setDocumentSource('');
      setIsPdfReady(false);
      return;
    }

    let cancelled = false;
    let objectUrl = '';

    setIsPdfReady(false);
    setDocumentSource(resolvedPdfUrl);

    fetch(resolvedPdfUrl, {
      mode: 'cors',
      credentials: 'omit',
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`PDF fetch failed: ${response.status}`);
        }
        return response.blob();
      })
      .then((blob) => {
        if (cancelled) return;
        objectUrl = window.URL.createObjectURL(blob);
        setDocumentSource(objectUrl);
        setIsPdfReady(true);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[CatalogFlipBook] Blob prefetch failed, using direct PDF URL:', err.message);
        setDocumentSource(resolvedPdfUrl);
        setIsPdfReady(true);
      });

    return () => {
      cancelled = true;
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl);
      }
    };
  }, [resolvedPdfUrl]);

  // ── Load flipbook manifest if flipPath is provided ─────────────
  useEffect(() => {
    if (!flipPath) {
      setFlipMode(false);
      setFlipLoading(false);
      return;
    }

    let cancelled = false;
    const storageBase = getStorageBaseUrl();
    const manifestUrl = `${storageBase}/${flipPath}/manifest.json`;

    setFlipLoading(true);
    fetch(manifestUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`Manifest fetch failed: ${res.status}`);
        return res.json();
      })
      .then((manifest) => {
        if (cancelled) return;
        setFlipManifest(manifest);
        setNumPages(manifest.totalPages);
        setFlipMode(true);
        setFlipLoading(false);
        setShowLoader(false);
        console.log(`[CatalogFlipBook] Flipbook manifest loaded: ${manifest.totalPages} pages`);
      })
      .catch((err) => {
        if (cancelled) return;
        console.warn('[CatalogFlipBook] Flipbook manifest failed, falling back to PDF:', err.message);
        setFlipMode(false);
        setFlipLoading(false);
        // Fall through to normal PDF rendering
      });

    return () => { cancelled = true; };
  }, [flipPath]);

  // ── Recalculate on resize ──────────────────────────────────────
  useEffect(() => {
    const handleResize = () => setDimensions(calcDimensions(isFullscreen));
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  useEffect(() => {
    if (!isPdfReady || !documentSource) return;

    loadMetricsRef.current = {
      start: performance.now(),
      documentLoaded: 0,
      firstPageRendered: 0,
      progressLastPct: 0,
    };
    displayProgressRef.current = 0;

    const resetTimer = window.setTimeout(() => {
      setDownloadProgress(0);
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

    console.log('[CatalogFlipBook] PDF load started:', documentSource);
    return () => window.clearTimeout(resetTimer);
  }, [documentSource, isPdfReady]);

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

    // downloadedMB/totalMB removed — keeping progress percent only

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
    setShowLoader(false);
  }, []);

  const onDocumentSourceError = useCallback((error) => {
    console.error('[CatalogFlipBook] Source error', error);
    setLoadError(error?.message || 'Failed to load the PDF source file.');
    setShowLoader(false);
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

  // Progress smoothing removed — loader shows a simple spinner only.

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
        {/* ── Mode A: Pre-rendered Image Flipbook ──────────────────── */}
        {flipMode && flipManifest ? (
          <>
            {numPages ? (
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
                    {flipManifest.pages.map((filename, i) => (
                      <FlipPageImage
                        key={`flip-${i + 1}`}
                        src={`${getStorageBaseUrl()}/${flipPath}/${filename}`}
                        pageNumber={i + 1}
                        width={dimensions.pageWidth}
                        height={dimensions.pageHeight}
                        isVisible={isPageVisible(i)}
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
          </>
        ) : !isPdfReady ? (
          <div className="flipbook-loading">
            <div className="flipbook-loading-spinner">
              <div className="ring-outer" />
              <div className="ring-inner" />
            </div>
            <span className="flipbook-loading-text">Loading Catalog</span>
            <span className="flipbook-loading-subtext">Preparing your flipbook experience…</span>
          </div>
        ) : (
          /* ── Mode B: Original PDF.js Flipbook (fallback) ──────── */
          <Document
            file={documentSource}
            options={options}
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
                <div className="flex flex-wrap gap-4 justify-center mt-2">
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
                  <a
                    href={resolvedPdfUrl}
                    download
                    className="flipbook-download-btn"
                  >
                    <Download size={16} />
                    Download PDF
                  </a>
                </div>
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
                <div className="flex flex-wrap gap-4 justify-center mt-2">
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
                  <a
                    href={resolvedPdfUrl}
                    download
                    className="flipbook-download-btn"
                  >
                    <Download size={16} />
                    Download PDF
                  </a>
                </div>
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
        )}

        <AnimatePresence>
          {showLoader && !flipMode && (
            <motion.div
              className="flipbook-loading-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              <motion.div
                className="flipbook-loading-card simple-loader"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="simple-spinner" aria-hidden="true" />
                <p className="simple-loading-text">Loading...</p>
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
