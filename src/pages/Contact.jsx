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
      <main className="max-w-7xl mx-auto px-8 pt-40 pb-60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
          
          <motion.div
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
             className="lg:col-span-5"
          >
            <div className="flex items-center gap-3 mb-10 px-6 py-2.5 rounded-full border w-fit" style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-soft)' }}>
               <Zap className="w-4 h-4 fill-current" style={{ color: 'var(--accent)' }} />
               <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>Our Desk</span>
            </div>
            
            <h1 className="text-6xl md:text-8xl font-black mb-10 -tracking-tight leading-[0.95] uppercase title">Contact <br /><span className="gradient-text">Us</span></h1>
            <p className="text-xl font-bold uppercase tracking-widest mb-20 leading-relaxed subtitle">Get in touch with our team for news tips, general inquiries, or partnerships.</p>

            <div className="space-y-10">
               <div className="flex items-center gap-8 group">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center transition-all group-hover:bg-primary/10 group-hover:border-primary/20">
                     <Mail className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Email</div>
                     <div className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">contact@newsforge.com</div>
                  </div>
               </div>
               <div className="flex items-center gap-8 group">
                  <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center transition-all group-hover:bg-primary/10 group-hover:border-primary/20">
                     <MapPin className="w-6 h-6 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                  <div>
                     <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-1">Location</div>
                     <div className="text-xl font-black text-slate-900 dark:text-white font-['Outfit']">London, UK</div>
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
            <div className="glass p-12 md:p-20 rounded-[4rem] border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xl shadow-slate-200/20 dark:shadow-none">
               <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Your Name</label>
                        <input type="text" placeholder="NAME" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" required />
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">Email address</label>
                        <input type="email" placeholder="EMAIL" className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl p-6 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" required />
                     </div>
                  </div>
                  <div className="space-y-3">
                     <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">How can we help?</label>
                     <textarea rows="6" placeholder="WRITE YOUR MESSAGE..." className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-[3rem] p-8 text-xs font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600" required />
                  </div>
                  <button type="submit" disabled={submitted} className="primary-btn w-full py-7 text-[12px] uppercase tracking-[0.4em] font-black flex items-center justify-center gap-4 active:scale-95">
                    {submitted ? 'Message Sent' : 'SEND MESSAGE'} <Send className="w-5 h-5 group-hover:translate-x-1" />
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
