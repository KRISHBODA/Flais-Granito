import React, { useState } from 'react';
import { Search, Loader2, ArrowRight, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  'VERA WHITE',
  'STATUARIO VIOLLA',
  'STATUARIO NEXA',
  'MARVEL STATUARY'
];

const ManualCodeView = ({ onSubmitCode, isLoading = false }) => {
  const [inputCode, setInputCode] = useState('');
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputCode.trim();
    if (!trimmed) {
      setValidationError('Please enter a valid product name, code, or URL.');
      return;
    }
    setValidationError('');
    onSubmitCode(trimmed);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputCode(suggestion);
    setValidationError('');
    onSubmitCode(suggestion);
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 sm:p-8">
      <div className="mb-6">
        <label htmlFor="manual-product-input" className="block text-xs font-bold uppercase tracking-widest text-[#5D4037] mb-2">
          Manual Product Verification
        </label>
        <p className="text-xs text-zinc-500 font-light">
          Enter the product code (e.g. FG-XXXX), product name, or product slug to look up specifications.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <input
            id="manual-product-input"
            type="text"
            value={inputCode}
            onChange={(e) => {
              setInputCode(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="e.g. VERA WHITE or FG-1001"
            disabled={isLoading}
            className="w-full bg-[#FAF8F5] border border-zinc-200 focus:border-[#5D4037] focus:ring-2 focus:ring-[#5D4037]/20 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-900 placeholder:text-zinc-400 outline-none transition-all pr-12"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none">
            <Search size={18} />
          </div>
        </div>

        {validationError && (
          <p className="text-xs text-rose-600 font-medium pl-1">
            {validationError}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 bg-[#5D4037] hover:bg-[#4a332c] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.99]"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Looking Up Product...</span>
            </>
          ) : (
            <>
              <span>Find Product</span>
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>

      {/* Quick Search Chips */}
      <div className="mt-8 pt-6 border-t border-zinc-100">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-3">
          <Sparkles size={12} className="text-[#C0A060]" />
          <span>Popular Catalog Searches</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSuggestionClick(item)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-zinc-100 border border-zinc-200/80 text-zinc-700 text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManualCodeView;
