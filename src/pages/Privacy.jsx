import React from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/Layout';
import { ShieldAlert, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-8 pt-40 pb-60">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="text-left"
        >
          <Link to="/" className="flex items-center gap-2 transition-colors mb-12 group no-underline text-xs font-black uppercase tracking-widest leading-none subtitle hover:text-[var(--accent)]">
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Back to Home
          </Link>

          <div className="flex items-center gap-3 mb-10 px-6 py-2.5 rounded-full border w-fit" style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-soft)' }}>
             <ShieldAlert className="w-4 h-4" style={{ color: 'var(--accent)' }} />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>Privacy & Protection</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-12 -tracking-tighter uppercase leading-[0.95] title">Privacy <br /><span className="gradient-text">Policy</span></h1>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] mb-20 border-b pb-12 w-fit subtitle" style={{ borderColor: 'var(--border)' }}>Effective Date: April 11, 2026</p>

          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 font-bold uppercase text-[11px] tracking-[0.25em] leading-[2.5]">
             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">01. Introduction</h2>
             <p className="mb-10">At NewsForge, we respect your privacy and are committed to protecting it. This policy describes the types of information we may collect when you visit our website.</p>
             
             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">02. Information We Collect</h2>
             <p className="mb-10">We collect several types of data including information by which you may be identified, such as your name, location, and email address.</p>

             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">03. How We Use Information</h2>
             <p className="mb-10">The information we collect is used to display our website and its contents to you; to provide information, products, or services that you request; and to fulfill any other purpose for which it was shared.</p>

             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">04. Data Security</h2>
             <p className="mb-10">We have implemented measures designed to secure your personal information from unauthorized access, loss, or disclosure. However, absolute security cannot be guaranteed.</p>

             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">05. Contact Us</h2>
             <p className="mb-10">For any questions regarding this policy, please contact us at: <span className="text-primary font-black">privacy@newsforge.com</span>.</p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
