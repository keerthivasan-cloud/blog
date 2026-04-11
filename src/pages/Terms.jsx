import React from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/Layout';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Terms = () => {
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
             <FileText className="w-4 h-4" style={{ color: 'var(--accent)' }} />
             <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>Agreement</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-12 -tracking-tighter uppercase leading-[0.95] title">Terms & <br /><span className="gradient-text">Conditions</span></h1>
          <p className="text-[11px] font-black uppercase tracking-[0.4em] mb-20 border-b pb-12 w-fit subtitle" style={{ borderColor: 'var(--border)' }}>Last Updated: April 11, 2026</p>

          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 font-bold uppercase text-[11px] tracking-[0.25em] leading-[2.5]">
             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">1. Acceptance of Terms</h2>
             <p className="mb-10">By accessing and using NewsForge, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website.</p>
             
             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">2. Use of Content</h2>
             <p className="mb-10">All content provided on NewsForge is for informational purposes only. You may not reproduce, distribute, or use our material for commercial purposes without prior written consent.</p>

             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">3. User Conduct</h2>
             <p className="mb-10">Users agree to use the website only for lawful purposes. Any attempt to disrupt the website's functionality or access unauthorized data is strictly prohibited.</p>

             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">4. Disclaimer of Liability</h2>
             <p className="mb-10">NewsForge provides information "as is" and is not liable for any inaccuracies or for any damages resulting from the use of our site.</p>

             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">5. Contact Information</h2>
             <p className="mb-10">If you have any questions about these Terms, please contact us at: <span className="text-primary font-black">support@newsforge.com</span>.</p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
