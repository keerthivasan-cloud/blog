import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components/Layout';
import { Zap, Clock, ArrowRight, BookOpen, ChevronDown } from 'lucide-react';
import API_BASE_URL from '../config';

const QuickReads = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/articles`);
        // Sort by newest first
        setArticles(res.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        console.error("Quick Reads fetch failure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) return <QuickReadsSkeleton />;

  return (
    <div className="min-h-screen transition-colors duration-500 selection:bg-orange-500/30 relative overflow-hidden" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <div className="mesh-gradient opacity-10" />
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-12">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border text-[8px] font-bold uppercase tracking-[0.3em] mb-4" style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-soft)' }}>
            <Zap className="w-3 h-3 fill-current" style={{ color: 'var(--accent)' }} /> Intelligence Stream v4.0
          </div>
          <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none mb-3 title">
            Quick Reads
          </h1>
          <p className="font-bold uppercase text-[9px] tracking-[0.2em] subtitle">
            High-velocity intelligence for the modern architect.
          </p>
        </header>

        <div className="space-y-12">
          {articles.map((article, idx) => (
            <motion.div 
              key={article._id}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="card rounded-2xl p-8 md:p-10 group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-1 h-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'var(--accent)' }} />
              
              <div className="flex items-center justify-between mb-6">
                 <div className="flex p-1 rounded-md border shadow-sm" style={{ background: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                    <span className="px-3 py-1 rounded-sm text-[8px] font-bold uppercase tracking-widest shadow-sm" style={{ background: 'var(--bg-main)', color: 'var(--accent)' }}>{article.category}</span>
                    <span className="px-3 py-1 text-[8px] font-bold uppercase tracking-widest subtitle">{new Date(article.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                 </div>
                 <div className="text-[9px] font-bold uppercase tracking-[0.3em] opacity-30 tabular-nums">DATA_NODE_0{idx + 1}</div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-foreground uppercase leading-tight mb-6 group-hover:translate-x-1 transition-transform h-gradient">
                {article.title}
              </h2>

              <div className="space-y-4 mb-10">
                {article.bullets?.length > 0 ? (
                  article.bullets.slice(0, 3).map((bullet, bIdx) => (
                    <div key={bIdx} className="flex gap-3 items-start">
                       <Zap className="w-3 h-3 text-primary shrink-0 mt-1" />
                       <p className="text-sm font-bold font-lora text-muted-foreground leading-snug italic uppercase tracking-tight">{bullet}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 uppercase italic">Summary node not initialized.</p>
                )}
              </div>

               <div className="flex items-center justify-between pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-widest mono subtitle">
                     <Clock className="w-3 h-3" /> DATA_CAP_0{article.readTime || 5}M
                  </div>
                  <Link 
                    to={`/${article.category.toLowerCase().replace(/\s+/g, '-')}/${article.slug}`}
                    className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.2em] hover:gap-4 transition-all no-underline group/link"
                    style={{ color: 'var(--accent)' }}
                  >
                    Integrate <div className="w-7 h-7 rounded-lg flex items-center justify-center group-hover/link:bg-[var(--accent)] group-hover/link:text-white transition-all shadow-lg" style={{ background: 'var(--accent-soft)' }}><ArrowRight className="w-3 h-3" /></div>
                  </Link>
               </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 text-center">
           <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-300 animate-bounce">End of Intelligence stream</p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const QuickReadsSkeleton = () => (
  <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
    <Navbar />
    <div className="max-w-4xl mx-auto px-6 py-24 space-y-12">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-96 w-full card rounded-[3rem] animate-pulse" />
      ))}
    </div>
  </div>
);

export default QuickReads;
