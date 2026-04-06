import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Loader2, Calendar, Clock, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.length > 2) {
        performSearch();
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/search?q=${query}`);
      setResults(res.data);
    } catch (err) {
      console.error("Search failure:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-white/95 dark:bg-slate-950/98 backdrop-blur-xl flex flex-col p-6 md:p-20 overflow-y-auto"
        >
          {/* Close Button */}
          <button 
            onClick={onClose}
            type="button"
            className="absolute top-10 right-10 p-4 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-primary transition-all border-none cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="max-w-4xl mx-auto w-full pt-20">
            {/* Search Input */}
            <div className="relative mb-20 group">
              <Search className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 text-slate-200 dark:text-slate-800 transition-colors group-focus-within:text-primary" />
              <input
                ref={inputRef}
                type="text"
                placeholder="DISCOVER INSIGHTS..."
                className="w-full bg-transparent border-none text-5xl md:text-7xl font-black font-['Outfit'] text-slate-900 dark:text-white outline-none pl-16 md:pl-24 placeholder:text-slate-100 dark:placeholder:text-slate-900 uppercase tracking-tighter"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Escape' && onClose()}
              />
              <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-900 origin-left">
                <motion.div 
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: query.length > 0 ? 1 : 0 }}
                  className="w-full h-full bg-primary"
                />
              </div>
            </div>

            {/* Results Area */}
            <div className="space-y-12">
              {loading ? (
                <div className="flex items-center justify-center py-20 gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-primary opacity-20" />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300">Synchronizing nodes...</span>
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 gap-8">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-4 border-b border-slate-100 dark:border-slate-900 pb-4">
                      Matched Articles ({results.length})
                   </h4>
                   {results.map((item) => (
                     <Link 
                       key={item._id} 
                       to={`/${item.category.toLowerCase().replace(/\s+/g, '-')}/${item.slug}`}
                       onClick={onClose}
                       className="group flex flex-col md:flex-row md:items-center justify-between gap-6 p-8 rounded-3xl hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800 no-underline text-inherit"
                     >
                       <div className="space-y-3">
                          <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">
                             <span className="text-primary">{item.category}</span>
                             <span>/</span>
                             <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                          <h3 className="text-2xl md:text-3xl font-black font-lora text-slate-900 dark:text-white group-hover:text-primary transition-colors uppercase tracking-tight">
                             {item.title}
                          </h3>
                       </div>
                       <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-300 group-hover:bg-primary group-hover:text-white transition-all transform group-hover:translate-x-2 flex items-center justify-center">
                          <ArrowRight className="w-5 h-5" />
                       </div>
                     </Link>
                   ))}
                </div>
              ) : query.length > 2 && !loading ? (
                <div className="text-center py-20">
                   <div className="text-4xl font-black text-slate-200 dark:text-slate-800 mb-4 tracking-tight uppercase">No Matches Found</div>
                   <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Redefine your search parameters to find the intersection.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 opacity-30 pointer-events-none">
                   {/* Search Hints */}
                   <div className="p-10 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-900 text-center">
                     <Clock className="w-10 h-10 mx-auto mb-6 text-slate-200" />
                     <p className="text-[10px] font-black uppercase tracking-widest leading-loose">Search by technical keyword or article headline.</p>
                   </div>
                   <div className="p-10 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-900 text-center">
                     <Calendar className="w-10 h-10 mx-auto mb-6 text-slate-200" />
                     <p className="text-[10px] font-black uppercase tracking-widest leading-loose">Filter through years of market intelligence in real-time.</p>
                   </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
