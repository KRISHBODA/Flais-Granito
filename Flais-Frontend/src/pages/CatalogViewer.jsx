import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import CatalogFlipBook from '../components/CatalogFlipBook';
import { resolveMediaUrl } from '../utils/imageOptimizer';

const CatalogViewer = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const pdfUrl = resolveMediaUrl(searchParams.get('pdf'));
  const title = searchParams.get('title') || 'Catalog';
  const flipPath = searchParams.get('flip') || '';

  const handleClose = () => {
    // If we can close the window/tab, close it. Otherwise, go back to catalog.
    try {
      window.close();
    } catch (e) {
      navigate('/catalog');
    }
  };

  if (!pdfUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-sans">
        <div className="text-center">
          <p className="text-lg font-semibold mb-4">No catalog PDF specified.</p>
          <button
            onClick={() => navigate('/catalog')}
            className="px-6 py-2.5 bg-beige-600 text-white rounded-lg font-bold hover:bg-beige-700 transition-colors"
          >
            Go to Catalogs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-zinc-950 relative overflow-hidden">
      <CatalogFlipBook
        pdfUrl={pdfUrl}
        flipPath={flipPath}
        catalogTitle={title}
        onClose={handleClose}
      />
    </div>
  );
};

export default CatalogViewer;
