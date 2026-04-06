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
      className="p-2.5 rounded-2xl border-none cursor-pointer relative overflow-hidden group transition-all duration-500 hover:scale-110 active:scale-95"
      style={{ background: 'var(--bg-soft)' }}
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
            <Moon className="w-5 h-5 text-indigo-400" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 20, rotate: 45, opacity: 0 }}
            animate={{ y: 0, rotate: 0, opacity: 1 }}
            exit={{ y: -20, rotate: -45, opacity: 0 }}
            transition={{ duration: 0.3, ease: "backOut" }}
          >
            <Sun className="w-5 h-5 text-orange-500" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

const LiveMarketStrip = () => {
  const { marketData } = useContent();
  
  return (
    <div className="py-2 px-8 overflow-hidden relative flex items-center shrink-0" style={{ background: 'var(--bg-main)', borderBottom: '1px solid var(--border)' }}>
      <div className="flex items-center gap-12 animate-marquee whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.2em] mono">
        {marketData.map((item, idx) => (
          <span key={idx} className="flex items-center gap-3 group px-4">
            <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
            <span style={{ color: 'var(--text-primary)' }} className="font-black tracking-tighter">{item.price}</span>
            <span className="flex items-center gap-1" style={{ color: item.isUp ? 'var(--green)' : 'var(--red)' }}>
              {item.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
              {item.isUp ? '+' : ''}{item.change}%
            </span>
          </span>
        ))}
        {/* Continuous loop duplication */}
        {marketData.map((item, idx) => (
          <span key={`dup-${idx}`} className="flex items-center gap-3 group px-4">
            <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
            <span style={{ color: 'var(--text-primary)' }} className="font-black tracking-tighter">{item.price}</span>
            <span className="flex items-center gap-1" style={{ color: item.isUp ? 'var(--green)' : 'var(--red)' }}>
              {item.isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
              {item.isUp ? '+' : ''}{item.change}%
            </span>
          </span>
        ))}
      </div>
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10" style={{ background: 'linear-gradient(to right, var(--bg-main), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10" style={{ background: 'linear-gradient(to left, var(--bg-main), transparent)' }} />
    </div>
  );
};

export const Navbar = () => {
  const [isSearchOpen, setIsSearchOpen] = React.useState(false);

  return (
    <>
      <LiveMarketStrip />
      <nav className="navbar sticky top-0 z-50 w-full px-6 md:px-12 py-3 flex items-center justify-between">
    <Link to="/" className="flex items-center gap-3 no-underline text-inherit group">
      <div className="w-10 h-10 rounded-[14px] flex items-center justify-center border transition-all duration-500 group-hover:rotate-[15deg] group-hover:scale-110" style={{ background: '#05070F', borderColor: 'var(--accent)' }}>
        <PenTool style={{ width: '1.2rem', height: '1.2rem', color: 'var(--accent)' }} />
      </div>
      <span className="text-2xl font-[900] tracking-[-0.06em] transition-colors duration-500 uppercase" style={{ color: 'var(--text-primary)' }}>NewsForge</span>
    </Link>
    <div className="hidden lg:flex items-center gap-10 text-[18px] font-black uppercase tracking-tight transition-colors duration-500" style={{ color: 'var(--text-secondary)' }}>
      <Link to="/tech" className="hover:text-[var(--accent)] transition-colors no-underline text-inherit">Tech</Link>
      <Link to="/business" className="hover:text-[var(--accent)] transition-colors no-underline text-inherit">Business</Link>
      <Link to="/finance" className="hover:text-[var(--accent)] transition-colors no-underline text-inherit">Finance</Link>
      <Link to="/global-market" className="hover:text-[var(--accent)] transition-colors no-underline text-inherit">Markets</Link>
      <Link to="/commodities" className="hover:text-[var(--accent)] transition-colors no-underline text-inherit">Commodities</Link>
    </div>
      <div className="flex items-center gap-4">
        <ThemeToggle />
        <button 
          onClick={() => setIsSearchOpen(true)}
          className="p-2.5 rounded-xl transition-colors border-none bg-transparent cursor-pointer"
          style={{ color: 'var(--text-secondary)' }}
        >
          <Search style={{ width: '1.25rem', height: '1.25rem' }} />
        </button>
        <Link to="/write" className="btn-primary">Write</Link>
      </div>
    </nav>
    <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

export const Footer = () => (
  <footer className="mt-24 py-20 px-8 divider" style={{ background: 'var(--bg-main)' }}>
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
      <div className="md:col-span-1">
        <div className="flex items-center gap-2 mb-6 text-2xl font-black">
          <PenTool style={{ width: '1.75rem', height: '1.75rem', color: 'var(--accent)' }} />
          <span>NewsForge</span>
        </div>
        <p className="text-sm font-medium leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
          Precision journalism for the modern architect of industry. Defining the intersection of global markets and emerging technology.
        </p>
        <div className="flex gap-6">
          <Twitter className="w-5 h-5 cursor-pointer transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--text-muted)' }} />
          <Github className="w-5 h-5 cursor-pointer transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--text-muted)' }} />
          <Linkedin className="w-5 h-5 cursor-pointer transition-colors hover:text-[var(--accent)]" style={{ color: 'var(--text-muted)' }} />
        </div>
      </div>
      
      <div>
        <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8" style={{ color: 'var(--text-muted)' }}>Navigation</h4>
        <ul className="list-none p-0 space-y-4 text-sm font-bold">
          <li><Link to="/" className="hover:text-[var(--accent)] no-underline transition-colors" style={{ color: 'var(--text-secondary)' }}>Global Home</Link></li>
          <li><Link to="/tech" className="hover:text-[var(--accent)] no-underline transition-colors" style={{ color: 'var(--text-secondary)' }}>Technical Index</Link></li>
          <li><Link to="/business" className="hover:text-[var(--accent)] no-underline transition-colors" style={{ color: 'var(--text-secondary)' }}>Business Intelligence</Link></li>
          <li><Link to="/finance" className="hover:text-[var(--accent)] no-underline transition-colors" style={{ color: 'var(--text-secondary)' }}>Financial Hub</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-black text-xs uppercase tracking-[0.2em] mb-8" style={{ color: 'var(--text-muted)' }}>Resources</h4>
        <ul className="list-none p-0 space-y-4 text-sm font-bold">
          <li><Link to="/about" className="hover:text-[var(--accent)] no-underline transition-colors" style={{ color: 'var(--text-secondary)' }}>Management</Link></li>
          <li><Link to="/contact" className="hover:text-[var(--accent)] no-underline transition-colors" style={{ color: 'var(--text-secondary)' }}>Terminal Support</Link></li>
          <li><Link to="/privacy" className="hover:text-[var(--accent)] no-underline transition-colors" style={{ color: 'var(--text-secondary)' }}>Privacy Protocol</Link></li>
          <li><Link to="/admin/login" className="hover:text-[var(--accent)] no-underline transition-colors" style={{ color: 'var(--text-secondary)' }}>Admin Access</Link></li>
        </ul>
      </div>

      <div className="card p-8">
        <h4 className="font-black text-[10px] uppercase tracking-[0.2em] mb-4" style={{ color: 'var(--text-muted)' }}>Newsletter</h4>
        <p className="text-[10px] mb-4 font-bold leading-relaxed uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>Join 42k+ deep-tech readers.</p>
        <div className="space-y-3">
          <input type="email" placeholder="email@nexus.com" className="input w-full p-3 text-[10px] font-bold" />
          <button className="btn-primary w-full py-3">Synchronize</button>
        </div>
      </div>
    </div>
    <div className="text-center mt-24 text-[11px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--text-muted)' }}>
      © 2026 NewsForge System Terminal. All Rights Reserved.
    </div>
  </footer>
);

export const BlogCard = ({ title, category, author, date, readTime, image, link, description, excerpt, variant = "standard" }) => {
  const displayAuthor = author || "NewsForge";
  const authorInitial = "N"; // NewsForge Brand Constant
  const summary = description || excerpt || "Strategic analysis of emerging market architectures and technical paradigms.";

  if (variant === "featured") {
    return (
      <motion.div whileHover={{ y: -8 }} className="relative group rounded-[32px] overflow-hidden aspect-[21/10] shadow-2xl" style={{ border: '1px solid var(--border)' }}>
        <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, rgba(5, 7, 15, 0.95), transparent)' }} />
        <img src={image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" alt="" loading="lazy" />
        <div className="absolute bottom-0 left-0 p-12 z-20 w-full text-left">
          <div className="flex items-center gap-4 mb-4">
             <span className="px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest label-tech shadow-xl" style={{ background: 'var(--bg-card)' }}>{category} Protocol</span>
             <span className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 mono" style={{ color: 'var(--text-muted)' }}><Clock className="w-3.5 h-3.5" /> {readTime}M</span>
          </div>
          <h2 className="text-4xl md:text-7xl font-black leading-none -tracking-tight transition-all group-hover:text-[var(--accent)] uppercase h-gradient">
            <Link to={link} className="text-inherit no-underline">{title}</Link>
          </h2>
        </div>
      </motion.div>
    );
  }

  if (variant === "trending") {
    return (
      <Link to={link} className="flex items-center gap-6 p-4 rounded-3xl transition-all border border-transparent hover:border-white/5 hover:bg-white/[0.02] group no-underline text-inherit text-left">
        <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border border-white/5">
          <img src={image} className="w-full h-full object-cover grayscale-[40%] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" alt="" />
        </div>
        <div className="flex flex-col gap-2">
           <div className="flex items-center gap-3">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded bg-orange-600/10 text-orange-600 border border-orange-600/10">{category}</span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#64748B]">{readTime}M Read</span>
           </div>
           <h4 className="text-sm font-black leading-snug group-hover:text-orange-500 transition-colors line-clamp-2 uppercase tracking-wide">{title}</h4>
        </div>
      </Link>
    );
  }

  if (variant === "list") {
    return (
      <div className="flex items-center gap-5 p-4 transition-all rounded-2xl group cursor-pointer text-left hover:translate-x-2" style={{ border: '1px solid transparent', hover: {borderColor: 'var(--border)', background: 'var(--bg-soft)'} }}>
        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0" style={{ border: '1px solid var(--border)', background: 'var(--bg-soft)' }}>
          <img src={image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-125" alt="" loading="lazy" />
        </div>
        <div className="py-1">
           <div className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 mono" style={{ color: 'var(--accent)' }}>{category}</div>
           <h4 className="text-base font-bold leading-tight group-hover:text-[var(--accent)] transition-colors line-clamp-2 uppercase tracking-tighter" style={{ color: 'var(--text-primary)' }}>
             <Link to={link} className="text-inherit no-underline">{title}</Link>
           </h4>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="card h-full text-left flex flex-col group overflow-hidden border-white/5 bg-white/[0.02]">
      <div className="aspect-[16/10] w-full overflow-hidden relative">
        <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0" loading="lazy" />
        <div className="absolute top-6 left-6 z-20 px-4 py-2 rounded-xl backdrop-blur-md shadow-lg" style={{ background: 'rgba(5, 7, 15, 0.7)', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--accent)' }}>{category}</span>
        </div>
      </div>
      <div className="p-8 flex flex-col flex-1">
        <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest mb-6 mono" style={{ color: 'var(--text-muted)' }}>
          <span className="flex items-center gap-2"><Clock className="w-4 h-4" style={{ color: 'var(--accent)' }} /> {readTime} MINS</span>
          <div className="w-1.5 h-1.5 rounded-full bg-[#334155]" />
          <span>{date}</span>
        </div>
        <h3 className="text-2xl font-black leading-[1.25] mb-4 group-hover:text-[var(--accent)] transition-all tracking-[-0.04em] uppercase line-clamp-2" style={{ color: 'var(--text-primary)' }}>
          <Link to={link} className="text-inherit no-underline">{title}</Link>
        </h3>
        <p className="text-sm font-medium line-clamp-2 text-[#94A3B8] mb-10 leading-relaxed">
          {summary}
        </p>
        <div className="flex items-center justify-between pt-8 mt-auto border-t border-white/5">
          <div className="flex items-center gap-4">
             <div className="w-11 h-11 rounded-2xl flex items-center justify-center font-black text-[12px] shadow-inner" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent-soft)' }}>
                {authorInitial}
             </div>
             <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>{displayAuthor}</span>
                <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#64748B]">Senior Architect</span>
             </div>
          </div>
          <Link to={link} className="p-3 rounded-2xl bg-white/5 hover:bg-orange-600 hover:text-white transition-all">
            <ArrowRight style={{ width: '1.25rem', height: '1.25rem' }} />
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
