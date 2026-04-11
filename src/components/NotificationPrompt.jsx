import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const NotificationPrompt = forwardRef((props, ref) => {
  const [show, setShow] = useState(false);

  useImperativeHandle(ref, () => ({
    trigger() {
      if (!localStorage.getItem('notification_prompt_shown') && Notification.permission !== 'granted') {
        setShow(true);
      }
    }
  }));

  useEffect(() => {
    const hasShown = localStorage.getItem('notification_prompt_shown');
    const isGranted = Notification.permission === 'granted';

    if (!hasShown && !isGranted) {
      const timer = setTimeout(() => {
        setShow(true);
      }, 15000); // 15 seconds delay
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAllow = async () => {
    localStorage.setItem('notification_prompt_shown', 'true');
    setShow(false);
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      toast.success("Intelligence Feed Activated", {
        style: {
          background: 'var(--bg-card)',
          color: 'var(--text-primary)',
          border: '1px solid var(--border)',
          textTransform: 'uppercase',
          fontWeight: '900',
          fontSize: '10px',
          letterSpacing: '2px'
        },
        icon: <CheckCircle className="w-4 h-4 text-green-500" />
      });
    }
  };

  const handleDecline = () => {
    localStorage.setItem('notification_prompt_shown', 'true');
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9, x: 50 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          exit={{ opacity: 0, scale: 0.9, x: 50 }}
          className="fixed bottom-8 right-8 z-[101] max-w-[320px]"
        >
          <div className="card p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-3xl border-orange-500/20 bg-white/[0.03]">
             <button onClick={handleDecline} className="absolute top-6 right-6 text-[#64748B] hover:text-white transition-colors">
                <X className="w-4 h-4" />
             </button>
             
             <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-orange-500 text-white shadow-lg shadow-orange-500/20 mb-6">
                <Bell className="w-7 h-7" />
             </div>
             
             <h4 className="text-xl font-black uppercase tracking-tight title mb-4">Live Updates</h4>
             <p className="text-[11px] font-bold leading-relaxed text-[#94A3B8] uppercase tracking-wider mb-8">
                Receive instant intelligence alerts when new technical modules are published to the feed.
             </p>
             
             <button 
               onClick={handleAllow}
               className="btn-primary w-full py-4 text-[11px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3"
             >
               Enable Protocol
             </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

export default NotificationPrompt;
