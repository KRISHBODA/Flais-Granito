import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe, ArrowRight } from 'lucide-react';
import logo from '../assets/Flais White.png';
import api from '../utils/api';



const Footer = () => {
  const [footerSettings, setFooterSettings] = React.useState({
    phone1: '+91 95867 33300',
    phone2: '+91 98983 04831',
    email: 'info@flaisgranito.com',
    address: 'Survey No. 151/pl, Unchi Mandal, Halvad Highway, Gujarat 363642, India.'
  });

  React.useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.settings) {
          const { phone1, phone2, email, address } = res.data.settings;
          setFooterSettings({ phone1, phone2, email, address });
        }
      } catch (err) {
                // Fallback to local storage if available
        const saved = localStorage.getItem('flais_footer_settings');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            setFooterSettings(prev => ({ ...prev, ...parsed }));
          } catch (e) {
            // Silent fail
          }
        }
      }
    };
    fetchFooterSettings();
  }, []);

  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://www.facebook.com/share/1Eqo7HDYNb/',
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      )
    },
    {
      name: 'Linkedin',
      href: 'https://www.linkedin.com/in/flais-tiles-and-adhesive-54b353201?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: 'https://www.instagram.com/flais_tiles.and.adhesives?igsh=Y29neGJjeTlpMHo0',
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    },
    {
      name: 'Youtube',
      href: 'https://youtube.com/@flais_tiles.and.adhesives?si=5PMCOWaJ4LTMG6BI',
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.46 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z" />
          <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
        </svg>
      )
    },
    {
      name: 'Pinterest',
      href: 'https://pin.it/3NKlK8ujW',
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12c0 4.27 2.68 7.91 6.46 9.38-.09-.8-.16-2.02.03-2.9.18-.78 1.16-5.01 1.16-5.01s-.3-.59-.3-1.47c0-1.38.8-2.41 1.79-2.41.85 0 1.26.63 1.26 1.39 0 .85-.54 2.13-.82 3.31-.24.99.49 1.8 1.48 1.8 1.78 0 3.15-1.88 3.15-4.59 0-2.4-1.72-4.08-4.19-4.08-2.85 0-4.52 2.14-4.52 4.34 0 .86.33 1.78.74 2.28.08.1.09.19.07.28-.08.32-.25 1.02-.28 1.15-.04.17-.14.2-.33.12-1.25-.58-2.03-2.42-2.03-3.89 0-3.17 2.3-6.09 6.65-6.09 3.49 0 6.2 2.49 6.2 5.81 0 3.47-2.19 6.26-5.23 6.26-1.02 0-1.98-.53-2.31-1.15l-.63 2.4c-.23.88-.85 1.98-1.27 2.66C8.86 21.72 10.39 22 12 22c5.52 0 10-4.48 10-10S17.52 2 12 2z" />
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-zinc-950 text-zinc-400 pt-14 sm:pt-20 md:pt-24 pb-8 sm:pb-12">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 sm:gap-12 md:gap-16 mb-12 sm:mb-16 md:mb-20">
          {/* Column 1: Contact Info */}
          <div className="space-y-8 flex flex-col justify-between h-full">
            <div className="space-y-8">
              <Link to="/" className="inline-block">
                <img loading="lazy" src={logo} alt="FLAIS GRANITO" className="h-12 w-[160px] object-contain origin-left" />
              </Link>
              <div className="space-y-6 text-[15px]">
                <div className="flex items-start space-x-4">
                  <MapPin size={20} className="text-white shrink-0 mt-1" />
                  <p className="leading-relaxed text-zinc-400 hover:text-white transition-colors cursor-default">
                    {footerSettings.address}
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <Phone size={20} className="text-white shrink-0" />
                  <div className="flex flex-col">
                    {footerSettings.phone1 && <a href={`tel:${footerSettings.phone1.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">{footerSettings.phone1}</a>}
                    {footerSettings.phone2 && <a href={`tel:${footerSettings.phone2.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">{footerSettings.phone2}</a>}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Mail size={20} className="text-white shrink-0" />
                  <a href={`mailto:${footerSettings.email}`} className="hover:text-white transition-colors">{footerSettings.email}</a>
                </div>
              </div>
            </div>

            {/* Social Icons */}
            <div className="flex items-center space-x-4 pt-6 mt-auto">
              {socialLinks.map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-400 hover:bg-[#5D4037] hover:text-white transition-all border border-zinc-800"
                  aria-label={social.name}
                >
                  <social.icon width="18" height="18" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-8">
            <h4 className="text-white font-display font-bold text-lg uppercase tracking-widest relative inline-block">
              Company
              <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-[#5D4037]"></span>
            </h4>
            <ul className="space-y-4 text-[15px] font-medium">
              <li><Link to="/about" className="hover:text-white transition-colors flex items-center group"><ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all text-[#5D4037]" /> Why FLAIS</Link></li>
              <li><Link to="/where-to-buy" className="hover:text-white transition-colors flex items-center group"><ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all text-[#5D4037]" /> Where to Buy</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors flex items-center group"><ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all text-[#5D4037]" /> Manufacturing Excellence</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors flex items-center group"><ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all text-[#5D4037]" /> Certification</Link></li>
              <li><Link to="/calculator" className="hover:text-white transition-colors flex items-center group"><ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all text-[#5D4037]" /> Tile Calculator</Link></li>
            </ul>
          </div>

          {/* Column 3: Collection */}
          <div className="space-y-8 flex flex-col justify-between h-full">
            <div className="space-y-8">
              <h4 className="text-white font-display font-bold text-lg uppercase tracking-widest relative inline-block">
                Collection
                <span className="absolute -bottom-2 left-0 w-8 h-0.5 bg-[#5D4037]"></span>
              </h4>
              <ul className="space-y-4 text-[15px] font-medium">
                <li><Link to="/products?cat=full-body" className="hover:text-white transition-colors flex items-center group"><ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all text-[#5D4037]" /> Full Body Tiles</Link></li>
                <li><Link to="/products?cat=digital-full-body" className="hover:text-white transition-colors flex items-center group"><ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all text-[#5D4037]" /> Color Body Tiles</Link></li>
                <li><Link to="/catalog" className="hover:text-white transition-colors flex items-center group"><ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all text-[#5D4037]" /> Downloads</Link></li>
                <li><Link to="/blog" className="hover:text-white transition-colors flex items-center group"><ArrowRight size={14} className="mr-2 opacity-0 group-hover:opacity-100 -ml-5 group-hover:ml-0 transition-all text-[#5D4037]" /> Latest Blogs</Link></li>
              </ul>
            </div>
            <div className="pt-6 mt-auto flex flex-col items-start justify-start gap-2 select-none">
              <span className="text-[15px] font-semibold tracking-wider text-zinc-500">
                Developed by Krish Boda
              </span>
              <a href="tel:9313735697" className="text-[15px] font-medium tracking-wider text-zinc-500 hover:text-white transition-colors select-text">
                +91 93137 35697
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-10 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-4 text-[11px] sm:text-[13px] font-medium tracking-wider text-center">
            <span>&copy; 2020</span>
            <span className="font-bold text-white uppercase tracking-widest">Keval Granito LLP</span>
            <span>ALL RIGHTS RESERVED.</span>
          </div>
          <div className="flex items-center space-x-4 sm:space-x-6 text-[10px] uppercase tracking-widest font-bold">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
