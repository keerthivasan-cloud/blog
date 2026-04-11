import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Check, X } from 'lucide-react';

const CookieConsent = () => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    } else if (consent === 'accepted') {
      enableScripts();
    }
  }, []);

  const enableScripts = () => {
    // Dynamic AdSense Loading Example
    const script = document.createElement('script');
    script.async = true;
    script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_ID_HERE";
    script.crossOrigin = "anonymous";
    document.head.appendChild(script);
    console.log("[Intelligence Hub] AdSense Modules Activated");
  };

  const handleChoice = (choice) => {
    localStorage.setItem('cookie_consent', choice);
    if (choice === 'accepted') enableScripts();
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 50 }}
          className="fixed bottom-8 right-8 z-[100] max-w-sm"
        >
          <div className="card p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl border-white/5 bg-white/[0.03]">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-orange-500/10 text-orange-500 shadow-inner">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black uppercase tracking-tight title">Privacy Protocol</h4>
            </div>
            
            <p className="text-[11px] font-bold leading-relaxed text-[#94A3B8] uppercase tracking-wider mb-8">
              We use precision cookies to optimize your intelligence hub experience and deliver targeted global news insights.
            </p>
            
            <div className="flex gap-4">
              <button 
                onClick={() => handleChoice('accepted')}
                className="btn-primary flex-1 py-3 text-[10px] flex items-center justify-center gap-2"
              >
                <Check className="w-3 h-3" /> Accept
              </button>
              <button 
                onClick={() => handleChoice('declined')}
                className="px-6 py-3 rounded-2xl border border-white/5 hover:bg-white/5 transition-all text-[10px] font-black uppercase tracking-widest text-[#94A3B8] subtitle"
              >
                Decline
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
