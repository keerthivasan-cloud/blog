import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Command, ArrowRight, Zap, Sparkles, Clock } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const SearchOverlay = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : document.dispatchEvent(new CustomEvent('toggleSearch'));
      }
      if (e.key === 'Escape' && isOpen) onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        try {
          const res = await axios.get(`${API_BASE_URL}/search?q=${query}`);
          setResults(res.data);
        } catch (err) {
          console.error("Search failure", err);
        } finally {
          setLoading(false);
        }
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (category, slug) => {
    navigate(`/${category.toLowerCase().replace(/\s+/g, '-')}/${slug}`);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-start justify-center pt-24 md:pt-40 px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* SEARCH INPUT AREA */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 relative">
              <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-6 h-6 text-primary" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Search Intelligence Archive..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent border-none outline-none pl-12 pr-12 text-xl font-black font-['Outfit'] dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 uppercase tracking-tight"
              />
              <div className="absolute right-10 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 opacity-60">
                 <Command className="w-3 h-3" />
                 <span className="text-[9px] font-black">K</span>
              </div>
            </div>

            {/* RESULTS AREA */}
            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
              {loading ? (
                 <div className="py-20 text-center"><Sparkles className="w-8 h-8 animate-spin text-primary mx-auto" /></div>
              ) : results.length > 0 ? (
                <div className="space-y-2">
                   <p className="px-6 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Knowledge Nodes Detected</p>
                   {results.map((item) => (
                      <button 
                        key={item.id} 
                        onClick={() => handleSelect(item.category, item.slug)}
                        className="w-full text-left p-6 rounded-[1.5rem] hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-between group cursor-pointer border-none bg-transparent"
                      >
                         <div className="flex items-center gap-5">
                            <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                               <Zap className="w-5 h-5 fill-current" />
                            </div>
                            <div>
                               <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">{item.category}</p>
                               <h4 className="text-sm font-black dark:text-white uppercase tracking-tight line-clamp-1">{item.title}</h4>
                            </div>
                         </div>
                         <ArrowRight className="w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-slate-400" />
                      </button>
                   ))}
                </div>
              ) : query.length > 1 ? (
                <div className="py-20 text-center text-slate-400">
                   <p className="text-[10px] font-black uppercase tracking-[0.4em]">No Knowledge Nodes Found</p>
                </div>
              ) : (
                <div className="p-8 space-y-8">
                  <div className="space-y-4">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Recent Searches</p>
                     <div className="flex flex-wrap gap-3">
                        {['Geopolitics', 'AI Ethics', 'Market Shift'].map((tag) => (
                           <button key={tag} onClick={() => setQuery(tag)} className="px-5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all border-none cursor-pointer">{tag}</button>
                        ))}
                     </div>
                  </div>
                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 flex items-center gap-6">
                     <Clock className="w-6 h-6 text-primary" />
                     <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 leading-relaxed">System history is decentralized. Your local search cache is prioritized.</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SearchOverlay;
