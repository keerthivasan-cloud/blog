import React from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/Layout';
import { Target, Users, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-8 pt-40 pb-60">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="text-left"
        >
          <div className="flex items-center gap-3 mb-10 px-6 py-2.5 rounded-full border w-fit" style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-soft)' }}>
            <Target className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--accent)' }}>System Mission Statement</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-12 -tracking-tighter leading-[0.9] uppercase title">Architecture of <br /><span className="gradient-text">Journalism</span></h1>
          
          <p className="text-2xl font-bold uppercase tracking-wider mb-20 leading-relaxed max-w-3xl subtitle">
            NewsForge is a high-performance digital publication focused on the intersection of global markets, deep-tech architecture, and monetary flow.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-32">
            <div className="p-10 card transition-all hover:scale-105 duration-500 group">
              <div className="w-16 h-16 rounded-3xl border flex items-center justify-center mb-8 shadow-sm transition-all group-hover:rotate-12 group-hover:bg-[var(--accent-soft)]" style={{ background: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                <Target className="w-7 h-7" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight title">Precision</h3>
              <p className="text-[13px] font-bold uppercase tracking-widest leading-loose subtitle">To deliver high-scale technical insights to the architects of modern industry.</p>
            </div>
            <div className="p-10 card transition-all hover:scale-105 duration-500 group">
              <div className="w-16 h-16 rounded-3xl border flex items-center justify-center mb-8 shadow-sm transition-all group-hover:-rotate-12 group-hover:bg-[var(--accent-soft)]" style={{ background: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                <Users className="w-7 h-7" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight title">Intelligence</h3>
              <p className="text-[13px] font-bold uppercase tracking-widest leading-loose subtitle">A specialized analyst group decoding the future of decentralized infrastructure.</p>
            </div>
            <div className="p-10 card transition-all hover:scale-105 duration-500 group">
              <div className="w-16 h-16 rounded-3xl border flex items-center justify-center mb-8 shadow-sm transition-all group-hover:rotate-12 group-hover:bg-[var(--accent-soft)]" style={{ background: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                <Shield className="w-7 h-7" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-2xl font-black mb-4 uppercase tracking-tight title">Security</h3>
              <p className="text-[13px] font-bold uppercase tracking-widest leading-loose subtitle">Integrity and zero signal-loss in every technical brief we synchronize.</p>
            </div>
          </div>

          <div className="space-y-12 max-w-3xl">
            <h2 className="text-4xl font-black uppercase tracking-tighter title">The NewsForge Logic</h2>
            <div className="max-w-none font-bold uppercase text-[12px] tracking-[0.3em] leading-[2.5] subtitle">
              <p className="mb-10">What started as a technical brief for industry founders has evolved into a global platform for market strategists. Clarify is our currency; depth is our protocol.</p>
              <p>Our commitment to precision ensures that every synchronized record on our terminal is accurate, actionable, and architected for the high-performance reader.</p>
            </div>
            <Link to="/contact" className="btn-primary mt-20 px-12 py-6 text-[10px] uppercase tracking-[0.3em] flex items-center gap-3 no-underline shadow-2xl">Connect Terminal <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
