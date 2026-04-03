import React from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/Layout';
import { ShieldAlert, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const Privacy = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      <Navbar />
      <main className="max-w-4xl mx-auto px-8 pt-40 pb-60">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="text-left"
        >
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-12 group no-underline text-xs font-black uppercase tracking-widest leading-none">
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> System Index
          </Link>

          <div className="flex items-center gap-3 mb-10 px-6 py-2.5 rounded-full bg-primary/5 border border-primary/10 w-fit">
             <ShieldAlert className="w-4 h-4 text-primary" />
             <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Protocol & Privacy</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black mb-12 font-['Outfit'] -tracking-tighter text-slate-900 dark:text-white uppercase leading-[0.95]">Privacy <br /><span className="gradient-text">Protocol</span></h1>
          <p className="text-[11px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.4em] mb-20 border-b border-slate-100 dark:border-slate-800 pb-12 w-fit">Effective Sequence: April 03, 2026</p>

          <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 font-bold uppercase text-[11px] tracking-[0.25em] leading-[2.5]">
             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">01. Initialization</h2>
             <p className="mb-10">At NewsForge, we respect your structural privacy and are committed to protecting it through our compliance with this protocol. This documentation describes the types of data points we may synchronize when you visit our terminal.</p>
             
             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">02. Data Acquisition</h2>
             <p className="mb-10">We collect several types of operational data including information by which you may be uniquely identified, such as name, geospatial origin, and nexus address.</p>

             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">03. Logic Execution</h2>
             <p className="mb-10">Synchronized data is utilized to present our terminal and its technical contents to you; to provide authorized briefs, products, or services that you request from us; and to fulfill any other purpose for which it was shared.</p>

             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">04. Encryption Priority</h2>
             <p className="mb-10">We have implemented structural measures designed to secure your identity signatures from unauthorized access, disruption, or disclosure. However, absolute security depends on your terminal environment.</p>

             <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mt-16 mb-8">05. Support Sync</h2>
             <p className="mb-10">For technical inquiries regarding this protocol, connect with us at: <span className="text-primary font-black">privacy@newsforge.nexus</span>.</p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
