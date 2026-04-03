import React from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/Layout';
import { Target, Users, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      <Navbar />
      <main className="max-w-5xl mx-auto px-8 pt-40 pb-60">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="text-left"
        >
          <div className="flex items-center gap-3 mb-10 px-6 py-2.5 rounded-full bg-primary/5 border border-primary/10 w-fit">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">System Mission Statement</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-12 font-['Outfit'] -tracking-tighter text-slate-900 dark:text-white leading-[0.9] uppercase">Architecture of <br /><span className="gradient-text">Journalism</span></h1>
          
          <p className="text-2xl text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-20 leading-relaxed max-w-3xl">
            NewsForge is a high-performance digital publication focused on the intersection of global markets, deep-tech architecture, and monetary flow.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
            <div className="p-10 rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all hover:scale-105 duration-500 group shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-8 shadow-sm transition-all group-hover:rotate-12 group-hover:bg-primary/5 group-hover:border-primary/20">
                <Target className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-4 font-['Outfit'] dark:text-white uppercase tracking-tight">Precision</h3>
              <p className="text-[13px] text-slate-500 font-bold uppercase tracking-widest leading-loose">To deliver high-scale technical insights to the architects of modern industry.</p>
            </div>
            <div className="p-10 rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all hover:scale-105 duration-500 group shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-8 shadow-sm transition-all group-hover:-rotate-12 group-hover:bg-primary/5 group-hover:border-primary/20">
                <Users className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-4 font-['Outfit'] dark:text-white uppercase tracking-tight">Intelligence</h3>
              <p className="text-[13px] text-slate-500 font-bold uppercase tracking-widest leading-loose">A specialized analyst group decoding the future of decentralized infrastructure.</p>
            </div>
            <div className="p-10 rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 transition-all hover:scale-105 duration-500 group shadow-sm">
              <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center mb-8 shadow-sm transition-all group-hover:rotate-12 group-hover:bg-primary/5 group-hover:border-primary/20">
                <Shield className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-4 font-['Outfit'] dark:text-white uppercase tracking-tight">Security</h3>
              <p className="text-[13px] text-slate-500 font-bold uppercase tracking-widest leading-loose">Integrity and zero signal-loss in every technical brief we synchronize.</p>
            </div>
          </div>

          <div className="space-y-12 max-w-3xl">
            <h2 className="text-4xl font-black font-['Outfit'] dark:text-white uppercase tracking-tighter">The NewsForge Logic</h2>
            <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 font-bold uppercase text-[12px] tracking-[0.3em] leading-[2.5]">
              <p className="mb-10">What started as a technical brief for industry founders has evolved into a global platform for market strategists. Clarify is our currency; depth is our protocol.</p>
              <p>Our commitment to precision ensures that every synchronized record on our terminal is accurate, actionable, and architected for the high-performance reader.</p>
            </div>
            <Link to="/contact" className="primary-btn mt-20 px-12 py-6 text-[10px] uppercase tracking-[0.3em] flex items-center gap-3">Connect Terminal <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
