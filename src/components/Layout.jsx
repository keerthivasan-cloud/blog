import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import { 
  BookOpen, PenTool, TrendingUp, Search, Github, Twitter, 
  Linkedin, ArrowRight, Clock, Star, Zap, ChevronRight,
  Sun, Moon
} from 'lucide-react';

import SearchOverlay from './SearchOverlay';
 
const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useContent();

  return (
    <button
      onClick={toggleTheme}
      className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border-none cursor-pointer relative overflow-hidden group transition-all duration-500 hover:scale-110 active:scale-95"
    >
      <AnimatePresence mode="wait" initial={false}>
        {darkMode ? (
          <motion.div
            key="moon"
            initial={{ y: 20, rotate: 45, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, rotate: -45, opacity: 0 }}
            transition={{ duration: 0.3, ease: "backOut" }}
          >
            <Moon className="w-5 h-5 text-indigo-400 fill-indigo-400/20" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 20, rotate: 45, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, rotate: -45, opacity: 0 }}
            transition={{ duration: 0.3, ease: "backOut" }}
          >
            <Sun className="w-5 h-5 text-orange-500 fill-orange-500/20" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

const LiveMarketStrip = () => (
  <div className="bg-slate-950 text-white py-2 px-12 overflow-hidden border-b border-white/5 relative flex items-center shrink-0">
    <div className="flex items-center gap-10 animate-marquee whitespace-nowrap text-[9px] font-black uppercase tracking-[0.3em] font-['Outfit']">
      <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> NIFTY 50 • 22,462.00 <span className="text-green-500">+0.85%</span></span>
      <span className="flex items-center gap-2 text-slate-500">/</span>
      <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]" /> BTC/USD • $69,420.20 <span className="text-red-500">-1.20%</span></span>
      <span className="flex items-center gap-2 text-slate-500">/</span>
      <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" /> USD/INR • ₹83.12 <span className="text-green-500">+0.05%</span></span>
      <span className="flex items-center gap-2 text-slate-500">/</span>
      <span className="flex items-center gap-2"><div className="w-1 h-1 rounded-full bg-slate-500" /> NASDAQ • 16,274.96 <span className="text-slate-400">OPEN</span></span>
    </div>
    <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-950 to-transparent z-10" />
    <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-950 to-transparent z-10" />
  </div>
);

export const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  return (
    <>
      <LiveMarketStrip />
      <nav className="glass sticky top-0 z-50 w-full px-4 md:px-12 py-3 flex items-center justify-between border-b border-border/40">
    <Link to="/" className="flex items-center gap-3 no-underline text-inherit group">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110 bg-orange-500/10 border-orange-500/20">
        <PenTool style={{ width: '1.25rem', height: '1.25rem', color: '#f97316' }} />
      </div>
      <span className="text-xl font-black font-['Outfit'] tracking-tight text-slate-900 dark:text-white transition-colors duration-500">NewsForge</span>
    </Link>
    <div className="hidden lg:flex items-center gap-10 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 transition-colors duration-500">
      <Link to="/tech" className="hover:text-primary transition-colors no-underline text-inherit">Tech</Link>
      <Link to="/business" className="hover:text-primary transition-colors no-underline text-inherit">Business</Link>
      <Link to="/finance" className="hover:text-primary transition-colors no-underline text-inherit">Finance</Link>
      <Link to="/global-market" className="hover:text-primary transition-colors no-underline text-inherit">Markets</Link>
      <Link to="/commodities" className="hover:text-primary transition-colors no-underline text-inherit">Commodities</Link>
    </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors border-none bg-transparent cursor-pointer text-slate-600 dark:text-slate-400"
        >
          <Search style={{ width: '1.2rem', height: '1.2rem' }} />
        </button>
        <Link to="/admin" className="primary-btn no-underline text-[11px] py-3 px-6">Write</Link>
      </div>
    </nav>
    <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export const Footer = () => (
  <footer className="mt-40 py-24 px-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/50">
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
      <div className="md:col-span-1">
        <div className="flex items-center gap-2 mb-6">
          <PenTool style={{ width: '1.5rem', height: '1.5rem', color: '#f97316' }} />
          <span className="text-2xl font-black font-['Outfit']">NewsForge</span>
        </div>
        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">
          Precision journalism for the modern architect of industry. Defining the intersection of global markets and emerging technology.
        </p>
        <div className="flex gap-5">
          <Twitter className="w-5 h-5 text-slate-300 hover:text-primary cursor-pointer transition-colors" />
          <Github className="w-5 h-5 text-slate-300 hover:text-primary cursor-pointer transition-colors" />
          <Linkedin className="w-5 h-5 text-slate-300 hover:text-primary cursor-pointer transition-colors" />
        </div>
      </div>
      
      <div>
        <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-slate-400 font-['Outfit']">Navigation</h4>
        <ul className="list-none p-0 space-y-4 text-sm font-semibold">
          <li><Link to="/" className="text-slate-600 hover:text-primary no-underline transition-colors">Global Home</Link></li>
          <li><Link to="/tech" className="text-slate-600 hover:text-primary no-underline transition-colors">Technical Index</Link></li>
          <li><Link to="/business" className="text-slate-600 hover:text-primary no-underline transition-colors">Business Intelligence</Link></li>
          <li><Link to="/finance" className="text-slate-600 hover:text-primary no-underline transition-colors">Financial Hub</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8 text-slate-400 font-['Outfit']">Resources</h4>
        <ul className="list-none p-0 space-y-4 text-sm font-semibold">
          <li><Link to="/about" className="text-slate-600 hover:text-primary no-underline transition-colors">Management</Link></li>
          <li><Link to="/contact" className="text-slate-600 hover:text-primary no-underline transition-colors">Terminal Support</Link></li>
          <li><Link to="/privacy" className="text-slate-600 hover:text-primary no-underline transition-colors">Privacy Protocol</Link></li>
          <li><Link to="/admin/login" className="text-slate-600 hover:text-primary no-underline transition-colors">Admin Access</Link></li>
        </ul>
      </div>

      <div className="glass p-8 rounded-3xl border-slate-200/50">
        <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-4 text-slate-400 font-['Outfit']">Newsletter</h4>
        <p className="text-[11px] text-slate-500 mb-6 font-bold leading-relaxed uppercase tracking-wider">Join 42,000+ deep-tech readers.</p>
        <div className="space-y-2">
          <input type="email" placeholder="email@nexus.com" className="w-full p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-[11px] font-bold outline-none focus:ring-2 focus:ring-primary/10 transition-all font-['Inter']" />
          <button className="primary-btn w-full text-[10px] uppercase tracking-[0.2em] py-4">Synchronize</button>
        </div>
      </div>
    </div>
    <div className="text-center mt-24 text-[10px] text-slate-300 font-black uppercase tracking-[0.4em]">
      © 2026 NewsForge System Terminal. All Rights Reserved.
    </div>
  </footer>
);

export const BlogCard = ({ title, category, author, date, readTime, image, link, variant = "standard" }) => {
  const displayAuthor = author || "vynexsol Intelligence";
  const authorInitial = displayAuthor[0] === 'v' ? 'V' : displayAuthor[0].toUpperCase();

  if (variant === "featured") {
    return (
      <motion.div whileHover={{ y: -5 }} className="relative group rounded-[2.5rem] overflow-hidden aspect-[16/9] shadow-2xl shadow-orange-500/10 border border-slate-100 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent z-10" />
        <img src={image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" alt="" />
        <div className="absolute bottom-0 left-0 p-10 z-20 w-full text-left">
          <div className="flex items-center gap-3 mb-4">
             <span className="px-4 py-1.5 rounded-full bg-primary text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-lg">{category} Index</span>
             <span className="text-white/60 text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2"><Clock className="w-3.5 h-3.5" /> {readTime} min sync</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white leading-[0.95] font-lora -tracking-tighter transition-all group-hover:text-primary uppercase drop-shadow-lg">
            <Link to={link} className="text-inherit no-underline">{title}</Link>
          </h2>
        </div>
      </motion.div>
    );
  }

  if (variant === "list") {
    return (
      <div className="flex items-start gap-4 p-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all rounded-3xl group cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-slate-800 text-left">
        <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 shadow-sm border border-slate-100 dark:border-slate-800 bg-slate-50">
          <img src={image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="" />
        </div>
        <div className="py-0.5">
           <div className="text-[8px] font-black uppercase tracking-[0.4em] text-primary mb-1.5">{category} Node</div>
           <h4 className="text-sm font-black text-slate-800 dark:text-white leading-[1.3] group-hover:text-primary transition-colors font-lora">
             <Link to={link} className="text-inherit no-underline">{title}</Link>
           </h4>
        </div>
      </div>
    );
  }

  return (
    <motion.div whileHover={{ y: -8 }} className="glass rounded-[2rem] overflow-hidden group border-border/40 shadow-sm border-slate-100 dark:border-slate-800 hover:shadow-xl hover:shadow-orange-500/5 transition-all h-full bg-white dark:bg-slate-900 text-left flex flex-col">
      <div className="aspect-video w-full overflow-hidden relative border-b border-slate-100 dark:border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent z-10" />
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="absolute top-4 left-4 z-20 px-4 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-white/10 dark:border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-[#f97316] shadow-sm">
          {category}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-[8px] font-black uppercase tracking-[0.4em] text-slate-400 mb-4">
          <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary" /> {readTime}M</span>
          <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
          <span>{date}</span>
        </div>
        <h3 className="text-2xl font-black leading-[1.1] mb-8 group-hover:text-primary transition-all font-lora text-slate-900 dark:text-white tracking-tighter uppercase">
          <Link to={link} className="text-inherit no-underline">{title}</Link>
        </h3>
        <div className="flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800/50 mt-auto">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-primary/5 dark:bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary text-[10px] shadow-sm">
                {authorInitial}
             </div>
             <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">{displayAuthor}</span>
          </div>
          <Link to={link} className="p-2.5 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-200 hover:bg-primary/10 hover:text-primary transition-all border-none">
            <ArrowRight style={{ width: '1rem', height: '1rem' }} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
