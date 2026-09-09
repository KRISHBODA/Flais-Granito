import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { detectQrFromImageFile } from '../../utils/qrScannerEngine';

const UploadQRView = ({ onCodeDetected }) => {
  const fileInputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadError, setUploadError] = useState('');

  const processFile = async (file) => {
    if (!file) return;

    setUploadError('');
    setProcessing(true);

    // Create a local blob preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const detectedCode = await detectQrFromImageFile(file);
      if (detectedCode) {
        onCodeDetected(detectedCode);
      }
    } catch (err) {
      setUploadError(err.message || 'Could not detect a QR code in this image. Please try another photo.');
    } finally {
      setProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const resetUpload = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setUploadError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !processing && fileInputRef.current?.click()}
        className={`relative min-h-[340px] sm:min-h-[380px] rounded-3xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center p-8 text-center cursor-pointer select-none bg-white ${
          dragOver
            ? 'border-[#5D4037] bg-[#FAF8F5] scale-[1.01]'
            : 'border-zinc-300 hover:border-[#5D4037]/60 hover:bg-[#FAF8F5]/40 shadow-sm'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/jpg"
          onChange={handleFileChange}
          className="hidden"
        />

        {processing ? (
          <div className="flex flex-col items-center space-y-4">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-[#5D4037]/10" />
              <div className="absolute inset-0 rounded-full border-4 border-t-[#5D4037] border-l-[#C0A060] animate-spin" />
            </div>
            <div>
              <p className="text-base font-display font-semibold text-zinc-900">
                Reading QR code...
              </p>
              <p className="text-xs text-zinc-500 mt-1">Analyzing image pixels client-side</p>
            </div>
          </div>
        ) : previewUrl && uploadError ? (
          <div className="flex flex-col items-center space-y-4 max-w-md">
            <div className="relative w-28 h-28 rounded-2xl overflow-hidden border border-zinc-200 shadow-sm">
              <img src={previewUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
            </div>

            <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-4 py-2 rounded-xl text-xs border border-amber-200/60">
              <AlertCircle size={16} className="shrink-0" />
              <span>{uploadError}</span>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                resetUpload();
              }}
              className="px-5 py-2.5 bg-[#5D4037] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#4a332c] transition-colors shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={14} />
              Choose Another Image
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] border border-[#D2C9B1]/60 text-[#5D4037] flex items-center justify-center shadow-inner">
              <UploadCloud size={30} />
            </div>

            <div>
              <p className="text-base font-display font-semibold text-zinc-900">
                Drag & drop your QR image here
              </p>
              <p className="text-xs text-zinc-500 mt-1">
                or click to browse from your device
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-medium uppercase tracking-wider pt-2">
              <span>Supports JPG, PNG, WEBP</span>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-zinc-500 font-light">
          Take a clear photo of the QR code printed on the tile surface or packaging box.
        </p>
      </div>
    </div>
  );
};

export default UploadQRView;
