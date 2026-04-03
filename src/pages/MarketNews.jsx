import React from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/Layout';

const MarketNews = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto px-8 pt-32 pb-40">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          <span className="text-[#a855f7] font-semibold text-sm tracking-wider uppercase">Market Analysis</span>
          <h1 className="text-5xl md:text-6xl font-bold mt-4 mb-8">Stock Market 2026: The Rise of AI-First Enterprises</h1>
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 rounded-full bg-secondary border border-border" />
            <div>
               <div className="font-semibold text-lg">Alex Rivera</div>
               <div className="text-muted-foreground text-sm">March 22, 2026 • 12 min read</div>
            </div>
          </div>
          <img
            src="https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=2070&auto=format&fit=crop"
            alt="Market Chart"
            className="w-full rounded-3xl mb-12"
          />
          <div className="prose prose-invert max-w-none text-muted-foreground leading-relaxed text-lg">
             <p className="mb-6">The global stock market has seen a paradigm shift as companies that prioritize AI integration outperform traditional blue-chip stocks. We analyze the current market trends and what investors can expect for the second half of 2026.</p>
             <h2 className="text-3xl font-bold text-foreground mt-12 mb-6">Unprecedented Volatility</h2>
             <p className="mb-6">While volatility remains high, the floor for tech stocks has stabilized significantly. The "Big Seven" tech companies are now being challenged by a new wave of "Agile AI" startups that are leaner and focus on specific vertical markets.</p>
             <blockquote className="border-l-4 border-[#a855f7] pl-6 my-8 italic text-foreground text-2xl">
                "Infrastructure is the new real estate. Those who own the compute, own the future."
             </blockquote>
             <p className="mb-6">Institutional investors are increasingly moving capital into green energy projects that power massive data centers, signaling a long-term commitment to the AI revolution.</p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default MarketNews;
