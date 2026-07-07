import React, { useState, useEffect, useRef, useCallback, forwardRef } from 'react';
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

// Configure the PDF.js web worker via cdnjs CDN.
// The production server serves .mjs with wrong MIME type (application/octet-stream),
// so we use cdnjs which serves the correct Content-Type header.
pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;

// ── ForwardRef Page Wrapper ──────────────────────────────────────
// react-pageflip injects a ref into each child to manage DOM-level
// flip animations. Every child of HTMLFlipBook MUST forward its ref.
const FlipPage = forwardRef(({ pageNumber, width, height, isVisible }, ref) => {
  console.log('[CatalogFlipBook] Rendering FlipPage', {
    pageNumber,
    width,
    height,
    isVisible,
  });

  useEffect(() => {
    console.log('[CatalogFlipBook] ForwardRef page mounted', {
      pageNumber,
      width,
      height,
      isVisible,
    });
    return () => {
      console.log('[CatalogFlipBook] ForwardRef page unmounted', {
        pageNumber,
      });
    };
  }, [pageNumber, width, height, isVisible]);

  return (
    <div className="flipbook-page" ref={ref} style={{ width, height }}>
      {isVisible ? (
        <Page
          pageNumber={pageNumber}
          width={width}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          onLoadSuccess={(page) => {
            console.log('[CatalogFlipBook] Page onLoadSuccess', {
              pageNumber,
              page,
            });
          }}
          onLoadError={(error) => {
            console.log('[CatalogFlipBook] Page onLoadError', {
              pageNumber,
              error,
            });
          }}
          onRenderSuccess={(page) => {
            console.log('[CatalogFlipBook] Page onRenderSuccess', {
              pageNumber,
              page,
            });
          }}
          onRenderError={(error) => {
            console.log('[CatalogFlipBook] Page onRenderError', {
              pageNumber,
              error,
            });
          }}
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

  console.log('[CatalogFlipBook] Render', {
    pdfUrl,
    catalogTitle,
    numPages,
    currentPage,
    loadError,
    isFullscreen,
    zoom,
    dimensions,
  });

  useEffect(() => {
    console.log('[CatalogFlipBook] Component mounted', {
      pdfUrl,
      catalogTitle,
    });
    return () => {
      console.log('[CatalogFlipBook] Component unmounted', {
        pdfUrl,
        catalogTitle,
      });
    };
  }, []);

  useEffect(() => {
    console.log('[CatalogFlipBook] Received pdfUrl', {
      pdfUrl,
      typeofPdfUrl: typeof pdfUrl,
      isPdf: typeof pdfUrl === 'string' ? pdfUrl.toLowerCase().includes('.pdf') : false,
      isJpg: typeof pdfUrl === 'string' ? pdfUrl.toLowerCase().includes('.jpg') || pdfUrl.toLowerCase().includes('.jpeg') : false,
      isPng: typeof pdfUrl === 'string' ? pdfUrl.toLowerCase().includes('.png') : false,
      isUndefined: typeof pdfUrl === 'undefined',
    });
  }, [pdfUrl]);

  useEffect(() => {
    console.log('[CatalogFlipBook] Calculated dimensions', dimensions);
  }, [dimensions]);

  useEffect(() => {
    console.log('[CatalogFlipBook] numPages changed', numPages);
  }, [numPages]);

  useEffect(() => {
    console.log('[CatalogFlipBook] Current page changed', currentPage);
  }, [currentPage]);

  useEffect(() => {
    console.log('[CatalogFlipBook] fullscreen state changed', isFullscreen);
  }, [isFullscreen]);

  useEffect(() => {
    console.log('[CatalogFlipBook] zoom changed', zoom);
  }, [zoom]);

  useEffect(() => {
    if (numPages) {
      console.log('[CatalogFlipBook] HTMLFlipBook mounted', {
        numPages,
        currentPage,
        dimensions,
      });
    }
  }, [numPages, currentPage, dimensions]);

  // ── Recalculate on resize ──────────────────────────────────────
  useEffect(() => {
    const handleResize = () => {
      console.log('[CatalogFlipBook] window resize detected', {
        innerWidth: window.innerWidth,
        innerHeight: window.innerHeight,
        isFullscreen,
      });
      setDimensions(calcDimensions(isFullscreen));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFullscreen]);

  // ── Lock body scroll while modal is open ───────────────────────
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    console.log('[CatalogFlipBook] Lock body scroll while modal is open', {
      originalOverflow,
    });
    document.body.style.overflow = 'hidden';
    return () => {
      console.log('[CatalogFlipBook] Restore body scroll', {
        originalOverflow,
      });
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // ── Keyboard navigation ────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      console.log('[CatalogFlipBook] keydown', {
        key: e.key,
      });
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
  }, [onClose]);

  // ── PDF load callbacks ─────────────────────────────────────────
  const onDocumentLoadSuccess = useCallback(({ numPages: total }) => {
    console.log('[CatalogFlipBook] onLoadSuccess fired', {
      total,
      pdfUrl,
    });
    setNumPages(total);
    setLoadError(null);
  }, []);

  const onDocumentLoadError = useCallback((error) => {
    console.log('[CatalogFlipBook] onLoadError fired', {
      pdfUrl,
      error,
      errorString: error ? String(error) : null,
      stack: error?.stack,
    });
    setLoadError(error?.message || 'Failed to load the PDF document.');
  }, []);

  const onDocumentSourceError = useCallback((error) => {
    console.log('[CatalogFlipBook] onSourceError fired', {
      pdfUrl,
      error,
      errorString: error ? String(error) : null,
      stack: error?.stack,
    });
  }, [pdfUrl]);

  // ── Flip navigation ────────────────────────────────────────────
  const flipNext = () => {
    console.log('[CatalogFlipBook] flipNext invoked');
    flipBookRef.current?.pageFlip()?.flipNext();
  };

  const flipPrev = () => {
    console.log('[CatalogFlipBook] flipPrev invoked');
    flipBookRef.current?.pageFlip()?.flipPrev();
  };

  const onFlip = useCallback((e) => {
    console.log('[CatalogFlipBook] onPageChange / onFlip fired', e);
    setCurrentPage(e.data);
  }, []);

  // ── Zoom ───────────────────────────────────────────────────────
  const handleZoomIn = () => {
    console.log('[CatalogFlipBook] zoom in requested');
    setZoom((prev) => Math.min(prev + 0.2, 2.0));
  };

  const handleZoomOut = () => {
    console.log('[CatalogFlipBook] zoom out requested');
    setZoom((prev) => Math.max(prev - 0.2, 0.6));
  };

  // ── Fullscreen ─────────────────────────────────────────────────
  const toggleFullscreen = async () => {
    console.log('[CatalogFlipBook] fullscreen toggle requested', {
      currentIsFullscreen: isFullscreen,
      hasOverlayRef: !!overlayRef.current,
    });
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
      console.log('[CatalogFlipBook] fullscreenchange event', {
        fullscreenElement: !!document.fullscreenElement,
      });
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
    console.log('[CatalogFlipBook] overlay click', {
      targetIsCurrentTarget: e.target === e.currentTarget,
    });
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
            </div>
          }
          error={null}
        >
          {console.log('[CatalogFlipBook] Document rendered', {
            pdfUrl,
            numPages,
            loadError,
          })}
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
              {console.log('[CatalogFlipBook] Rendering FlipBook', {
                numPages,
                currentPage,
                dimensions,
              })}
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
                {console.log('[CatalogFlipBook] HTMLFlipBook branch active', {
                  numPages,
                  childrenCount: numPages,
                })}
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
                  onFlip={(e) => {
                    console.log('[CatalogFlipBook] HTMLFlipBook onFlip fired', e);
                    onFlip(e);
                  }}
                >
                  {Array.from({ length: numPages }, (_, i) => {
                    console.log('[CatalogFlipBook] Rendering page in map', {
                      pageNumber: i + 1,
                      currentPage,
                      isVisible: isPageVisible(i),
                    });
                    return (
                      <FlipPage
                        key={`page-${i + 1}`}
                        pageNumber={i + 1}
                        width={dimensions.pageWidth}
                        height={dimensions.pageHeight}
                        isVisible={isPageVisible(i)}
                      />
                    );
                  })}
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
