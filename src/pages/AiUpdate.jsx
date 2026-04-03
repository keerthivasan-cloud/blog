import React from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/Layout';

const AiUpdate = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-8 pt-32 pb-40">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          <span className="text-[#a855f7] font-semibold text-sm tracking-wider uppercase">AI Evolution</span>
          <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-8">Google Gemini 2.0: The Future of Intelligence</h1>
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-full bg-secondary border border-border" />
            <div>
               <div className="font-semibold text-lg">Emma Watson</div>
               <div className="text-muted-foreground text-sm">March 25, 2026 • 15 min read</div>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop"
            alt="AI Concept"
            className="w-full rounded-3xl mb-12"
          />
          <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg">
             <p className="mb-6">Artificial Intelligence is no longer just a buzzword. It's a transformative force reshaping how we live, work, and create. In this deep dive, we explore the latest updates from Google's Gemini 2.0 and what they mean for developers worldwide.</p>
             <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Unprecedented Scale</h2>
             <p className="mb-6">With the release of Gemini 2.0, Google has achieved a new benchmark in multimodal reasoning. The ability to process vast amounts of context across text, code, audio, and video simultaneously opens doors that were previously locked.</p>
             <blockquote className="border-l-4 border-[#a855f7] pl-6 my-8 italic text-foreground text-2xl">
                "The era of isolated AI modules is over. We are now entering an age of truly unified intelligence."
             </blockquote>
             <p className="mb-6">Developers are already seeing a 40% increase in productivity when leveraging the new IDE integrations, which provide context-aware suggestions that understand the entire project structure, not just the open file.</p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default AiUpdate;
