import React from 'react';
import { Camera, Upload, Search } from 'lucide-react';

const ScanHero = ({ activeMode, onSelectMode }) => {
  return (
    <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
      {/* Eyebrow Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF8F5] border border-[#D2C9B1]/50 text-[#5D4037] text-[11px] font-bold uppercase tracking-[0.2em] mb-4 shadow-2xs">
        <span className="w-1.5 h-1.5 rounded-full bg-[#C0A060] animate-pulse" />
        Product Scanner
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold text-zinc-900 tracking-tight uppercase mb-4">
        Scan. Discover. Experience.
      </h1>

      {/* Supporting Text */}
      <p className="text-sm sm:text-base text-zinc-600 font-light leading-relaxed max-w-2xl mx-auto mb-8">
        Scan the QR code on your FLAIS Granito product to instantly access detailed product information, technical specifications, and collection details.
      </p>

      {/* Mode Switcher Tabs */}
      <div className="inline-flex items-center p-1.5 rounded-2xl bg-[#FAF8F5] border border-zinc-200/80 shadow-inner max-w-full overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => onSelectMode('camera')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider transition-all duration-300 select-none cursor-pointer ${
            activeMode === 'camera'
              ? 'bg-[#5D4037] text-white shadow-md'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
          }`}
          aria-pressed={activeMode === 'camera'}
        >
          <Camera size={16} />
          <span>Live Camera</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectMode('upload')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider transition-all duration-300 select-none cursor-pointer ${
            activeMode === 'upload'
              ? 'bg-[#5D4037] text-white shadow-md'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
          }`}
          aria-pressed={activeMode === 'upload'}
        >
          <Upload size={16} />
          <span>Upload Image</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectMode('manual')}
          className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wider transition-all duration-300 select-none cursor-pointer ${
            activeMode === 'manual'
              ? 'bg-[#5D4037] text-white shadow-md'
              : 'text-zinc-600 hover:text-zinc-950 hover:bg-white/60'
          }`}
          aria-pressed={activeMode === 'manual'}
        >
          <Search size={16} />
          <span>Enter Code</span>
        </button>
      </div>
    </div>
  );
};

export default ScanHero;
