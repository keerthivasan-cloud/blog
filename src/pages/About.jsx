import React from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/Layout';
import { Target, Users, Shield, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="max-w-5xl mx-auto px-5 md:px-8 pt-40 pb-60">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
           className="text-left"
        >
          <div className="flex flex-col mb-16">
            <span className="section-label mb-4 flex items-center gap-2"><Target className="w-3.5 h-3.5" /> Our Mission</span>
            <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Expert Journalism</h1>
            <p className="text-xl md:text-2xl mb-16 max-w-3xl leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              NewsForge is a high-performance digital publication focused on the intersection of global markets, deep-tech architecture, and monetary flow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-24">
            <div className="p-5 md:p-8 card flex flex-col items-start transition-all hover:scale-[1.02] duration-300">
              <div className="w-12 h-12 rounded-lg border flex items-center justify-center mb-6" style={{ background: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                <Target className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-xl font-bold mb-3">Precision</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>To deliver high-scale technical insights to the architects of modern industry.</p>
            </div>
            <div className="p-5 md:p-8 card flex flex-col items-start transition-all hover:scale-[1.02] duration-300">
              <div className="w-12 h-12 rounded-lg border flex items-center justify-center mb-6" style={{ background: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                <Users className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-xl font-bold mb-3">Insights</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>A specialized team of analysts decoding the future of global markets.</p>
            </div>
            <div className="p-5 md:p-8 card flex flex-col items-start transition-all hover:scale-[1.02] duration-300">
              <div className="w-12 h-12 rounded-lg border flex items-center justify-center mb-6" style={{ background: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                <Shield className="w-5 h-5" style={{ color: 'var(--accent)' }} />
              </div>
              <h3 className="text-xl font-bold mb-3">Integrity</h3>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Unbiased and accurate reporting in every technical brief we publish.</p>
            </div>
          </div>

          <div className="space-y-8 max-w-3xl prose-system">
             <h2>Our Philosophy</h2>
             <p>What started as a technical report for industry founders has evolved into a global platform for market strategists. Clarity is our priority; depth is our standard.</p>
             <p>Our commitment to precision ensures that every report we publish is accurate, actionable, and written for the modern professional reader.</p>
             <Link to="/contact" className="btn-primary mt-12 inline-flex">Get in Touch <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default About;
