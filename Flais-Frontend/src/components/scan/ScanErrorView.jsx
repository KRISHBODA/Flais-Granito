import React from 'react';
import { Link } from 'react-router-dom';
import { SearchX, RefreshCw, Edit3, MessageSquare, ArrowRight } from 'lucide-react';

const ScanErrorView = ({
  title = "Product Not Found",
  message = "We couldn't find a FLAIS Granito product associated with this code. Please check the code or try scanning again.",
  onRetry,
  onSwitchToManual
}) => {
  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl border border-zinc-200 shadow-sm p-8 sm:p-10 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-[#FAF8F5] text-[#5D4037] border border-[#D2C9B1]/60 mx-auto flex items-center justify-center mb-6 shadow-inner">
        <SearchX size={32} />
      </div>

      <h2 className="text-xl sm:text-2xl font-display font-bold text-zinc-900 mb-3">
        {title}
      </h2>

      <p className="text-sm text-zinc-600 max-w-md mx-auto mb-8 leading-relaxed font-light">
        {message}
      </p>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="w-full sm:w-auto px-6 py-3.5 bg-[#5D4037] hover:bg-[#4a332c] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
        >
          <RefreshCw size={15} />
          <span>Try Again</span>
        </button>

        <button
          type="button"
          onClick={onSwitchToManual}
          className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-zinc-50 border border-zinc-300 text-zinc-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Edit3 size={15} />
          <span>Enter Code Manually</span>
        </button>

        <Link
          to="/contact"
          className="w-full sm:w-auto px-6 py-3.5 bg-[#FAF8F5] hover:bg-zinc-100 text-zinc-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 text-center"
        >
          <MessageSquare size={15} />
          <span>Contact Us</span>
        </Link>
      </div>
    </div>
  );
};

export default ScanErrorView;
