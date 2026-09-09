import jsQR from 'jsqr';
import api from './api';

/**
 * Normalizes scanned raw text.
 * Handles full URLs (e.g. https://www.flaisgranito.com/products/vera-whit),
 * path routes (/products/vera-whit), and raw product codes/titles.
 */
export const parseScannedText = (rawText) => {
  if (!rawText || typeof rawText !== 'string') {
    return { rawText: '', code: '', isUrl: false, directUrl: null };
  }

  const trimmed = rawText.trim();
  let code = trimmed;
  let isUrl = false;
  let directUrl = null;

  // Check if text is a URL
  try {
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      isUrl = true;
      directUrl = trimmed;
      const parsedUrl = new URL(trimmed);
      const pathname = parsedUrl.pathname;
      const productMatch = pathname.match(/\/products\/([^/?#]+)/i);
      if (productMatch && productMatch[1]) {
        code = decodeURIComponent(productMatch[1].trim());
      } else {
        // Look for code query parameter if present
        const codeParam = parsedUrl.searchParams.get('code') || parsedUrl.searchParams.get('id');
        if (codeParam) {
          code = codeParam.trim();
        }
      }
    } else if (trimmed.startsWith('/products/')) {
      const productMatch = trimmed.match(/\/products\/([^/?#]+)/i);
      if (productMatch && productMatch[1]) {
        code = decodeURIComponent(productMatch[1].trim());
      }
    }
  } catch (e) {
    // Keep trimmed as fallback code
  }

  return {
    rawText: trimmed,
    code,
    isUrl,
    directUrl
  };
};

/**
 * Reusable offscreen canvas for frame capture to minimize GC thrashing.
 */
let sharedCanvas = null;
let sharedCtx = null;

const getSharedCanvas = (width, height) => {
  if (!sharedCanvas) {
    sharedCanvas = document.createElement('canvas');
    sharedCtx = sharedCanvas.getContext('2d', { willReadFrequently: true });
  }
  if (sharedCanvas.width !== width || sharedCanvas.height !== height) {
    sharedCanvas.width = width;
    sharedCanvas.height = height;
  }
  return { canvas: sharedCanvas, ctx: sharedCtx };
};

/**
 * Detect QR code from HTMLVideoElement.
 * Uses native BarcodeDetector API if available for hardware acceleration,
 * falling back gracefully to jsQR.
 */
export const detectQrFromVideo = async (videoElement) => {
  if (!videoElement || videoElement.readyState < 2 || !videoElement.videoWidth || !videoElement.videoHeight) {
    return null;
  }

  // 1. Try modern native BarcodeDetector API if available
  if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
    try {
      const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
      const barcodes = await detector.detect(videoElement);
      if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
        return barcodes[0].rawValue;
      }
    } catch (e) {
      // Fallback to jsQR below
    }
  }

  // 2. jsQR Fallback via canvas draw
  try {
    const width = videoElement.videoWidth;
    const height = videoElement.videoHeight;
    const { ctx } = getSharedCanvas(width, height);
    ctx.drawImage(videoElement, 0, 0, width, height);
    const imageData = ctx.getImageData(0, 0, width, height);
    const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'attemptBoth'
    });

    if (qrCode && qrCode.data) {
      return qrCode.data;
    }
  } catch (e) {
    // Frame read error
  }

  return null;
};

/**
 * Detect QR code from an uploaded image File or Blob.
 */
export const detectQrFromImageFile = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase()) && !/\.(jpe?g|png|webp)$/i.test(file.name || '')) {
      return reject(new Error('Please upload a valid image file (JPG, PNG, or WEBP)'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image format'));
      img.onload = async () => {
        try {
          // 1. Try native BarcodeDetector
          if (typeof window !== 'undefined' && 'BarcodeDetector' in window) {
            try {
              const detector = new window.BarcodeDetector({ formats: ['qr_code'] });
              const barcodes = await detector.detect(img);
              if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                return resolve(barcodes[0].rawValue);
              }
            } catch (e) {
              // fallback
            }
          }

          // 2. Fallback using canvas & jsQR
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'attemptBoth'
          });

          if (qrCode && qrCode.data) {
            return resolve(qrCode.data);
          }

          // If standard resolution failed, try a normalized scale if image was huge
          if (canvas.width > 1600 || canvas.height > 1600) {
            const scale = Math.min(1200 / canvas.width, 1200 / canvas.height);
            const scaledCanvas = document.createElement('canvas');
            scaledCanvas.width = Math.round(canvas.width * scale);
            scaledCanvas.height = Math.round(canvas.height * scale);
            const scaledCtx = scaledCanvas.getContext('2d', { willReadFrequently: true });
            scaledCtx.drawImage(img, 0, 0, scaledCanvas.width, scaledCanvas.height);
            const scaledData = scaledCtx.getImageData(0, 0, scaledCanvas.width, scaledCanvas.height);
            const scaledQr = jsQR(scaledData.data, scaledData.width, scaledData.height, {
              inversionAttempts: 'attemptBoth'
            });
            if (scaledQr && scaledQr.data) {
              return resolve(scaledQr.data);
            }
          }

          reject(new Error('No QR code could be found in this image. Please make sure the QR code is clear, well-lit, and in focus.'));
        } catch (err) {
          reject(new Error('Error analyzing image: ' + err.message));
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Resilient multi-tier product lookup.
 * Attempts /api/products/scan/:code, then /api/products/:slugOrId, then /api/products?search=:code.
 */
export const lookupProduct = async (rawInput) => {
  const parsed = parseScannedText(rawInput);
  const targetCode = parsed.code || parsed.rawText;

  if (!targetCode) {
    throw new Error('Please provide a valid product code or scan a QR code.');
  }

  // 1. Try dedicated scan endpoint
  try {
    const res = await api.get(`/products/scan/${encodeURIComponent(targetCode)}`);
    if (res.data?.success && res.data?.product) {
      return res.data.product;
    }
  } catch (err) {
    // If not found or endpoint not yet loaded, continue to fallback strategies
  }

  // 2. Try direct product by ID or slug
  try {
    const res = await api.get(`/products/${encodeURIComponent(targetCode)}`);
    if (res.data?.success && res.data?.product) {
      return res.data.product;
    }
  } catch (err) {
    // Continue to search fallback
  }

  // 3. Clean common prefixes (e.g. FG-VERA-WHITE -> VERA WHITE)
  const cleanCode = targetCode.replace(/^(?:FG|fg|FLAIS|flais)[\s-_:]*/i, '').replace(/[-_]+/g, ' ').trim();

  // Try search with cleaned code
  try {
    const searchRes = await api.get(`/products?search=${encodeURIComponent(cleanCode || targetCode)}&limit=5`);
    if (searchRes.data?.success && Array.isArray(searchRes.data?.products) && searchRes.data.products.length > 0) {
      const candidates = searchRes.data.products;
      // Look for best match
      const exactMatch = candidates.find(p => 
        (p.title && p.title.toLowerCase() === cleanCode.toLowerCase()) ||
        (p.slug && p.slug.toLowerCase() === targetCode.toLowerCase())
      );
      return exactMatch || candidates[0];
    }
  } catch (err) {
    // Search failed
  }

  return null;
};
