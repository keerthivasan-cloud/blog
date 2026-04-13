import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/Layout';
import { Mail, Phone, MapPin, Send, Zap } from 'lucide-react';

const Contact = () => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-5 md:px-8 pt-40 pb-60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20">
          
          <motion.div
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
             className="lg:col-span-5"
          >
            <div className="flex flex-col mb-12">
               <span className="section-label mb-4 flex items-center gap-2"><Zap className="w-3.5 h-3.5 fill-current" /> Our Desk</span>
               <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Contact Us</h1>
               <p className="text-xl leading-relaxed text-slate-500 dark:text-slate-400">Get in touch with our team for news tips, general inquiries, or partnerships.</p>
            </div>

            <div className="space-y-8 mt-12">
               <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                     <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                     <div className="section-label text-[10px] text-slate-400 mb-1">Email</div>
                     <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>contact@newsforge.in</div>
                  </div>
               </div>
               <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                     <MapPin className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                     <div className="section-label text-[10px] text-slate-400 mb-1">Location</div>
                     <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>London, UK</div>
                  </div>
               </div>
            </div>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
             className="lg:col-span-7"
          >
            <div className="p-5 md:p-12 rounded-3xl border shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Your Name</label>
                        <input type="text" placeholder="John Doe" className="input" required />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Email address</label>
                        <input type="email" placeholder="john@example.com" className="input" required />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>How can we help?</label>
                     <textarea rows="5" placeholder="Write your message..." className="input resize-none py-3" required />
                  </div>
                  <button type="submit" disabled={submitted} className="btn-primary w-full justify-center py-3.5 mt-4 disabled:opacity-75">
                    {submitted ? 'Message Sent' : 'Send Message'} <Send className="w-4 h-4 ml-1" />
                  </button>
               </form>
            </div>
          </motion.div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
