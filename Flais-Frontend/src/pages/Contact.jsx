import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, MessageCircle, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import SEO from '../components/SEO';
import contactHero from '../assets/contact_hero.jpg';
import api from '../utils/api';
import { getOptimizedImageUrl, getOptimizedVideoUrl } from '../utils/imageOptimizer';
import { validatePhoneNumberLength, isValidPhoneNumber, parsePhoneNumberFromString, getExampleNumber } from 'libphonenumber-js';
import examples from 'libphonenumber-js/mobile/examples';

const countryCodes = [
  { code: '+91', name: 'India IN', iso: 'IN' },
  { code: '+93', name: 'Afghanistan', iso: 'AF' },
  { code: '+355', name: 'Albania', iso: 'AL' },
  { code: '+213', name: 'Algeria', iso: 'DZ' },
  { code: '+376', name: 'Andorra', iso: 'AD' },
  { code: '+244', name: 'Angola', iso: 'AO' },
  { code: '+1-268', name: 'Antigua and Barbuda', iso: 'AG' },
  { code: '+54', name: 'Argentina', iso: 'AR' },
  { code: '+374', name: 'Armenia', iso: 'AM' },
  { code: '+61', name: 'Australia', iso: 'AU' },
  { code: '+43', name: 'Austria', iso: 'AT' },
  { code: '+994', name: 'Azerbaijan', iso: 'AZ' },
  { code: '+1-242', name: 'Bahamas', iso: 'BS' },
  { code: '+973', name: 'Bahrain', iso: 'BH' },
  { code: '+880', name: 'Bangladesh', iso: 'BD' },
  { code: '+1-246', name: 'Barbados', iso: 'BB' },
  { code: '+375', name: 'Belarus', iso: 'BY' },
  { code: '+32', name: 'Belgium', iso: 'BE' },
  { code: '+501', name: 'Belize', iso: 'BZ' },
  { code: '+229', name: 'Benin', iso: 'BJ' },
  { code: '+975', name: 'Bhutan', iso: 'BT' },
  { code: '+591', name: 'Bolivia', iso: 'BO' },
  { code: '+387', name: 'Bosnia and Herzegovina', iso: 'BA' },
  { code: '+267', name: 'Botswana', iso: 'BW' },
  { code: '+55', name: 'Brazil', iso: 'BR' },
  { code: '+673', name: 'Brunei', iso: 'BN' },
  { code: '+359', name: 'Bulgaria', iso: 'BG' },
  { code: '+226', name: 'Burkina Faso', iso: 'BF' },
  { code: '+257', name: 'Burundi', iso: 'BI' },
  { code: '+855', name: 'Cambodia', iso: 'KH' },
  { code: '+237', name: 'Cameroon', iso: 'CM' },
  { code: '+1', name: 'Canada', iso: 'CA' },
  { code: '+238', name: 'Cape Verde', iso: 'CV' },
  { code: '+236', name: 'Central African Republic', iso: 'CF' },
  { code: '+235', name: 'Chad', iso: 'TD' },
  { code: '+56', name: 'Chile', iso: 'CL' },
  { code: '+86', name: 'China', iso: 'CN' },
  { code: '+57', name: 'Colombia', iso: 'CO' },
  { code: '+269', name: 'Comoros', iso: 'KM' },
  { code: '+242', name: 'Congo (Republic)', iso: 'CG' },
  { code: '+243', name: 'Congo (Democratic Republic)', iso: 'CD' },
  { code: '+506', name: 'Costa Rica', iso: 'CR' },
  { code: '+385', name: 'Croatia', iso: 'HR' },
  { code: '+53', name: 'Cuba', iso: 'CU' },
  { code: '+357', name: 'Cyprus', iso: 'CY' },
  { code: '+420', name: 'Czech Republic', iso: 'CZ' },
  { code: '+45', name: 'Denmark', iso: 'DK' },
  { code: '+253', name: 'Djibouti', iso: 'DJ' },
  { code: '+1-767', name: 'Dominica', iso: 'DM' },
  { code: '+1-809', name: 'Dominican Republic', iso: 'DO' },
  { code: '+593', name: 'Ecuador', iso: 'EC' },
  { code: '+20', name: 'Egypt', iso: 'EG' },
  { code: '+503', name: 'El Salvador', iso: 'SV' },
  { code: '+240', name: 'Equatorial Guinea', iso: 'GQ' },
  { code: '+291', name: 'Eritrea', iso: 'ER' },
  { code: '+372', name: 'Estonia', iso: 'EE' },
  { code: '+251', name: 'Ethiopia', iso: 'ET' },
  { code: '+679', name: 'Fiji', iso: 'FJ' },
  { code: '+358', name: 'Finland', iso: 'FI' },
  { code: '+33', name: 'France', iso: 'FR' },
  { code: '+241', name: 'Gabon', iso: 'GA' },
  { code: '+220', name: 'Gambia', iso: 'GM' },
  { code: '+995', name: 'Georgia', iso: 'GE' },
  { code: '+49', name: 'Germany', iso: 'DE' },
  { code: '+233', name: 'Ghana', iso: 'GH' },
  { code: '+30', name: 'Greece', iso: 'GR' },
  { code: '+1-473', name: 'Grenada', iso: 'GD' },
  { code: '+502', name: 'Guatemala', iso: 'GT' },
  { code: '+224', name: 'Guinea', iso: 'GN' },
  { code: '+245', name: 'Guinea-Bissau', iso: 'GW' },
  { code: '+592', name: 'Guyana', iso: 'GY' },
  { code: '+509', name: 'Haiti', iso: 'HT' },
  { code: '+504', name: 'Honduras', iso: 'HN' },
  { code: '+852', name: 'Hong Kong', iso: 'HK' },
  { code: '+36', name: 'Hungary', iso: 'HU' },
  { code: '+354', name: 'Iceland', iso: 'IS' },
  { code: '+62', name: 'Indonesia', iso: 'ID' },
  { code: '+98', name: 'Iran', iso: 'IR' },
  { code: '+964', name: 'Iraq', iso: 'IQ' },
  { code: '+353', name: 'Ireland', iso: 'IE' },
  { code: '+972', name: 'Israel', iso: 'IL' },
  { code: '+39', name: 'Italy', iso: 'IT' },
  { code: '+225', name: 'Ivory Coast', iso: 'CI' },
  { code: '+1-876', name: 'Jamaica', iso: 'JM' },
  { code: '+81', name: 'Japan', iso: 'JP' },
  { code: '+962', name: 'Jordan', iso: 'JO' },
  { code: '+7', name: 'Kazakhstan', iso: 'KZ' },
  { code: '+254', name: 'Kenya', iso: 'KE' },
  { code: '+686', name: 'Kiribati', iso: 'KI' },
  { code: '+965', name: 'Kuwait', iso: 'KW' },
  { code: '+996', name: 'Kyrgyzstan', iso: 'KG' },
  { code: '+856', name: 'Laos', iso: 'LA' },
  { code: '+371', name: 'Latvia', iso: 'LV' },
  { code: '+961', name: 'Lebanon', iso: 'LB' },
  { code: '+266', name: 'Lesotho', iso: 'LS' },
  { code: '+231', name: 'Liberia', iso: 'LR' },
  { code: '+218', name: 'Libya', iso: 'LY' },
  { code: '+423', name: 'Liechtenstein', iso: 'LI' },
  { code: '+370', name: 'Lithuania', iso: 'LT' },
  { code: '+352', name: 'Luxembourg', iso: 'LU' },
  { code: '+853', name: 'Macao', iso: 'MO' },
  { code: '+389', name: 'Macedonia', iso: 'MK' },
  { code: '+261', name: 'Madagascar', iso: 'MG' },
  { code: '+265', name: 'Malawi', iso: 'MW' },
  { code: '+60', name: 'Malaysia', iso: 'MY' },
  { code: '+960', name: 'Maldives', iso: 'MV' },
  { code: '+223', name: 'Mali', iso: 'ML' },
  { code: '+356', name: 'Malta', iso: 'MT' },
  { code: '+692', name: 'Marshall Islands', iso: 'MH' },
  { code: '+222', name: 'Mauritania', iso: 'MR' },
  { code: '+230', name: 'Mauritius', iso: 'MU' },
  { code: '+52', name: 'Mexico', iso: 'MX' },
  { code: '+691', name: 'Micronesia', iso: 'FM' },
  { code: '+373', name: 'Moldova', iso: 'MD' },
  { code: '+377', name: 'Monaco', iso: 'MC' },
  { code: '+976', name: 'Mongolia', iso: 'MN' },
  { code: '+382', name: 'Montenegro', iso: 'ME' },
  { code: '+212', name: 'Morocco', iso: 'MA' },
  { code: '+258', name: 'Mozambique', iso: 'MZ' },
  { code: '+95', name: 'Myanmar', iso: 'MM' },
  { code: '+264', name: 'Namibia', iso: 'NA' },
  { code: '+674', name: 'Nauru', iso: 'NR' },
  { code: '+977', name: 'Nepal', iso: 'NP' },
  { code: '+31', name: 'Netherlands', iso: 'NL' },
  { code: '+64', name: 'New Zealand', iso: 'NZ' },
  { code: '+505', name: 'Nicaragua', iso: 'NI' },
  { code: '+227', name: 'Niger', iso: 'NE' },
  { code: '+234', name: 'Nigeria', iso: 'NG' },
  { code: '+850', name: 'North Korea', iso: 'KP' },
  { code: '+47', name: 'Norway', iso: 'NO' },
  { code: '+968', name: 'Oman', iso: 'OM' },
  { code: '+92', name: 'Pakistan', iso: 'PK' },
  { code: '+680', name: 'Palau', iso: 'PW' },
  { code: '+507', name: 'Panama', iso: 'PA' },
  { code: '+675', name: 'Papua New Guinea', iso: 'PG' },
  { code: '+595', name: 'Paraguay', iso: 'PY' },
  { code: '+51', name: 'Peru', iso: 'PE' },
  { code: '+63', name: 'Philippines', iso: 'PH' },
  { code: '+48', name: 'Poland', iso: 'PL' },
  { code: '+351', name: 'Portugal', iso: 'PT' },
  { code: '+974', name: 'Qatar', iso: 'QA' },
  { code: '+40', name: 'Romania', iso: 'RO' },
  { code: '+7', name: 'Russia', iso: 'RU' },
  { code: '+250', name: 'Rwanda', iso: 'RW' },
  { code: '+1-869', name: 'Saint Kitts and Nevis', iso: 'KN' },
  { code: '+1-758', name: 'Saint Lucia', iso: 'LC' },
  { code: '+1-784', name: 'Saint Vincent', iso: 'VC' },
  { code: '+685', name: 'Samoa', iso: 'WS' },
  { code: '+378', name: 'San Marino', iso: 'SM' },
  { code: '+239', name: 'Sao Tome and Principe', iso: 'ST' },
  { code: '+966', name: 'Saudi Arabia', iso: 'SA' },
  { code: '+221', name: 'Senegal', iso: 'SN' },
  { code: '+381', name: 'Serbia', iso: 'RS' },
  { code: '+248', name: 'Seychelles', iso: 'SC' },
  { code: '+232', name: 'Sierra Leone', iso: 'SL' },
  { code: '+65', name: 'Singapore', iso: 'SG' },
  { code: '+421', name: 'Slovakia', iso: 'SK' },
  { code: '+386', name: 'Slovenia', iso: 'SI' },
  { code: '+677', name: 'Solomon Islands', iso: 'SB' },
  { code: '+252', name: 'Somalia', iso: 'SO' },
  { code: '+27', name: 'South Africa', iso: 'ZA' },
  { code: '+82', name: 'South Korea', iso: 'KR' },
  { code: '+211', name: 'South Sudan', iso: 'SS' },
  { code: '+94', name: 'Sri Lanka', iso: 'LK' },
  { code: '+249', name: 'Sudan', iso: 'SD' },
  { code: '+597', name: 'Suriname', iso: 'SR' },
  { code: '+268', name: 'Swaziland', iso: 'SZ' },
  { code: '+46', name: 'Sweden', iso: 'SE' },
  { code: '+41', name: 'Switzerland', iso: 'CH' },
  { code: '+963', name: 'Syria', iso: 'SY' },
  { code: '+886', name: 'Taiwan', iso: 'TW' },
  { code: '+992', name: 'Tajikistan', iso: 'TJ' },
  { code: '+255', name: 'Tanzania', iso: 'TZ' },
  { code: '+66', name: 'Thailand', iso: 'TH' },
  { code: '+670', name: 'Timor-Leste', iso: 'TL' },
  { code: '+228', name: 'Togo', iso: 'TG' },
  { code: '+676', name: 'Tonga', iso: 'TO' },
  { code: '+1-868', name: 'Trinidad and Tobago', iso: 'TT' },
  { code: '+216', name: 'Tunisia', iso: 'TN' },
  { code: '+90', name: 'Turkey', iso: 'TR' },
  { code: '+993', name: 'Turkmenistan', iso: 'TM' },
  { code: '+688', name: 'Tuvalu', iso: 'TV' },
  { code: '+256', name: 'Uganda', iso: 'UG' },
  { code: '+380', name: 'Ukraine', iso: 'UA' },
  { code: '+971', name: 'United Arab Emirates', iso: 'AE' },
  { code: '+44', name: 'United Kingdom', iso: 'GB' },
  { code: '+1', name: 'United States', iso: 'US' },
  { code: '+598', name: 'Uruguay', iso: 'UY' },
  { code: '+998', name: 'Uzbekistan', iso: 'UZ' },
  { code: '+678', name: 'Vanuatu', iso: 'VU' },
  { code: '+379', name: 'Vatican City', iso: 'VA' },
  { code: '+58', name: 'Venezuela', iso: 'VE' },
  { code: '+84', name: 'Vietnam', iso: 'VN' },
  { code: '+967', name: 'Yemen', iso: 'YE' },
  { code: '+260', name: 'Zambia', iso: 'ZM' },
  { code: '+263', name: 'Zimbabwe', iso: 'ZW' }
];

const defaultPageSettings = {
  heroTitle: "Contact Us",
  heroSubtitle: "Have a question or planning a project? Reach out to our team of experts today.",
  heroMedia: "",
  address: "Survey No. 151/pl, Unchi Mandal, Halvad Highway, Gujarat 363642, India.",
  phone: "+91 95867 33300",
  email: "info@flaisgranito.com",
  facebook: "https://www.facebook.com/FlaisTile/",
  instagram: "https://www.instagram.com/flaisgranito/",
  linkedin: "https://www.linkedin.com/company/flais-granito/",
  youtube: "https://www.youtube.com/@FlaisGranito"
};

const Contact = () => {
  const [pageSettings, setPageSettings] = useState(defaultPageSettings);
  const [settingsLoading, setSettingsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data.success && response.data.settings) {
          setPageSettings({ ...defaultPageSettings, ...response.data.settings });
        }
      } catch (error) {
              } finally {
        setSettingsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const isVideo = React.useMemo(() => {
    const media = pageSettings.heroMedia;
    if (!media) return false;
    return /\.(mp4|webm|ogg|mov)/i.test(media) || media.includes('video') || media.includes('stream');
  }, [pageSettings.heroMedia]);

  const getWhatsAppLink = () => {
    if (!pageSettings.phone) return "https://wa.me/919586733300";
    const firstPhone = pageSettings.phone.split(',')[0].trim();
    const digits = firstPhone.replace(/\D/g, '');
    return `https://wa.me/${digits}`;
  };

  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": `Contact ${pageSettings.heroTitle || "FLAIS GRANITO"}`,
    "description": pageSettings.heroSubtitle || "Have questions about our tiles or need a quote? Contact FLAIS GRANITO today. Our support team is ready to help you with tile selection and orders.",
    "mainEntity": {
      "@type": "LocalBusiness",
      "name": "FLAIS GRANITO",
      "telephone": (pageSettings.phone || "+919586733300").replace(/\s+/g, ''),
      "email": pageSettings.email || "info@flaisgranito.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": pageSettings.address || "Survey No. 151/pl, Unchi Mandal, Halvad Highway",
        "addressLocality": "Morbi",
        "addressRegion": "Gujarat",
        "postalCode": "363642",
        "addressCountry": "IN"
      }
    }
  };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [selectedCountryIndex, setSelectedCountryIndex] = useState(0); // 0 corresponds to India IN (+91)
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentCountry = countryCodes[selectedCountryIndex] || countryCodes[0];

  // Dynamically derive max phone digits from libphonenumber-js metadata
  const getMaxDigits = (iso) => {
    try {
      const example = getExampleNumber(iso, examples);
      return example ? example.nationalNumber.length : 15;
    } catch { return 15; }
  };

  const currentMaxDigits = getMaxDigits(currentCountry?.iso);

  const validatePhoneNumberInput = (phone, iso) => {
    if (!phone || !phone.trim()) {
      return "Phone number is required.";
    }

    // Normalize: strip all spaces, dashes, parentheses
    const normalized = phone.replace(/[\s\-()]/g, '');

    // Allow formatting characters but check if other non-digits remain
    if (/[^\d]/.test(normalized)) {
      return "Please enter a valid phone number for the selected country.";
    }

    if (!iso) {
      return normalized.length >= 6 ? null : "Phone number is too short for the selected country.";
    }

    const lengthResult = validatePhoneNumberLength(normalized, iso);
    if (lengthResult === 'TOO_SHORT') {
      return "Phone number is too short for the selected country.";
    }
    if (lengthResult === 'TOO_LONG') {
      return "Phone number is too long for the selected country.";
    }
    if (lengthResult === 'INVALID_COUNTRY' || lengthResult === 'NOT_A_NUMBER') {
      return "Please enter a valid phone number for the selected country.";
    }

    if (!isValidPhoneNumber(normalized, iso)) {
      return "Please enter a valid phone number for the selected country.";
    }

    return null;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const pError = validatePhoneNumberInput(formData.phone, currentCountry.iso);
    if (pError) {
      setPhoneError(pError);
      toast.error(pError);
      return;
    }

    const normalized = formData.phone.replace(/[\s\-()]/g, '');
    const phoneNumberObject = parsePhoneNumberFromString(normalized, currentCountry.iso);
    const formattedPhone = phoneNumberObject ? phoneNumberObject.number : `${currentCountry.code}${normalized}`;

    try {
      setIsSubmitting(true);
      await api.post('/contact', {
        name: formData.name.trim(),
        email: formData.email,
        phone: formattedPhone,
        message: formData.message
      });
      toast.success("Message sent successfully!");
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      setSelectedCountryIndex(0);
      setPhoneError('');
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send message");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen bg-white">
      <SEO 
        title={pageSettings.heroTitle || "Contact Us"}
        description={pageSettings.heroSubtitle || "Have questions about our tiles or need a quote? Contact FLAIS GRANITO today. Our support team is ready to help you with tile selection and orders."}
        keywords="contact flais granito, tile dealer contact, tile factory location, contact details"
        schema={contactSchema}
      />
      {/* Header */}
      <section className="relative min-h-[180px] py-12 sm:min-h-[220px] md:min-h-[250px] flex items-center justify-center overflow-hidden">
        {isVideo ? (
          <video
            autoPlay
            muted
            playsInline
            loop
            className="absolute inset-0 w-full h-full object-cover filter brightness-[0.6]"
            key={pageSettings.heroMedia}
          >
            <source src={getOptimizedVideoUrl(pageSettings.heroMedia)} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <img loading="lazy" src={getOptimizedImageUrl(pageSettings.heroMedia) || contactHero} alt="Contact FLAIS GRANITO" className="absolute inset-0 w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="container-custom relative z-10 text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white">{pageSettings.heroTitle || "Contact Us"}</h1>
          <div className="h-1 w-20 bg-beige-600 mx-auto"></div>
          <p className="text-white/80 max-w-2xl mx-auto text-base sm:text-lg">
            {pageSettings.heroSubtitle || "Have a question or planning a project? Reach out to our team of experts today."}
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 md:py-24">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Info */}
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-3xl font-display font-bold">Get In Touch</h2>
                <p className="text-zinc-500 leading-relaxed">
                  Whether you're looking for a specific tile design or need a full consultation for your commercial project, we're here to help.
                </p>
              </div>

              <div className="space-y-6 sm:space-y-8">
                <div className="flex items-start space-x-4 sm:space-x-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-beige-100 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 text-beige-600">
                    <MapPin className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-base sm:text-lg">Our Location</h4>
                    <p className="text-zinc-600 text-sm sm:text-base">{pageSettings.address || "Survey No. 151/pl, Unchi Mandal, Halvad Highway, Gujarat 363642, India."}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 sm:space-x-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-beige-100 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 text-beige-600">
                    <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-base sm:text-lg">Call Us</h4>
                    <p className="text-zinc-600 text-sm sm:text-base">
                      {pageSettings.phone ? (
                        pageSettings.phone.split(',').map((p, idx) => (
                          <React.Fragment key={idx}>
                            {p.trim()}
                            {idx < pageSettings.phone.split(',').length - 1 && <br />}
                          </React.Fragment>
                        ))
                      ) : (
                        <>+91 95867 33300<br />+91 98983 04831</>
                      )}
                    </p>
                    <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">Mon - Sat: 9:00 AM - 7:00 PM</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 sm:space-x-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-beige-100 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 text-beige-600">
                    <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-zinc-900 text-base sm:text-lg">Email Us</h4>
                    <p className="text-zinc-600 text-sm sm:text-base">
                      {pageSettings.email ? (
                        pageSettings.email.split(',').map((e, idx) => (
                          <React.Fragment key={idx}>
                            {e.trim()}
                            {idx < pageSettings.email.split(',').length - 1 && <br />}
                          </React.Fragment>
                        ))
                      ) : (
                        <>info@flaisgranito.com<br />support@flaisgranito.com</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-zinc-100 space-y-6">
                <div>
                  <h4 className="font-bold text-zinc-900 text-lg mb-1">Connect With Us</h4>
                  <p className="text-zinc-500 text-sm">Follow our journey and stay updated with the latest collections.</p>
                </div>
                <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2.5 sm:gap-3">
                  {[
                    {
                      label: 'Facebook',
                      href: pageSettings.facebook || 'https://www.facebook.com/FlaisTile/',
                      color: '#1877F2',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                          <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.931-1.956 1.886v2.268h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z"/>
                        </svg>
                      )
                    },
                    {
                      label: 'Instagram',
                      href: pageSettings.instagram || 'https://www.instagram.com/flaisgranito/',
                      color: '#E1306C',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                        </svg>
                      )
                    },
                    {
                      label: 'LinkedIn',
                      href: pageSettings.linkedin || 'https://www.linkedin.com/company/flais-granito/',
                      color: '#0A66C2',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                        </svg>
                      )
                    },
                    {
                      label: 'YouTube',
                      href: pageSettings.youtube || 'https://www.youtube.com/@FlaisGranito',
                      color: '#FF0000',
                      icon: (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      )
                    }
                  ].map((social, i) => (
                    <a
                      key={i}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      style={{ '--brand': social.color }}
                      className="group flex items-center justify-center sm:justify-start gap-2 sm:gap-2.5 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-500 hover:text-white hover:border-transparent transition-all duration-300 shadow-sm"
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = social.color}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = ''; }}
                    >
                      <div className="w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shrink-0">
                        {social.icon}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold">{social.label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 shadow-xl sm:shadow-2xl ring-1 ring-zinc-100">
              {settingsLoading && (
                <div className="mb-4 rounded-xl bg-zinc-50 px-4 py-3 text-sm text-zinc-500">
                  Loading contact details from the admin settings...
                </div>
              )}
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-50 border-none rounded-xl p-3 sm:p-4 focus:ring-2 focus:ring-beige-500 text-sm sm:text-base" 
                    placeholder="John Doe" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">Email Address <span className="text-red-500">*</span></label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-50 border-none rounded-xl p-3 sm:p-4 focus:ring-2 focus:ring-beige-500 text-sm sm:text-base" 
                    placeholder="john@example.com" 
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">Phone Number <span className="text-red-500">*</span></label>
                  <div className="flex gap-2">
                    <select
                      value={selectedCountryIndex}
                      onChange={(e) => {
                        const idx = parseInt(e.target.value);
                        setSelectedCountryIndex(idx);
                        const newIso = countryCodes[idx]?.iso;
                        const newMax = getMaxDigits(newIso);
                        if (formData.phone) {
                          // Trim digits to new country's max
                          const digits = formData.phone.replace(/\D/g, '');
                          if (digits.length > newMax) {
                            const trimmed = digits.substring(0, newMax);
                            setFormData(prev => ({ ...prev, phone: trimmed }));
                            const error = validatePhoneNumberInput(trimmed, newIso);
                            setPhoneError(error || '');
                          } else {
                            const error = validatePhoneNumberInput(formData.phone, newIso);
                            setPhoneError(error || '');
                          }
                        }
                      }}
                      className="bg-zinc-50 border-none rounded-xl p-3 sm:p-4 focus:ring-2 focus:ring-beige-500 text-zinc-700 font-medium text-xs sm:text-sm outline-none cursor-pointer select-none w-[110px] sm:w-[125px] shrink-0"
                    >
                      {countryCodes.map((c, idx) => {
                        const shortName = c.name.includes('(') 
                          ? c.name.substring(c.name.indexOf('(') + 1, c.name.indexOf(')'))
                          : c.name.substring(0, 6);
                        return (
                          <option key={`${c.code}-${c.name}`} value={idx}>
                            {c.code} ({shortName})
                          </option>
                        );
                      })}
                    </select>
                    <input 
                      type="tel" 
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9 \-()]/g, '');
                        // Count only digits (ignore formatting chars)
                        const digitCount = val.replace(/\D/g, '').length;
                        if (digitCount > currentMaxDigits) return; // Block extra digits
                        setFormData(prev => ({ ...prev, phone: val }));
                        const error = validatePhoneNumberInput(val, currentCountry?.iso);
                        setPhoneError(error || '');
                      }}
                      className="flex-1 min-w-0 bg-zinc-50 border-none rounded-xl p-3 sm:p-4 focus:ring-2 focus:ring-beige-500 text-sm sm:text-base" 
                      placeholder="98765 43210" 
                      required
                    />
                  </div>
                  {phoneError && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">{phoneError}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-zinc-700">Your Message <span className="text-red-500">*</span></label>
                  <textarea 
                    rows={5} 
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-50 border-none rounded-xl p-3 sm:p-4 focus:ring-2 focus:ring-beige-500" 
                    placeholder="How can we help you?"
                    required
                  ></textarea>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full btn-primary py-4 flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                  <span>{isSubmitting ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map Integration */}
      <section className="h-[500px] w-full bg-zinc-200 relative grayscale hover:grayscale-0 transition-all duration-700">
        <iframe
          src={`https://maps.google.com/maps?q=${encodeURIComponent(pageSettings.address || "Survey No. 151/pl, Unchi Mandal, Halvad Highway, Gujarat 363642, India.")}&z=15&output=embed`}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          title="FLAIS GRANITO Location Map"
        ></iframe>
        <div className="absolute top-10 left-10 glass-card p-6 hidden md:block">
          <p className="font-bold text-zinc-900">FLAIS GRANITO Location</p>
          <p className="text-zinc-500 text-sm">Open until 7:00 PM</p>
          <a 
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pageSettings.address || "Survey No. 151/pl, Unchi Mandal, Halvad Highway, Gujarat 363642, India.")}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="mt-4 inline-block text-beige-600 font-bold text-sm hover:underline"
          >
            Get Directions
          </a>
        </div>
      </section>

      {/* Floating WhatsApp Action */}
      <section className="py-20 bg-beige-100">
        <div className="container-custom text-center space-y-8">
          <h2 className="text-3xl font-display font-bold">Prefer to chat on WhatsApp?</h2>
          <p className="text-zinc-500">Our customer service team is available for instant replies on WhatsApp.</p>
          <a href={getWhatsAppLink()} className="inline-flex items-center space-x-3 bg-[#25D366] text-white px-10 py-4 rounded-full font-bold shadow-xl hover:bg-[#128C7E] transition-colors">
            <MessageCircle size={24} fill="currentColor" />
            <span>Start WhatsApp Chat</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Contact;
