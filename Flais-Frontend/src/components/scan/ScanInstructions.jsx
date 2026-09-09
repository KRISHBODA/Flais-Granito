import React from 'react';
import { Link } from 'react-router-dom';
import { QrCode, ShieldCheck, Compass, Sliders, Box, Award, Layers, ArrowRight } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    title: 'Locate QR Code',
    description: 'Find the official FLAIS Granito QR code printed on the sample tile back, corner label, or packaging crate.',
    icon: Box
  },
  {
    step: '02',
    title: 'Scan or Upload',
    description: 'Point your camera directly at the code or upload an image from your gallery. Alternatively, enter the product code.',
    icon: QrCode
  },
  {
    step: '03',
    title: 'Access Official Data',
    description: 'Instantly view verified dimensions, finish types, thickness, batch series, and launch the 360° room viewer.',
    icon: Compass
  }
];

const PILLARS = [
  {
    title: 'Architectural Precision',
    description: 'Direct access to certified factory specifications, technical parameters, and absorption ratings.',
    icon: Award
  },
  {
    title: 'Guaranteed Authenticity',
    description: 'Every genuine FLAIS Granito porcelain tile is registered with a unique catalog identifier.',
    icon: ShieldCheck
  },
  {
    title: 'Project Estimator Integration',
    description: 'Instantly transfer tile dimensions into our Tile Calculator to plan coverage, boxes, and grout.',
    icon: Sliders
  }
];

const ScanInstructions = () => {
  return (
    <div className="mt-16 sm:mt-24 space-y-16 sm:space-y-20">
      {/* 3 Step Process */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#C0A060] mb-2 block">
            Seamless Discovery
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 uppercase">
            How It Works
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {STEPS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative bg-white rounded-3xl p-6 sm:p-8 border border-zinc-200/80 shadow-xs hover:border-[#5D4037]/30 transition-all duration-300 group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#D2C9B1]/60 text-[#5D4037] flex items-center justify-center group-hover:bg-[#5D4037] group-hover:text-white transition-colors duration-300">
                    <Icon size={22} />
                  </div>
                  <span className="text-2xl font-mono font-bold text-zinc-300 group-hover:text-[#C0A060] transition-colors">
                    {item.step}
                  </span>
                </div>

                <h3 className="text-lg font-display font-bold text-zinc-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed font-light">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Brand Value Pillars */}
      <div className="bg-[#FAF8F5] rounded-3xl border border-[#D2C9B1]/40 p-8 sm:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-white text-[#5D4037] border border-[#D2C9B1]/50 flex items-center justify-center shrink-0 shadow-2xs">
                  <Icon size={20} />
                </div>
                <div>
                  <h4 className="text-sm font-display font-bold text-zinc-900 mb-1.5 uppercase tracking-wide">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-zinc-600 leading-relaxed font-light">
                    {pillar.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 15mm Countertop Product Knowledge Portal Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 text-white p-8 sm:p-10 border border-zinc-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="relative z-10 max-w-xl text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#C0A060] text-[10px] font-bold uppercase tracking-widest mb-3">
            <Layers size={13} />
            <span>Countertop Box Packaging</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-display font-bold mb-2">
            15mm Countertop Technical Portal
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed">
            Looking for cutting, handling, floor laying, and edge polishing instructions for 15mm porcelain slabs? Access the official FLAIS Granito smart guides.
          </p>
        </div>

        <Link
          to="/box-countertop-15mm-english"
          className="relative z-10 shrink-0 inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#5D4037] hover:bg-[#4a332c] text-white font-semibold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg hover:shadow-[#5D4037]/20 group"
        >
          <span>Open 15mm Smartpage</span>
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};

export default ScanInstructions;
