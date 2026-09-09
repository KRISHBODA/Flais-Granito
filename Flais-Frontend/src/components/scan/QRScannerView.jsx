import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Camera, RefreshCw, Zap, ZapOff, AlertCircle, Upload, Search, Pause, Play } from 'lucide-react';
import { detectQrFromVideo } from '../../utils/qrScannerEngine';

const QRScannerView = ({
  onCodeDetected,
  onSwitchToUpload,
  onSwitchToManual,
  isScanningActive = true
}) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const scanTimerRef = useRef(null);

  const [cameraState, setCameraState] = useState('INIT'); // INIT, GRANTED, DENIED, NOT_SUPPORTED, ERROR
  const [errorMessage, setErrorMessage] = useState('');
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' | 'user'
  const [torchSupported, setTorchSupported] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  // Stop camera tracks cleanly
  const stopCamera = useCallback(() => {
    if (scanTimerRef.current) {
      clearInterval(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  // Check available camera devices
  const checkCameras = useCallback(async () => {
    try {
      if (navigator.mediaDevices?.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      }
    } catch (e) {
      // Ignore device enumeration errors
    }
  }, []);

  // Start camera stream
  const startCamera = useCallback(async () => {
    stopCamera();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraState('NOT_SUPPORTED');
      setErrorMessage('Your browser does not support direct camera scanning.');
      return;
    }

    setCameraState('INIT');
    setErrorMessage('');

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
        await videoRef.current.play();
      }

      // Check torch capability on the active track
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities ? videoTrack.getCapabilities() : {};
        setTorchSupported(Boolean(capabilities.torch));
      }

      setCameraState('GRANTED');
      checkCameras();
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraState('DENIED');
        setErrorMessage('Camera access was denied. Please allow camera permissions in your browser or choose an alternative below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraState('ERROR');
        setErrorMessage('No camera device could be found on your current device.');
      } else {
        setCameraState('ERROR');
        setErrorMessage('Unable to access camera: ' + (err.message || 'Unknown error'));
      }
    }
  }, [facingMode, stopCamera, checkCameras]);

  // Toggle flashlight / torch
  const toggleTorch = async () => {
    if (!streamRef.current || !torchSupported) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (track && track.applyConstraints) {
      try {
        const newTorchState = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: newTorchState }]
        });
        setTorchOn(newTorchState);
      } catch (e) {
        // Torch constraint rejected
      }
    }
  };

  // Flip camera between front and back
  const flipCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Start or restart camera on mount / dependency changes
  useEffect(() => {
    if (isScanningActive && !isPaused) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isScanningActive, isPaused, facingMode, startCamera, stopCamera]);

  // Continuous frame analysis loop
  useEffect(() => {
    if (cameraState !== 'GRANTED' || !isScanningActive || isPaused) {
      return;
    }

    let isProcessing = false;

    scanTimerRef.current = setInterval(async () => {
      if (isProcessing || !videoRef.current) return;
      isProcessing = true;

      try {
        const detected = await detectQrFromVideo(videoRef.current);
        if (detected) {
          stopCamera();
          onCodeDetected(detected);
        }
      } catch (e) {
        // Continue scanning next frame
      } finally {
        isProcessing = false;
      }
    }, 140); // Runs ~7 times per sec for optimal responsiveness and battery conservation

    return () => {
      if (scanTimerRef.current) {
        clearInterval(scanTimerRef.current);
        scanTimerRef.current = null;
      }
    };
  }, [cameraState, isScanningActive, isPaused, onCodeDetected, stopCamera]);

  // Render Permission Denied or Error State
  if (cameraState === 'DENIED' || cameraState === 'NOT_SUPPORTED' || cameraState === 'ERROR') {
    return (
      <div className="w-full max-w-xl mx-auto bg-white rounded-3xl border border-zinc-200 shadow-sm p-8 sm:p-10 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 mx-auto flex items-center justify-center mb-6 border border-amber-200/60">
          <AlertCircle size={32} />
        </div>

        <h2 className="text-xl sm:text-2xl font-display font-bold text-zinc-900 mb-3">
          {cameraState === 'DENIED' ? 'Camera Access Required' : 'Camera Unavailable'}
        </h2>

        <p className="text-sm text-zinc-600 max-w-md mx-auto mb-8 leading-relaxed">
          {errorMessage || 'Camera access is required to scan directly from your device.'}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {cameraState === 'DENIED' && (
            <button
              type="button"
              onClick={startCamera}
              className="w-full sm:w-auto px-6 py-3 bg-[#5D4037] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#4a332c] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw size={15} />
              Try Allowing Again
            </button>
          )}

          <button
            type="button"
            onClick={onSwitchToUpload}
            className="w-full sm:w-auto px-6 py-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Upload size={15} />
            Upload QR Image
          </button>

          <button
            type="button"
            onClick={onSwitchToManual}
            className="w-full sm:w-auto px-6 py-3 bg-white border border-zinc-300 text-zinc-800 hover:bg-zinc-50 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Search size={15} />
            Enter Code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto">
      {/* Scanner Viewport Container */}
      <div className="relative aspect-[4/3] sm:aspect-[1/1] max-h-[520px] rounded-3xl overflow-hidden bg-zinc-950 border border-zinc-200/80 shadow-xl select-none">
        {/* HTML5 Live Video Stream */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          autoPlay
        />

        {/* Ambient Darkened Vignette Overlay */}
        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        {/* Focus Scanning Target Box */}
        <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
          <div className="relative w-56 h-56 sm:w-68 sm:h-68 rounded-2xl border-2 border-white/20">
            {/* Corner Indicators (Luxury Gold / Bronze) */}
            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-[#C0A060] rounded-tl-lg" />
            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-[#C0A060] rounded-tr-lg" />
            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-[#C0A060] rounded-bl-lg" />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-[#C0A060] rounded-br-lg" />

            {/* Subtle Laser Beam Animation */}
            {cameraState === 'GRANTED' && !isPaused && (
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-[#C0A060] to-transparent shadow-[0_0_8px_#C0A060] animate-scan-beam" />
            )}

            {/* Centered Reticle Center Marker */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-[#C0A060]/40" />
            </div>
          </div>
        </div>

        {/* Top Control Bar */}
        <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Scanning active</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Torch Toggle */}
            {torchSupported && (
              <button
                type="button"
                onClick={toggleTorch}
                aria-label={torchOn ? 'Turn off flashlight' : 'Turn on flashlight'}
                className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                {torchOn ? <Zap size={18} className="text-amber-300" /> : <ZapOff size={18} />}
              </button>
            )}

            {/* Flip Camera */}
            {hasMultipleCameras && (
              <button
                type="button"
                onClick={flipCamera}
                aria-label="Switch camera"
                className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <RefreshCw size={18} />
              </button>
            )}

            {/* Pause/Resume Scan */}
            <button
              type="button"
              onClick={() => setIsPaused((prev) => !prev)}
              aria-label={isPaused ? 'Resume scanning' : 'Pause scanning'}
              className="w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              {isPaused ? <Play size={18} /> : <Pause size={18} />}
            </button>
          </div>
        </div>

        {/* Bottom Instructions Inside Viewport */}
        <div className="absolute bottom-4 inset-x-4 text-center pointer-events-none z-10">
          <div className="inline-block px-4 py-2 rounded-xl bg-black/65 backdrop-blur-md border border-white/10 text-white/90 text-xs font-medium">
            Place the QR code inside the frame
          </div>
        </div>
      </div>

      {/* Helper text below viewport */}
      <div className="mt-4 text-center">
        <p className="text-xs text-zinc-500 font-light">
          Make sure the QR code is clearly visible, glare-free, and well lit.
        </p>
      </div>
    </div>
  );
};

export default QRScannerView;
