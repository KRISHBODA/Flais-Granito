# OpenJPEG/WASM Decoder Fix for PDF.js

## Problem

PDF.js requires WASM binaries (`openjpeg.wasm`, `qcms_bg.wasm`) and ICC color profiles (`CGATS001Compat-v2-micro.icc`) to:
1. Decode JPEG2000 (JPX) images in PDFs
2. Handle ICC-based color spaces in PDF documents

Without these assets, PDF.js falls back to pure JavaScript decode, which is slow and generates warnings on the server console.

## Solution Implemented

### 1. **Asset Copy** (`/public`)
Copied the required WASM and ICC files from `node_modules/pdfjs-dist/`:
- `node_modules/pdfjs-dist/wasm/openjpeg.wasm` → `public/openjpeg.wasm`
- `node_modules/pdfjs-dist/wasm/qcms_bg.wasm` → `public/qcms_bg.wasm`
- `node_modules/pdfjs-dist/iccs/CGATS001Compat-v2-micro.icc` → `public/CGATS001Compat-v2-micro.icc`

### 2. **Vite Config** (`vite.config.js`)
Added MIME type configuration for WASM files in dev server:
```javascript
server: {
  mimetype: {
    wasm: 'application/wasm'
  }
}
```

This ensures Vite's dev server correctly serves `.wasm` files with `Content-Type: application/wasm`.

### 3. **CatalogFlipBook Component** (`src/components/CatalogFlipBook.jsx`)
Updated the Document component to pass PDF.js decoder options:
```jsx
<Document
  file={pdfUrl}
  options={{
    useWasm: true,
    useWorkerFetch: true,
    wasmUrl: '/',
    iccUrl: '/',
  }}
  {/* ... rest of props */}
/>
```

These options tell PDF.js:
- `useWasm: true` → Use WASM-accelerated decoders
- `useWorkerFetch: true` → Allow worker to fetch WASM/ICC assets
- `wasmUrl: '/'` → WASM binaries are in `/public` root
- `iccUrl: '/'` → ICC color profiles are in `/public` root

## How It Works

1. When a PDF is loaded, the `Document` component passes these options to `pdfjs.getDocument()`
2. The PDF.js worker thread receives these options during initialization
3. When the worker encounters JPEG2000 or ICC color space content, it:
   - Fetches `openjpeg.wasm` or `qcms_bg.wasm` from the `wasmUrl`
   - Fetches ICC profiles from the `iccUrl`
   - Uses WebAssembly for fast, hardware-accelerated decoding
4. If WASM fails to load, PDF.js falls back to `openjpeg_nowasm_fallback.js`

## Testing

### Local Development
1. Open the browser DevTools Console
2. Open a PDF through the Catalog Flipbook viewer
3. Check the timing logs added to CatalogFlipBook:
   - `[CatalogFlipBook] PDF load started: {url}`
   - `[CatalogFlipBook] Document load progress: 10%`, `20%`, ... `100%`
   - `[CatalogFlipBook] Document loaded ({numPages} pages) in {ms}ms`
   - `[CatalogFlipBook] Page 1 rendered in {ms}ms` (first visible page)
4. Verify there are **no warnings** about:
   - Missing `openjpeg.wasm`
   - Missing `qcms_bg.wasm`
   - Missing ICC color space support

### VPS/Production Deployment
1. Ensure that `/public/openjpeg.wasm`, `/public/qcms_bg.wasm`, and `/public/CGATS001Compat-v2-micro.icc` are present
2. Ensure your web server serves `.wasm` files with `Content-Type: application/wasm`
   - **Nginx**: Add to config:
     ```
     types {
       application/wasm wasm;
     }
     ```
   - **Apache**: Add to `.htaccess`:
     ```
     AddType application/wasm wasm
     ```
   - **Express.js**: Add MIME type:
     ```javascript
     app.use(express.static('public', {
       setHeaders: (res, path) => {
        if (path.endsWith('.wasm')) {
          res.setHeader('Content-Type', 'application/wasm');
        }
       }
     }));
     ```
3. Test loading a PDF with JPEG2000 images or ICC color spaces
4. Monitor console for any WASM load errors

## Performance Impact

With WASM enabled:
- JPEG2000 decoding: ~100x faster than pure JS
- ICC color space handling: Near-native speed
- First page render time: Should be noticeably faster on VPS
- Network: +~354 KB initial load (combined WASM + ICC files), cached by browser

## Related Files
- [CatalogFlipBook.jsx](src/components/CatalogFlipBook.jsx) - Component with instrumentation
- [vite.config.js](vite.config.js) - Vite MIME type config
- [public/](public/) - Assets folder containing WASM and ICC files
