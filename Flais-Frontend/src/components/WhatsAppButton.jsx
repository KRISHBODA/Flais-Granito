import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../utils/api';

const WhatsAppButton = () => {
  const [whatsappUrl, setWhatsappUrl] = useState("https://wa.me/919909911772");

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/settings');
        if (res.data.success && res.data.settings) {
          const raw = res.data.settings.phone || res.data.settings.phone1;
          if (raw) {
            const digits = raw.split(',')[0].replace(/\D/g, '');
            if (digits) {
              setWhatsappUrl(`https://wa.me/${digits}`);
            }
          }
        }
      } catch (e) {
        // Fallback silently
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-8 sm:right-8 z-50">
      {/* Pulse Effect */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-[#25D366] rounded-full"
      />
      
      <motion.a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ 
          scale: 1.1,
          boxShadow: "0 20px 40px rgba(37, 211, 102, 0.3)"
        }}
        whileTap={{ scale: 0.9 }}
        className="relative bg-[#25D366] text-white p-3.5 sm:p-5 rounded-full shadow-[0_15px_30px_rgba(37,211,102,0.2)] flex items-center justify-center hover:bg-[#128C7E] transition-all duration-300"
      >
        <MessageCircle className="w-5 h-5 sm:w-7 sm:h-7" fill="currentColor" />
      </motion.a>
    </div>
  );
};

export default WhatsAppButton;
