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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500">
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-24">
        <header className="text-center mb-20">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.4em] mb-6">
            <Zap className="w-3.5 h-3.5 fill-primary" /> Intelligence Stream v4.0
          </div>
          <h1 className="text-5xl md:text-7xl font-black font-['Outfit'] text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-6">
            Quick Reads
          </h1>
          <p className="text-slate-400 font-bold uppercase text-[11px] tracking-[0.3em]">
            Consume 10 articles' value in under 2 minutes.
          </p>
        </header>

        <div className="space-y-12">
          {articles.map((article, idx) => (
            <motion.div 
              key={article._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 md:p-14 border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none group relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-2 h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between mb-8">
                 <div className="flex items-center gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">{article.category}</span>
                    <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700">{new Date(article.createdAt).toLocaleDateString()}</span>
                 </div>
                 <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 group-hover:text-primary transition-colors">0{idx + 1} / {articles.length}</div>
              </div>

              <h2 className="text-3xl md:text-4xl font-black font-['Outfit'] text-slate-900 dark:text-white uppercase leading-tight mb-8 group-hover:translate-x-2 transition-transform">
                {article.title}
              </h2>

              <div className="space-y-4 mb-10">
                {article.bullets?.length > 0 ? (
                  article.bullets.slice(0, 3).map((bullet, bIdx) => (
                    <div key={bIdx} className="flex gap-4 items-start">
                       <Zap className="w-4 h-4 text-primary shrink-0 mt-1" />
                       <p className="text-base font-bold font-lora text-slate-600 dark:text-slate-400 leading-relaxed italic uppercase tracking-tight">{bullet}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400 uppercase italic">Summary node not initialized.</p>
                )}
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-slate-50 dark:border-slate-800">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <Clock className="w-4 h-4" /> {article.readTime || 5} MINS CAPACITY
                 </div>
                 <Link 
                   to={`/${article.category.toLowerCase().replace(/\s+/g, '-')}/${article.slug}`}
                   className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-primary hover:gap-5 transition-all no-underline"
                 >
                   Deep Analysis <ArrowRight className="w-4 h-4" />
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
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
    <Navbar />
    <div className="max-w-4xl mx-auto px-6 py-24 space-y-12">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-96 w-full bg-white dark:bg-slate-900 rounded-[3rem] animate-pulse" />
      ))}
    </div>
  </div>
);

export default QuickReads;
