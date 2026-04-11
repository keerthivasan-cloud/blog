import React from 'react';
import { Menu, Search, Moon, Sun, ArrowLeft } from 'lucide-react';
import { useContent } from '../../context/ContentContext';
import { Link } from 'react-router-dom';

const Topbar = ({ toggleMobileMenu }) => {
  const { darkMode, toggleTheme } = useContent();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 md:px-8 h-16 flex items-center justify-between transition-colors">
      
      <div className="flex items-center gap-4">
        {/* Mobile Menu Toggle */}
        <button 
          onClick={toggleMobileMenu}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Menu size={20} />
        </button>

        {/* Search Bar - hidden on very small screens */}
        <div className="hidden sm:flex items-center relative w-64 md:w-96">
          <Search size={16} className="absolute left-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Quick search..." 
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100 dark:bg-slate-800 border-transparent rounded-lg text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-slate-900 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link 
          to="/"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors border border-transparent"
        >
          <ArrowLeft size={14} /> Back to Site
        </Link>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Toggle Theme"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Admin Avatar */}
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 overflow-hidden cursor-pointer hover:border-primary transition-colors flex items-center justify-center font-bold text-xs text-slate-500">
           AD
        </div>
      </div>
      
    </header>
  );
};

export default Topbar;
