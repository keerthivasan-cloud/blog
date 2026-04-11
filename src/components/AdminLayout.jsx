import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import { Search, Sun, Moon, Menu, X, PenTool, LogOut, LayoutDashboard, FileText, Users, Image as LucideImage } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import SearchOverlay from './SearchOverlay';
import { Footer } from './Layout';

/* ─── Theme Toggle ────────────────────────────── */
const ThemeToggle = () => {
  const { darkMode, toggleTheme } = useContent();
  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-md border border-[var(--border)] bg-transparent cursor-pointer transition-colors hover:bg-[var(--bg-soft)]"
    >
      <AnimatePresence mode="wait" initial={false}>
        {darkMode ? (
          <motion.span key="moon"
            initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.2 }}
          >
            <Moon className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </motion.span>
        ) : (
          <motion.span key="sun"
            initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: -8, opacity: 0 }} transition={{ duration: 0.2 }}
          >
            <Sun className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
};

/* ─── Admin Navbar ────────────────────────────── */
export const AdminNavbar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { logout } = useContent();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'Dashboard',   href: '/admin/dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { label: 'Write',       href: '/admin/write', icon: <FileText className="w-4 h-4" /> },
  ];

  return (
    <>
      <header
        className="navbar sticky top-0 z-50 w-full"
        style={{ boxShadow: scrolled ? 'var(--shadow-sm)' : 'none', transition: 'box-shadow 0.2s', background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[60px] flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/admin/dashboard" className="flex items-center gap-2 shrink-0 no-underline group">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center bg-slate-900 dark:bg-white"
            >
              <PenTool className="w-3.5 h-3.5 text-white dark:text-slate-900" />
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
            >
              NewsForge <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded ml-1">Admin</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="px-3 py-1.5 flex items-center gap-2 rounded-md text-sm font-medium transition-colors no-underline"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
              className="p-2 rounded-md border border-[var(--border)] bg-transparent cursor-pointer transition-colors hover:bg-[var(--bg-soft)]"
            >
              <Search className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
            </button>
            <ThemeToggle />
            <button
              onClick={() => { logout(); navigate('/admin/login'); }}
              aria-label="Logout"
              className="p-2 rounded-md border border-[var(--border)] bg-transparent cursor-pointer transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400"
            >
              <LogOut className="w-4 h-4" />
            </button>
            <button
              className="lg:hidden p-2 rounded-md border border-[var(--border)] bg-transparent cursor-pointer transition-colors hover:bg-[var(--bg-soft)]"
              onClick={() => setIsMobileMenuOpen(v => !v)}
              aria-label="Menu"
            >
              {isMobileMenuOpen
                ? <X    className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                : <Menu className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
              }
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="lg:hidden fixed top-[60px] left-0 right-0 z-40 border-b"
            style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
          >
            <nav className="max-w-7xl mx-auto px-5 py-4 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-3 py-2.5 flex items-center gap-3 rounded-md text-sm font-medium no-underline transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {link.icon} {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
};

/* ─── Admin Layout Wrapper ──────────────────── */
export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col font-['Inter']" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontSize: '13px' }
      }} />
      <AdminNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
