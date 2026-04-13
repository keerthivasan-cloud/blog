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
  const [recentSearches, setRecentSearches] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Load persistence logic
  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('newsforge_history') || '[]');
    setRecentSearches(history);

    // Fetch trending topics for the search start page
    axios.get(`${API_BASE_URL}/articles/trending-tags`)
      .then(res => setTrendingTags(res.data.slice(0, 5)))
      .catch(() => {});
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setActiveIndex(-1);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  const addToHistory = (q) => {
    if (!q || q.length < 2) return;
    const history = JSON.parse(localStorage.getItem('newsforge_history') || '[]');
    const newHistory = [q, ...history.filter(h => h !== q)].slice(0, 5);
    localStorage.setItem('newsforge_history', JSON.stringify(newHistory));
    setRecentSearches(newHistory);
  };

  const clearHistory = (e) => {
    e.stopPropagation();
    localStorage.removeItem('newsforge_history');
    setRecentSearches([]);
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Escape' && isOpen) onClose();
      
      if (isOpen && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIndex(prev => (prev > 0 ? prev - 1 : prev));
        }
        if (e.key === 'Enter' && activeIndex >= 0) {
          const item = results[activeIndex];
          handleSelect(item.category, item.slug);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, results, activeIndex]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (query.trim().length > 1) {
        setLoading(true);
        setActiveIndex(-1);
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
    addToHistory(query || category);
    navigate(`/${category.toLowerCase().replace(/\s+/g, '-')}/${slug}`);
    onClose();
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

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
            className="relative w-full max-w-2xl bg-white dark:bg-[#111] rounded-[2rem] shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden"
          >
            {/* SEARCH INPUT AREA */}
            <div className="p-8 border-b border-slate-100 dark:border-white/5 relative">
              <Search className="absolute left-10 top-1/2 -translate-y-1/2 w-6 h-6 text-[#E84C1E]" />
              <input 
                ref={inputRef}
                type="text" 
                placeholder="Search Intelligence Archive..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && results.length > 0 && activeIndex === -1 && handleSelect(results[0].category, results[0].slug)}
                className="w-full bg-transparent border-none outline-none pl-12 pr-12 text-xl font-bold dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-700 uppercase tracking-tight"
              />
              {query && (
                <button 
                  onClick={() => setQuery('')}
                  className="absolute right-20 top-1/2 -translate-y-1/2 p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full border-none bg-transparent cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              )}
              <div className="absolute right-10 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 opacity-60">
                 <Command className="w-3 h-3" />
                 <span className="text-[9px] font-bold">K</span>
              </div>
            </div>

            {/* RESULTS AREA */}
            <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
              {loading ? (
                 <div className="py-20 text-center"><Sparkles className="w-8 h-8 animate-spin text-[#E84C1E] mx-auto" /></div>
              ) : results.length > 0 ? (
                <div className="space-y-1">
                   {results.map((item, idx) => (
                      <button 
                        key={item.id} 
                        onClick={() => handleSelect(item.category, item.slug)}
                        onMouseEnter={() => setActiveIndex(idx)}
                        className={`w-full text-left p-4 sm:p-5 rounded-2xl transition-all flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 group cursor-pointer border-none ${activeIndex === idx ? 'bg-slate-50 dark:bg-white/5' : 'bg-transparent'}`}
                      >
                         <div className="flex items-center gap-4 sm:gap-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${activeIndex === idx ? 'bg-[#E84C1E] text-white' : 'bg-slate-50 dark:bg-white/5 text-[#E84C1E]'}`}>
                               <Zap className="w-5 h-5 fill-current" />
                            </div>
                            <div>
                               <div className="flex items-center gap-3">
                                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#E84C1E]">{item.category}</p>
                                  <span className="text-[10px] text-slate-400 uppercase font-medium">{formatDate(item.createdAt)}</span>
                               </div>
                               <h4 className="text-sm font-bold dark:text-white line-clamp-1">{item.title}</h4>
                            </div>
                         </div>
                         <div className="flex items-center gap-3 ml-auto sm:ml-0">
                            <span className="text-[10px] font-medium text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">{item.readTime} MIN</span>
                            <ArrowRight className={`w-4 h-4 transition-all ${activeIndex === idx ? 'opacity-100 translate-x-1 text-[#E84C1E]' : 'opacity-0 text-slate-400'}`} />
                         </div>
                      </button>
                   ))}
                </div>
              ) : query.length > 1 ? (
                <div className="py-20 text-center text-slate-400">
                   <p className="text-[10px] font-bold uppercase tracking-[0.4em]">No Knowledge Nodes Found</p>
                </div>
              ) : (
                <div className="p-6 space-y-10">
                  {recentSearches.length > 0 && (
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">System History</p>
                          <button onClick={clearHistory} className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-[#E84C1E] underline cursor-pointer border-none bg-transparent">Clear Purge</button>
                       </div>
                       <div className="flex flex-wrap gap-2">
                          {recentSearches.map((tag) => (
                             <button key={tag} onClick={() => setQuery(tag)} className="px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest hover:bg-[#E84C1E] hover:text-white transition-all border-none cursor-pointer">{tag}</button>
                          ))}
                       </div>
                    </div>
                  )}

                  {trendingTags.length > 0 && (
                    <div className="space-y-4">
                       <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-500">Trending Intelligence</p>
                       <div className="flex flex-wrap gap-2">
                          {trendingTags.map((tag) => (
                             <button key={tag.name} onClick={() => setQuery(tag.name)} className="flex items-center gap-2 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl bg-slate-50 dark:bg-white/5 text-[10px] font-bold uppercase tracking-widest hover:border-[#E84C1E]/30 transition-all border border-transparent cursor-pointer">
                                <span className="text-[#E84C1E] text-xs">#</span> {tag.name}
                             </button>
                          ))}
                       </div>
                    </div>
                  )}

                  <div className="p-6 rounded-3xl bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 flex items-center gap-6">
                     <Clock className="w-5 h-5 text-[#E84C1E]" />
                     <p className="text-[10px] font-medium uppercase tracking-widest text-slate-500 leading-relaxed">System history is decentralized. Your local search cache is prioritized.</p>
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
