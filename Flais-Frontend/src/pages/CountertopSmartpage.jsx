import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Phone,
  Mail,
  MapPin,
  BookOpen,
  Wrench,
  Package,
  Layers,
  FileText,
  Download,
  ChevronRight,
  ExternalLink,
  X,
  Truck
} from 'lucide-react';
import SEO from '../components/SEO';
import flaisLogoWhite from '../assets/Flais White.png';
import veraWhiteBg from '../assets/VERA WHITE F3 copy.jpg.jpeg';
import packingManualPdf from '../assets/PRODUCT_PACKING_MANUAL_FLAIS-19-Sep.pdf';
import tileAdhesivePdf from '../assets/Flais Granito - Tile Adhesive Corporate Profile.pdf';

const WhatsAppIcon = ({ size = 18, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path d="M17.472 14.382c-.301-.15-1.777-.877-2.052-.977-.276-.1-.477-.15-.678.15-.2.3-.778.977-.954 1.178-.175.2-.351.226-.652.075-.301-.15-1.272-.469-2.423-1.496-.895-.798-1.5-1.785-1.676-2.086-.175-.301-.019-.464.132-.614.135-.135.301-.351.451-.527.151-.176.201-.301.301-.502.1-.201.05-.377-.025-.527-.075-.15-.678-1.633-.929-2.235-.245-.586-.494-.506-.678-.515-.176-.008-.377-.01-.578-.01-.201 0-.527.075-.803.377s-1.054 1.029-1.054 2.51 1.079 2.912 1.23 3.113c.15.201 2.124 3.243 5.147 4.547.719.311 1.281.497 1.719.636.723.23 1.381.197 1.901.12.579-.087 1.777-.727 2.028-1.43.251-.703.251-1.306.176-1.431-.075-.125-.276-.201-.577-.351z" />
    <path d="M12.004 2c-5.517 0-9.993 4.476-9.993 9.994 0 1.763.459 3.483 1.332 5.001L2 22l5.132-1.314c1.472.803 3.13 1.228 4.872 1.228 5.518 0 9.995-4.477 9.995-9.995 0-5.518-4.477-9.994-9.995-9.994zm0 18.293c-1.503 0-2.976-.395-4.26-1.144l-.306-.178-3.167.811.844-3.088-.198-.315c-.822-1.308-1.258-2.827-1.258-4.385 0-4.572 3.72-8.293 8.295-8.293 4.574 0 8.295 3.721 8.295 8.293 0 4.573-3.721 8.293-8.295 8.293z" />
  </svg>
);

const SMARTPAGE_ITEMS = [
  {
    id: 'catalogue',
    title: 'Catalogue',
    icon: BookOpen,
    link: '/catalog'
  },
  {
    id: 'installation-guide',
    title: 'Installation Guide',
    icon: Wrench,
    link: '/installation-guide'
  },
  {
    id: 'tile-adhesive-guide',
    title: 'Tile Adhesive Guide',
    icon: Layers,
    link: tileAdhesivePdf
  },
  {
    id: 'packing-manual',
    title: 'Packing Manual Guide',
    icon: Package,
    link: packingManualPdf
  }
];

const ADHESIVE_SPECS = [
  {
    property: 'Adhesive Classification',
    standard: 'ISO 13007 / EN 12004',
    specification: 'Class C2TE S1 (Standard) / C2TE S2 (Deformable)'
  },
  {
    property: 'Deformation Rating',
    standard: 'EN 12002',
    specification: 'S1 (≥ 2.5 mm) | S2 (≥ 5.0 mm)'
  },
  {
    property: 'Application Technique',
    standard: 'Double-Spreading',
    specification: '100% Void-Free Bedding (Back-Buttered)'
  },
  {
    property: 'Substrate Trowel Notch',
    standard: 'Slanted / Square Notch',
    specification: '10 mm – 15 mm Trowel'
  },
  {
    property: 'Slab Back Contact Coat',
    standard: 'Flat Trowel Coat',
    specification: '2 mm – 3 mm Continuous Layer'
  },
  {
    property: 'Pot Life & Open Time',
    standard: 'Ambient 25°C',
    specification: 'Pot Life: ~3-4 Hours | Open Time: 20-30 Mins'
  },
  {
    property: 'Grout Joint Clearance',
    standard: 'Movement Provision',
    specification: 'Min 2.0 mm (Interior) | Min 3.0 mm (Exterior/Heated)'
  }
];

const ADHESIVE_PROTOCOLS = [
  {
    title: '1. Mandatory Class C2TE S1 / S2 Cementitious Mortar',
    desc: 'Always use high-polymer, deformable cementitious adhesives formulated specifically for large format porcelain slabs and countertops. Never use standard sand-cement mortar or low-polymer adhesives.'
  },
  {
    title: '2. 100% Void-Free Double Spreading (Back-Buttering)',
    desc: 'Apply adhesive with a 10-15mm notched trowel to the substrate in parallel straight ridges (perpendicular to the short edge), and apply a 2-3mm flat contact coat on the back of the slab. This eliminates all air pockets beneath the 15mm surface.'
  },
  {
    title: '3. Slake Time & Low-Speed Mechanical Mixing',
    desc: 'Mix adhesive powder into measured potable water with a slow-speed paddle mixer (300-400 RPM). Allow 5 minutes slake time for chemical polymer activation, then re-mix briefly before spreading.'
  },
  {
    title: '4. Skinning & Open Time Management',
    desc: 'Never lay slabs onto adhesive that has formed a dry surface skin (usually after 20-30 minutes in warm conditions). Test ridges with a finger tip; if adhesive does not transfer, scrape off and re-apply fresh mortar.'
  },
  {
    title: '5. Heated Screeds & Countertop Substrates (Class S2)',
    desc: 'For installations over underfloor radiant heating, metal/wood countertop substructures, or outdoor kitchens subject to high thermal expansion, always specify ultra-flexible Class S2 mortar (transverse deformation ≥ 5.0mm).'
  }
];

const PACKAGING_SPECS = [
  {
    size: '800 × 2400 mm',
    thickness: '15 mm',
    pcs: '1 Pc',
    sqm: '1.92 sq.m',
    sqft: '20.67 sq.ft',
    weight: '~68.0 kg',
    pallet: 'A-Frame Crate'
  },
  {
    size: '1200 × 2400 mm',
    thickness: '15 mm',
    pcs: '1 Pc',
    sqm: '2.88 sq.m',
    sqft: '31.00 sq.ft',
    weight: '~102.0 kg',
    pallet: 'A-Frame Crate'
  },
  {
    size: '1200 × 1800 mm',
    thickness: '15 mm',
    pcs: '1 Pc',
    sqm: '2.16 sq.m',
    sqft: '23.25 sq.ft',
    weight: '~76.5 kg',
    pallet: 'Pallet Box'
  },
  {
    size: '800 × 3000 mm',
    thickness: '15 mm',
    pcs: '1 Pc',
    sqm: '2.40 sq.m',
    sqft: '25.83 sq.ft',
    weight: '~85.0 kg',
    pallet: 'A-Frame Crate'
  }
];

const CountertopSmartpage = () => {
  const [packingModalOpen, setPackingModalOpen] = useState(false);
  const [adhesiveModalOpen, setAdhesiveModalOpen] = useState(false);

  return (
    <div className="relative min-h-screen font-sans selection:bg-[#5D4037] selection:text-white bg-white">
      <SEO
        title="15mm Countertop Product Knowledge | FLAIS Granito"
        description="Official technical manual, catalogue, installation guidelines, packing manual, and tile adhesive guide for FLAIS Granito 15mm Porcelain Countertop Slabs."
        keywords="15mm porcelain slabs, flais granito catalogue, countertop installation guide, tile packing manual, tile adhesive guide, 15mm slab box specs"
      />

      {/* Natural Vera White Marble Countertop Background - Pure without dark veil */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center pointer-events-none"
        style={{
          backgroundImage: `url(${veraWhiteBg})`
        }}
      />

      {/* Main Content Container */}
      <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-8 sm:py-12 flex flex-col items-center">

        {/* Brand Card & Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full bg-zinc-950/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-zinc-800 shadow-2xl text-center mb-6"
        >
          {/* Flais White Logo */}
          <div className="flex justify-center mb-5">
            <img
              src={flaisLogoWhite}
              alt="FLAIS Granito"
              className="h-9 sm:h-11 w-auto object-contain"
            />
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-2xl sm:text-3xl font-display font-bold text-white uppercase tracking-tight mb-1">
            Learn before you lay
          </h1>
          <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-[#c5a880] mb-3">
            15mm Countertop & Porcelain Slabs
          </p>
          <p className="text-xs sm:text-[13px] text-zinc-200 font-normal max-w-md mx-auto leading-relaxed">
            Essential catalogue collections, technical installation manual, packaging specifications, and adhesive standards for architects, fabricators, and master contractors.
          </p>

          {/* Quick Contact Bar */}
          <div className="mt-6 pt-5 border-t border-zinc-800 flex items-center justify-center gap-3 sm:gap-4">
            <a
              href="tel:+919586733300"
              aria-label="Call technical desk"
              className="w-11 h-11 rounded-full bg-zinc-900 hover:bg-[#5D4037] text-[#c5a880] hover:text-white border border-zinc-800 hover:border-[#c5a880] flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95"
            >
              <Phone size={18} />
            </a>

            <a
              href="https://wa.me/919586733300?text=Hello%20FLAIS%20Granito%2C%20I%20have%20an%20inquiry%20about%2015mm%20Countertops."
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
              className="w-11 h-11 rounded-full bg-zinc-900 hover:bg-[#25D366] text-[#25D366] hover:text-white border border-zinc-800 hover:border-[#25D366] flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95"
            >
              <WhatsAppIcon size={19} />
            </a>

            <a
              href="mailto:info@flaisgranito.com?subject=15mm%20Countertop%20Technical%20Inquiry"
              aria-label="Send email"
              className="w-11 h-11 rounded-full bg-zinc-900 hover:bg-[#5D4037] text-[#c5a880] hover:text-white border border-zinc-800 hover:border-[#c5a880] flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95"
            >
              <Mail size={18} />
            </a>

            <a
              href="https://maps.google.com/?q=FLAIS+GRANITO+Morbi"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="View Factory & Showroom Location"
              className="w-11 h-11 rounded-full bg-zinc-900 hover:bg-[#5D4037] text-[#c5a880] hover:text-white border border-zinc-800 hover:border-[#c5a880] flex items-center justify-center transition-all duration-300 shadow-sm active:scale-95"
            >
              <MapPin size={18} />
            </a>
          </div>
        </motion.div>

        {/* 4 Main Action Cards */}
        <div className="w-full space-y-4 mb-8">
          {SMARTPAGE_ITEMS.map((item, index) => {
            const IconComponent = item.icon;
            const isExternal = Boolean(
              item.link &&
              (typeof item.link === 'string' &&
                (item.link.startsWith('http') ||
                 item.link.endsWith('.pdf') ||
                 item.link.includes('.pdf') ||
                 item.link.includes('/assets/')))
            );
            const CardWrapper = item.link ? (isExternal ? 'a' : Link) : 'div';
            const handleCardClick = () => {
              if (item.id === 'packing-manual') {
                if (item.link) {
                  window.open(item.link, '_blank');
                } else {
                  setPackingModalOpen(true);
                }
              } else if (item.id === 'tile-adhesive-guide') {
                setAdhesiveModalOpen(true);
              }
            };
            const wrapperProps = item.link
              ? (isExternal
                  ? { href: item.link, target: '_blank', rel: 'noopener noreferrer' }
                  : { to: item.link, target: '_blank', rel: 'noopener noreferrer' })
              : { onClick: handleCardClick };

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
              >
                <CardWrapper
                  {...wrapperProps}
                  className="group relative w-full bg-zinc-950/95 hover:bg-black backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-zinc-800 hover:border-[#c5a880]/60 shadow-xl hover:shadow-[0_12px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(197,168,128,0.12)] transition-all duration-300 cursor-pointer flex items-center gap-4 select-none active:scale-[0.99] text-inherit no-underline"
                >
                  {/* Left Icon */}
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center shrink-0 bg-[#1c1a17] border border-[#c5a880]/30 text-[#c5a880] group-hover:bg-[#5D4037] group-hover:text-white group-hover:border-[#c5a880] transition-all duration-300 shadow-inner">
                    <IconComponent size={24} />
                  </div>

                  {/* Center Content - Only Title */}
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="text-base sm:text-lg font-display font-bold text-white group-hover:text-[#c5a880] transition-colors tracking-wide truncate">
                      {item.title}
                    </h3>
                  </div>

                  {/* Right Action Chevron / External Link Indicator */}
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:border-[#c5a880] group-hover:bg-[#5D4037] group-hover:text-white flex items-center justify-center shrink-0 transition-all duration-300 shadow-sm">
                    {item.link ? <ExternalLink size={16} /> : <ChevronRight size={18} />}
                  </div>
                </CardWrapper>
              </motion.div>
            );
          })}
        </div>

        {/* Minimal Luxury Footer */}
        <footer className="w-full text-center text-zinc-900 text-xs space-y-1.5 pb-8">
          <p className="text-xs sm:text-[13px] font-bold text-zinc-950 tracking-wide">
            Manufactured By Keval Granito LLP
          </p>
          <p className="text-[11px] sm:text-xs font-semibold text-zinc-800">
            FLAIS GRANITO • Survey No. 151/pl, Unchi Mandal, Halvad Highway, Gujarat 363642, India
          </p>
          <p className="text-[10px] sm:text-[11px] font-medium text-zinc-700">
            © {new Date().getFullYear()} FLAIS GRANITO. All rights reserved.
          </p>
        </footer>
      </div>

      {/* MODAL: Packing Manual Modal */}
      <AnimatePresence>
        {packingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPackingModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 sm:p-8 z-10 scrollbar-none"
            >
              <div className="flex items-start justify-between border-b border-zinc-100 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded">
                    Packaging & Logistics
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-zinc-900 mt-2">
                    15mm Countertop Packing Manual
                  </h3>
                  <p className="text-xs text-zinc-500 font-light mt-1">
                    Packaging dimensions, coverage, weights, and transport handling standards.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setPackingModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Packaging Specifications Table */}
              <div className="mb-6">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2.5 flex items-center gap-2">
                  <Package size={14} className="text-[#5D4037]" />
                  <span>Standard Box & Crate Packaging Specs</span>
                </h4>

                <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-zinc-700 border-b border-zinc-200 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Slab Size</th>
                        <th className="p-3">Thickness</th>
                        <th className="p-3">Pcs/Box</th>
                        <th className="p-3">Area / Box</th>
                        <th className="p-3">Approx Weight</th>
                        <th className="p-3">Pallet Type</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-600">
                      {PACKAGING_SPECS.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="p-3 font-semibold text-zinc-900 whitespace-nowrap">{row.size}</td>
                          <td className="p-3 whitespace-nowrap">{row.thickness}</td>
                          <td className="p-3 whitespace-nowrap">{row.pcs}</td>
                          <td className="p-3 whitespace-nowrap">{row.sqm} ({row.sqft})</td>
                          <td className="p-3 font-medium text-[#5D4037] whitespace-nowrap">{row.weight}</td>
                          <td className="p-3 whitespace-nowrap">{row.pallet}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Logistics & Handling Protocols */}
              <div className="space-y-3 mb-6">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Truck size={14} className="text-[#5D4037]" />
                  <span>Logistics & Safe Handling Protocols</span>
                </h4>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60">
                  <h5 className="text-xs font-bold text-zinc-900 mb-1">
                    1. Heavy-Duty Corrugated Carton with Corner Protectors
                  </h5>
                  <p className="text-xs text-zinc-600 font-light leading-relaxed">
                    Each 15mm countertop slab is individually sealed with edge guards, multi-layer shock-absorbing corrugated paper, and heavy-duty corner caps to avoid chipping in transit.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60">
                  <h5 className="text-xs font-bold text-zinc-900 mb-1">
                    2. Vertical A-Frame Stacking (Never Lay Flat)
                  </h5>
                  <p className="text-xs text-zinc-600 font-light leading-relaxed">
                    Crated slabs must always be stored and transported vertically on rubber-cushioned A-frames at a 3° to 5° inclination. Horizontal stacking causes excessive bending stress and is strictly prohibited.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60">
                  <h5 className="text-xs font-bold text-zinc-900 mb-1">
                    3. Mechanical Vacuum Lifting Frame
                  </h5>
                  <p className="text-xs text-zinc-600 font-light leading-relaxed">
                    Always unload and maneuver slabs using certified multi-cup suction frames with rigid crossbars (minimum 6-8 suction points) supported by a minimum 2 to 4 trained handlers.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60">
                  <h5 className="text-xs font-bold text-zinc-900 mb-1">
                    4. Forklift & Crane Unloading Safety
                  </h5>
                  <p className="text-xs text-zinc-600 font-light leading-relaxed">
                    Forklifts must utilize extended tines of at least 2.0m length to support the crate center of gravity. Overhead cranes must use certified textile spreader slings.
                  </p>
                </div>
              </div>

              {/* Action CTAs */}
              <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/919586733300?text=Hello%20FLAIS%20Granito%2C%20I%20have%20a%20logistics%20inquiry%20regarding%2015mm%20countertop%20packaging%20and%20pallet%20crates."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 px-4 bg-[#5D4037] hover:bg-[#4a332c] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
                >
                  <WhatsAppIcon size={16} />
                  <span>Inquire Packaging on WhatsApp</span>
                </a>

                <a
                  href="tel:+919586733300"
                  className="py-3.5 px-5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 text-center"
                >
                  <Phone size={15} />
                  <span>Call Logistics Desk</span>
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Tile Adhesive Guide Modal */}
      <AnimatePresence>
        {adhesiveModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setAdhesiveModalOpen(false)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 sm:p-8 z-10 scrollbar-none"
            >
              <div className="flex items-start justify-between border-b border-zinc-100 pb-4 mb-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#8D5B4C] bg-amber-50 px-2.5 py-0.5 rounded border border-[#c5a880]/30">
                    Bonding & Materials
                  </span>
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-zinc-900 mt-2">
                    Tile Adhesive Guide
                  </h3>
                  <p className="text-xs text-zinc-500 font-light mt-1">
                    EN 12004 Class C2TE S1/S2 adhesive standards, trowel application, and bonding protocols.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAdhesiveModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Adhesive Specifications Table */}
              <div className="mb-6">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2.5 flex items-center gap-2">
                  <Layers size={14} className="text-[#5D4037]" />
                  <span>Adhesive Technical Parameters (15mm Slabs)</span>
                </h4>

                <div className="overflow-x-auto rounded-2xl border border-zinc-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAF8F5] text-zinc-700 border-b border-zinc-200 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3">Specification Parameter</th>
                        <th className="p-3">Standard / Method</th>
                        <th className="p-3">FLAIS Recommended Specification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-600">
                      {ADHESIVE_SPECS.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/80 transition-colors">
                          <td className="p-3 font-semibold text-zinc-900 whitespace-nowrap">{row.property}</td>
                          <td className="p-3 whitespace-nowrap text-zinc-500">{row.standard}</td>
                          <td className="p-3 font-medium text-[#5D4037]">{row.specification}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Adhesive Application Protocols */}
              <div className="space-y-3 mb-6">
                <h4 className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <FileText size={14} className="text-[#5D4037]" />
                  <span>Critical Installation & Troweling Protocols</span>
                </h4>

                {ADHESIVE_PROTOCOLS.map((protocol, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200/60">
                    <h5 className="text-xs font-bold text-zinc-900 mb-1">
                      {protocol.title}
                    </h5>
                    <p className="text-xs text-zinc-600 font-light leading-relaxed">
                      {protocol.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* Action CTAs */}
              <div className="pt-4 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://wa.me/919586733300?text=Hello%20FLAIS%20Granito%2C%20I%20have%20an%20inquiry%20regarding%20Tile%20Adhesive%20for%2015mm%20Slabs."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-3.5 px-4 bg-[#5D4037] hover:bg-[#4a332c] text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 shadow-sm text-center"
                >
                  <WhatsAppIcon size={16} />
                  <span>Inquire Adhesive on WhatsApp</span>
                </a>

                <a
                  href={tileAdhesivePdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3.5 px-5 bg-amber-50 hover:bg-amber-100 text-[#5D4037] border border-[#c5a880]/40 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 text-center"
                >
                  <Download size={15} />
                  <span>Download Official PDF</span>
                </a>

                <a
                  href="tel:+919586733300"
                  className="py-3.5 px-5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 text-center"
                >
                  <Phone size={15} />
                  <span>Call Technical Desk</span>
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
