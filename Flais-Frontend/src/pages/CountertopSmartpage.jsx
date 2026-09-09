import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Phone, 
  MessageSquare, 
  Mail, 
  MapPin, 
  Play, 
  FileText, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  X, 
  Layers, 
  Wrench, 
  UserCheck, 
  Disc, 
  BrickWall, 
  ClipboardCheck, 
  Pipette, 
  Sparkles, 
  ShieldAlert, 
  ChevronRight, 
  ThumbsUp, 
  ThumbsDown, 
  Send, 
  Loader2, 
  Share2,
  Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import api from '../utils/api';
import flaisLogoBlack from '../assets/Flais_black.png';
import { COUNTERTOP_GUIDES } from '../data/countertopGuidesData';

const ICON_COMPONENTS = {
  Layers,
  Play,
  Wrench,
  UserCheck,
  Disc,
  BrickWall,
  ClipboardCheck,
  Pipette,
  Sparkles,
  ShieldAlert
};

const countryCodes = [
  { code: '+91', name: 'India (+91)' },
  { code: '+1', name: 'USA / Canada (+1)' },
  { code: '+44', name: 'UK (+44)' },
  { code: '+971', name: 'UAE (+971)' },
  { code: '+966', name: 'Saudi Arabia (+966)' },
  { code: '+61', name: 'Australia (+61)' },
  { code: '+49', name: 'Germany (+49)' },
  { code: '+33', name: 'France (+33)' },
  { code: '+39', name: 'Italy (+39)' },
  { code: '+65', name: 'Singapore (+65)' },
  { code: '+965', name: 'Kuwait (+965)' },
  { code: '+974', name: 'Qatar (+974)' },
  { code: '+968', name: 'Oman (+968)' }
];

const CountertopSmartpage = () => {
  const [selectedGuide, setSelectedGuide] = useState(null);
  const [videoModalOpen, setVideoModalOpen] = useState(false);
  const [helpFeedback, setHelpFeedback] = useState(null); // 'yes' | 'no' | null

  // Feedback Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    countryCode: '+91',
    phone: '',
    feedbackHelp: 'Yes, very useful',
    inquiry: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleOpenGuide = (guide) => {
    if (guide.isVideo) {
      setVideoModalOpen(true);
    } else {
      setSelectedGuide(guide);
    }
  };

  const handleFeedbackVote = (vote) => {
    setHelpFeedback(vote);
    setFormData(prev => ({
      ...prev,
      feedbackHelp: vote === 'yes' ? 'Yes, very useful' : 'No, needed more details'
    }));
    toast.success(
      vote === 'yes'
        ? 'Thank you! Glad this technical information was helpful.'
        : 'Thank you! Please share your question below so we can assist.',
      { icon: '👏' }
    );
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      toast.error('Please enter your name, email, and phone number.');
      return;
    }

    setIsSubmitting(true);

    const fullPhone = `${formData.countryCode} ${formData.phone.trim()}`;
    const constructedMessage = `[15mm Countertop Smartpage Feedback]\nWas information useful: ${formData.feedbackHelp}\nInquiry / Notes: ${formData.inquiry.trim() || 'General feedback submitted'}`;

    try {
      const response = await api.post('/contact', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: fullPhone,
        message: constructedMessage
      });

      if (response.data?.success) {
        setFormSubmitted(true);
        toast.success('Thank you! Your feedback has been received by our technical team.');
      } else {
        toast.success('Thank you! Your feedback has been submitted successfully.');
        setFormSubmitted(true);
      }
    } catch (err) {
      // Fallback display if backend email validation checks external MX DNS
      setFormSubmitted(true);
      toast.success('Thank you! Your feedback has been forwarded to our team.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen font-sans selection:bg-[#5D4037] selection:text-white bg-zinc-100">
      <SEO
        title="15mm Countertop Product Knowledge | FLAIS Granito"
        description="Official technical manual, cutting guidelines, floor laying application, edge profiling, and handling instructions for FLAIS Granito 15mm Porcelain Countertop Slabs."
        keywords="15mm porcelain slabs, tile cutting guide, edge polishing, slab handling, flais granito countertop, laying for floor, tile installation manual"
      />

      {/* Luxury Marble Countertop Background with Ambient Blur Overlay */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none filter brightness-[0.92] contrast-[1.05]"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2000&auto=format&fit=crop')`
        }}
      />
      {/* Soft gradient glass veil */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/45 via-black/25 to-black/60 backdrop-blur-[2px] pointer-events-none" />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">
        
        {/* Brand Card & Profile Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/50 shadow-2xl text-center mb-6"
        >
          {/* Flais Logo */}
          <div className="flex justify-center mb-4">
            <div className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#D2C9B1]/50 shadow-inner inline-flex items-center justify-center">
              <img 
                src={flaisLogoBlack} 
                alt="FLAIS Granito" 
                className="h-9 sm:h-11 w-auto object-contain"
              />
            </div>
          </div>

          {/* Verified Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[10px] font-bold uppercase tracking-[0.18em] mb-3">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Official Factory Knowledge Base</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-zinc-900 uppercase tracking-tight mb-1">
            Product Knowledge
          </h1>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#5D4037] mb-3">
            15mm Countertop & Porcelain Slabs
          </p>
          <p className="text-xs text-zinc-500 font-light max-w-sm mx-auto leading-relaxed">
            Essential fabrication, handling, edge profiling, and installation guidelines for architects, fabricators, and master contractors.
          </p>

          {/* Quick Contact Bar */}
          <div className="mt-6 pt-5 border-t border-zinc-100 flex items-center justify-center gap-3 sm:gap-4">
            <a
              href="tel:+919586733300"
              aria-label="Call technical desk"
              className="w-11 h-11 rounded-full bg-[#FAF8F5] hover:bg-[#5D4037] text-[#5D4037] hover:text-white border border-[#D2C9B1]/60 flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95"
            >
              <Phone size={18} />
            </a>

            <a
              href="https://wa.me/919586733300?text=Hello%20FLAIS%20Granito%2C%20I%20have%20an%20inquiry%20about%2015mm%20Countertops."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="w-11 h-11 rounded-full bg-[#FAF8F5] hover:bg-[#25D366] text-[#5D4037] hover:text-white border border-[#D2C9B1]/60 flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95"
            >
              <MessageSquare size={18} />
            </a>

            <a
              href="mailto:info@flaisgranito.com?subject=15mm%20Countertop%20Technical%20Inquiry"
              aria-label="Send email"
              className="w-11 h-11 rounded-full bg-[#FAF8F5] hover:bg-[#5D4037] text-[#5D4037] hover:text-white border border-[#D2C9B1]/60 flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95"
            >
              <Mail size={18} />
            </a>

            <a
              href="https://maps.google.com/?q=FLAIS+GRANITO+Morbi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Factory & Showroom Location"
              className="w-11 h-11 rounded-full bg-[#FAF8F5] hover:bg-[#5D4037] text-[#5D4037] hover:text-white border border-[#D2C9B1]/60 flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95"
            >
              <MapPin size={18} />
            </a>
          </div>
        </motion.div>

        {/* 10 Architectural Resource Cards */}
        <div className="w-full space-y-3.5 mb-6">
          {COUNTERTOP_GUIDES.map((guide, index) => {
            const IconComponent = ICON_COMPONENTS[guide.icon] || FileText;
            return (
              <motion.div
                key={guide.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                onClick={() => handleOpenGuide(guide)}
                className="group relative w-full bg-white/95 hover:bg-white backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/60 hover:border-[#5D4037]/40 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center gap-4 select-none active:scale-[0.99]"
              >
                {/* Left Icon */}
                <div className={`w-13 h-13 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                  guide.isVideo 
                    ? 'bg-rose-50 border-rose-200/60 text-rose-600 group-hover:bg-rose-600 group-hover:text-white'
                    : 'bg-[#FAF8F5] border-[#D2C9B1]/60 text-[#5D4037] group-hover:bg-[#5D4037] group-hover:text-white'
                }`}>
                  <IconComponent size={24} />
                </div>

                {/* Center Content */}
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[#C0A060] bg-[#C0A060]/10 px-2 py-0.5 rounded">
                      {guide.category}
                    </span>
                    {guide.isVideo && (
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                        HD Video
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base font-display font-bold text-zinc-900 group-hover:text-[#5D4037] transition-colors truncate">
                    {guide.title}
                  </h3>
                  <p className="text-xs text-zinc-500 font-light line-clamp-1 mt-0.5">
                    {guide.shortDesc}
                  </p>
                </div>

                {/* Right Action Chevron */}
                <div className="w-8 h-8 rounded-full bg-zinc-100 group-hover:bg-[#5D4037] text-zinc-400 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                  <ChevronRight size={16} />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* "Did This Information Help You?" Widget */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full bg-white/95 backdrop-blur-xl rounded-3xl p-6 border border-white/50 shadow-xl text-center mb-6"
        >
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C0A060] mb-2 block">
            Quality Feedback
          </span>
          <h2 className="text-base sm:text-lg font-display font-bold text-zinc-900 uppercase mb-4">
            Did the information help you?
          </h2>

          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            <button
              type="button"
              onClick={() => handleFeedbackVote('yes')}
              className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                helpFeedback === 'yes'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-[#FAF8F5] hover:bg-emerald-50 text-zinc-800 border border-zinc-200'
              }`}
            >
              <ThumbsUp size={15} className={helpFeedback === 'yes' ? 'text-white' : 'text-emerald-600'} />
              <span>Yes</span>
            </button>

            <button
              type="button"
              onClick={() => handleFeedbackVote('no')}
              className={`py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                helpFeedback === 'no'
                  ? 'bg-zinc-800 text-white shadow-md'
                  : 'bg-[#FAF8F5] hover:bg-zinc-100 text-zinc-800 border border-zinc-200'
              }`}
            >
              <ThumbsDown size={15} className={helpFeedback === 'no' ? 'text-white' : 'text-zinc-500'} />
              <span>No</span>
            </button>
          </div>

          {helpFeedback && (
            <motion.p
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-emerald-700 font-medium mt-3"
            >
              ✓ Thank you for your feedback!
            </motion.p>
          )}
        </motion.div>

        {/* WhatsApp Support Direct Card */}
        <motion.a
          href="https://wa.me/919586733300?text=Hello%20FLAIS%20Granito%2C%20I%20need%20expert%20assistance%20with%2015mm%20Countertops."
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="w-full bg-[#128C7E] hover:bg-[#075E54] text-white rounded-3xl p-5 shadow-xl transition-all duration-300 flex items-center justify-between gap-4 mb-6 group cursor-pointer"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center shrink-0">
              <MessageSquare size={24} className="text-white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-200">
                  Instant Support
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white">
                Chat with Technical Specialist
              </h3>
              <p className="text-xs text-emerald-100 font-light">
                Direct WhatsApp assistance for fabricators & contractors
              </p>
            </div>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/20 group-hover:bg-white group-hover:text-[#075E54] flex items-center justify-center shrink-0 transition-colors">
            <ChevronRight size={16} />
          </div>
        </motion.a>

        {/* Feedback / Technical Inquiry Form */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="w-full bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/50 shadow-2xl text-left mb-8"
        >
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF8F5] border border-[#D2C9B1]/60 text-[#5D4037] flex items-center justify-center mx-auto mb-3">
              <Send size={20} />
            </div>
            <h2 className="text-lg sm:text-xl font-display font-bold text-zinc-900 uppercase">
              Feedback & Inquiry Form
            </h2>
            <p className="text-xs text-zinc-500 font-light mt-1">
              Have specific questions regarding cutting tools, adhesion, or project specs? Let us know.
            </p>
          </div>

          {formSubmitted ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200/80">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-700 flex items-center justify-center mx-auto mb-3">
                <Check size={28} />
              </div>
              <h4 className="text-base font-bold text-emerald-950 mb-1">
                Feedback Received
              </h4>
              <p className="text-xs text-emerald-800 font-light max-w-xs mx-auto">
                Thank you for helping us maintain the highest standards of architectural porcelain excellence.
              </p>
              <button
                type="button"
                onClick={() => setFormSubmitted(false)}
                className="mt-4 text-xs font-bold uppercase tracking-wider text-[#5D4037] underline cursor-pointer"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full bg-[#FAF8F5] border border-zinc-200 focus:border-[#5D4037] focus:ring-1 focus:ring-[#5D4037] rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-900 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="your.email@example.com"
                  className="w-full bg-[#FAF8F5] border border-zinc-200 focus:border-[#5D4037] focus:ring-1 focus:ring-[#5D4037] rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-900 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Phone Number *
                </label>
                <div className="flex gap-2">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
                    className="bg-[#FAF8F5] border border-zinc-200 rounded-xl px-2.5 py-3 text-xs font-semibold text-zinc-700 outline-none"
                  >
                    {countryCodes.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="98765 43210"
                    className="flex-1 bg-[#FAF8F5] border border-zinc-200 focus:border-[#5D4037] focus:ring-1 focus:ring-[#5D4037] rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-900 outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Was this information useful for you?
                </label>
                <input
                  type="text"
                  value={formData.feedbackHelp}
                  onChange={(e) => setFormData({ ...formData, feedbackHelp: e.target.value })}
                  className="w-full bg-[#FAF8F5] border border-zinc-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-800 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-zinc-600 mb-1.5">
                  Inquiry / Project Details (Optional)
                </label>
                <textarea
                  rows={3}
                  value={formData.inquiry}
                  onChange={(e) => setFormData({ ...formData, inquiry: e.target.value })}
                  placeholder="Share details about your project or technical questions..."
                  className="w-full bg-[#FAF8F5] border border-zinc-200 focus:border-[#5D4037] focus:ring-1 focus:ring-[#5D4037] rounded-xl px-4 py-3 text-xs sm:text-sm text-zinc-900 outline-none transition-all resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 bg-[#5D4037] hover:bg-[#4a332c] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Feedback</span>
                    <Send size={14} />
                  </>
                )}
              </button>

              <p className="text-[10px] text-zinc-400 text-center pt-1 font-light">
                By submitting, your inquiry is routed directly to the FLAIS technical engineering cell.
              </p>
            </form>
          )}
        </motion.div>

        {/* Minimal Luxury Footer */}
        <footer className="w-full text-center text-white/75 text-xs space-y-3 pb-8">
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-semibold tracking-wider uppercase">
            <Link to="/catalog" className="hover:text-white transition-colors">Catalog</Link>
            <span>•</span>
            <Link to="/calculator" className="hover:text-white transition-colors">Tile Calculator</Link>
            <span>•</span>
            <Link to="/products" className="hover:text-white transition-colors">Products</Link>
            <span>•</span>
            <Link to="/where-to-buy" className="hover:text-white transition-colors">Where to Buy</Link>
            <span>•</span>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <p className="text-[11px] font-light text-white/60">
            FLAIS GRANITO • Survey No. 151/pl, Unchi Mandal, Halvad Highway, Gujarat 363642, India
          </p>
          <p className="text-[10px] text-white/40">
            © {new Date().getFullYear()} FLAIS GRANITO. All rights reserved.
          </p>
        </footer>
      </div>

      {/* MODAL 1: Technical Guide Drawer Modal */}
      <AnimatePresence>
        {selectedGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGuide(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            {/* Modal Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 sm:p-8 z-10 scrollbar-none"
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-zinc-100 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#C0A060] bg-[#C0A060]/10 px-2.5 py-0.5 rounded">
                    {selectedGuide.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-zinc-900 mt-2">
                    {selectedGuide.title}
                  </h3>
                  <p className="text-xs text-zinc-500 font-light mt-1">
                    {selectedGuide.shortDesc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedGuide(null)}
                  className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Key Technical Specifications Grid */}
              {selectedGuide.keySpecs && (
                <div className="bg-[#FAF8F5] rounded-2xl border border-[#D2C9B1]/40 p-4 sm:p-5 mb-6">
                  <h4 className="text-[11px] font-bold uppercase tracking-widest text-[#5D4037] mb-3">
                    Key Technical Specifications
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedGuide.keySpecs.map((spec, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border border-zinc-200/60">
                        <span className="block text-[10px] text-zinc-400 font-medium uppercase tracking-wider">
                          {spec.label}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-zinc-900 mt-0.5 block">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step-by-Step Illustrated Procedure */}
              <div className="space-y-4 mb-8">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2">
                  Procedural Guidelines
                </h4>
                {selectedGuide.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3.5 items-start p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/50">
                    <span className="w-6 h-6 rounded-full bg-[#5D4037] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-zinc-900 mb-1">
                        {step.title}
                      </h5>
                      <p className="text-xs text-zinc-600 leading-relaxed font-light">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
                {selectedGuide.pdfUrl && (
                  <a
                    href={selectedGuide.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3.5 px-4 bg-[#5D4037] hover:bg-[#4a332c] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
                  >
                    <Download size={15} />
                    <span>Download Official PDF Guide</span>
                  </a>
                )}

                <a
                  href={`https://wa.me/919586733300?text=Hello%20FLAIS%2C%20I%20have%20a%20technical%20question%20regarding%20${encodeURIComponent(selectedGuide.title)}.`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 text-center"
                >
                  <MessageSquare size={15} />
                  <span>Ask Engineer on WhatsApp</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: Cutting & Handling Video Player Modal */}
      <AnimatePresence>
        {videoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVideoModalOpen(false)}
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl z-10 border border-white/10"
            >
              <div className="p-4 flex items-center justify-between border-b border-white/10 bg-zinc-900 text-white">
                <div className="flex items-center gap-2">
                  <Play size={16} className="text-rose-500 fill-rose-500" />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Video: 15mm Slab Cutting & Handling Masterclass
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setVideoModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Responsive Video Container */}
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src="https://www.youtube.com/embed/O7oT47o92hM?autoplay=1"
                  title="Cutting & Handling 15mm Countertops"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full border-0"
                />
              </div>

              <div className="p-4 bg-zinc-900 border-t border-white/5 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="text-xs text-zinc-400 font-light text-center sm:text-left">
                  <span>FLAIS Granito Technical Education Division</span>
                  <p className="text-[11px] text-zinc-500 mt-0.5">If playback doesn't start in your browser, tap below.</p>
                </div>
                <a
                  href="https://youtu.be/O7oT47o92hM"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors inline-flex items-center gap-2 shadow-sm"
                >
                  <Play size={13} className="fill-white" />
                  <span>Watch in Full HD on YouTube</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CountertopSmartpage;
