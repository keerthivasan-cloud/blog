import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import { Search, Sun, Moon, Menu, X, Clock, PenTool } from 'lucide-react';

/* Inline SVGs for deprecated lucide brand icons */
const IconTwitter  = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const IconGithub   = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/></svg>;
const IconLinkedin = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
import axios from 'axios';
import API_BASE_URL from '../config';
import toast, { Toaster } from 'react-hot-toast';
import SearchOverlay from './SearchOverlay';

const NotificationPrompt = React.lazy(() => import('./NotificationPrompt'));
const CookieConsent     = React.lazy(() => import('./CookieConsent'));

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

/* ─── Market Strip ────────────────────────────── */
const LiveMarketStrip = () => {
  const { marketData } = useContent();
  if (!marketData || marketData.length === 0) return null;

  return (
    <div
      className="py-1 sm:py-2 px-4 overflow-hidden relative flex items-center"
      style={{ background: 'var(--bg-soft)', borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex items-center gap-8 animate-marquee whitespace-nowrap text-[10px] sm:text-[11px] font-medium">
        {[...marketData, ...marketData].map((item, idx) => (
          <span key={idx} className="flex items-center gap-2">
            <span style={{ color: 'var(--text-muted)' }}>{item.name}</span>
            <span className="font-semibold" style={{ color: 'var(--text-primary)' }}>{item.price}</span>
            <span className="flex items-center gap-1" style={{ color: item.isUp ? 'var(--green)' : 'var(--red)' }}>
              {item.isUp ? '▲' : '▼'} {item.isUp ? '+' : ''}{item.change}%
            </span>
          </span>
        ))}
      </div>
      <div className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none" style={{ background: 'linear-gradient(to right, var(--bg-soft), transparent)' }} />
      <div className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none" style={{ background: 'linear-gradient(to left, var(--bg-soft), transparent)' }} />
    </div>
  );
};

/* ─── Navbar ──────────────────────────────────── */
export const Navbar = () => {
  const [isSearchOpen,     setIsSearchOpen]     = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled,         setScrolled]         = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { label: 'General',     href: '/general-news' },
    { label: 'Tech',        href: '/tech' },
    { label: 'Business',    href: '/business' },
    { label: 'Finance',     href: '/finance' },
    { label: 'Markets',     href: '/global-market' },
    { label: 'Commodities', href: '/commodities' },
  ];

  return (
    <>
      <header
        className="navbar sticky top-0 z-50 w-full"
        style={{ boxShadow: scrolled ? 'var(--shadow-sm)' : 'none', transition: 'box-shadow 0.2s' }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8 h-[60px] flex items-center justify-between gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0 no-underline group">
            <div
              className="w-7 h-7 rounded-md flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <PenTool className="w-3.5 h-3.5 text-white" />
            </div>
            <span
              className="text-lg font-bold tracking-tight"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}
            >
              NewsForge
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.href}
                to={link.href}
                className="px-3 py-1.5 rounded-md text-sm font-medium transition-colors no-underline"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >
                {link.label}
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
                  className="px-3 py-2.5 rounded-md text-sm font-medium no-underline transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {link.label}
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

/* ─── Layout wrapper ─────────────────────────── */
export default function Layout({ children }) {
  const notificationPromptRef = useRef();
  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Toaster position="top-right" toastOptions={{
        style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)', fontSize: '13px' }
      }} />
      <LiveMarketStrip />
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer onSubscribeSuccess={() => notificationPromptRef.current?.trigger()} />
      <React.Suspense fallback={null}>
        <NotificationPrompt ref={notificationPromptRef} />
        <CookieConsent />
      </React.Suspense>
    </div>
  );
}

/* ─── Footer ──────────────────────────────────── */
export const Footer = ({ onSubscribeSuccess }) => {
  const [email,   setEmail]   = useState('');
  const [status,  setStatus]  = useState('idle');

  const handleSubscribe = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      toast.error('Please enter a valid email address.');
      return;
    }
    setStatus('loading');
    try {
      const res = await axios.post(`${API_BASE_URL}/articles/subscribe`, { email: email.trim() });
      if (res.data.success) {
        toast.success('You\'re subscribed!');
        setEmail('');
        setStatus('success');
        setTimeout(() => onSubscribeSuccess?.(), 1500);
      } else {
        toast(res.data.message || 'Already subscribed.', { icon: 'ℹ️' });
        setStatus('idle');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed. Try again.');
      setStatus('error');
    }
  };

  const categories = [
    { label: 'General News', href: '/general-news' },
    { label: 'Technology',   href: '/tech' },
    { label: 'Business',     href: '/business' },
    { label: 'Finance',      href: '/finance' },
    { label: 'Markets',      href: '/global-market' },
    { label: 'Commodities',  href: '/commodities' },
  ];

  const company = [
    { label: 'About Us',         href: '/about'   },
    { label: 'Contact',          href: '/contact' },
    { label: 'Privacy Policy',   href: '/privacy' },
    { label: 'Terms & Conditions', href: '/terms' },
  ];

  return (
    <footer className="mt-16 pt-14 pb-8 divider" style={{ background: 'var(--bg-elevated)' }}>
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 lg:gap-10 pb-12 divider">

          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4 no-underline">
              <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'var(--accent)' }}>
                <PenTool className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-base font-bold" style={{ color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>NewsForge</span>
            </Link>
            <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
              In-depth journalism for modern professionals. Covering tech, finance, and global markets daily.
            </p>
            <div className="flex items-center gap-4">
              {[
                { Icon: IconTwitter,  label: 'Twitter'  },
                { Icon: IconGithub,   label: 'GitHub'   },
                { Icon: IconLinkedin, label: 'LinkedIn' },
              ].map(({ Icon, label }) => (
                <a key={label} href="#" aria-label={label}
                  className="transition-colors"
                  style={{ color: 'var(--text-muted)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: 'var(--text-muted)' }}>Categories</h4>
            <ul className="space-y-3">
              {categories.map(c => (
                <li key={c.href}>
                  <Link to={c.href} className="text-sm transition-colors no-underline" style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                  >{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: 'var(--text-muted)' }}>Company</h4>
            <ul className="space-y-3">
              {company.map(c => (
                <li key={c.href}>
                  <Link to={c.href} className="text-sm transition-colors no-underline" style={{ color: 'var(--text-secondary)' }}
                    onMouseEnter={e => e.target.style.color = 'var(--accent)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
                  >{c.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: 'var(--text-muted)' }}>Newsletter</h4>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
              Join 42,000+ readers. High-quality news, no spam.
            </p>
            <div className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Your email address"
                className="input text-sm"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSubscribe()}
              />
              <button
                onClick={handleSubscribe}
                disabled={status === 'loading'}
                className="btn-primary justify-center py-2.5 text-sm disabled:opacity-60"
              >
                {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs mt-8" style={{ color: 'var(--text-muted)' }}>
          © {new Date().getFullYear()} NewsForge. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

/* ─── BlogCard ────────────────────────────────── */
export const BlogCard = ({
  title, category, author, date, readTime,
  image, link, description, excerpt, variant = 'standard'
}) => {
  const summary = description || excerpt || '';
  const displayAuthor = author || 'NewsForge';

  /* FEATURED — full-width hero overlay card */
  if (variant === 'featured') {
    return (
      <div className="relative group rounded-xl overflow-hidden aspect-[16/9] md:aspect-[21/9] min-h-[220px] md:min-h-[320px]" style={{ border: '1px solid var(--border)' }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
        <img
          src={image}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-0 right-0 p-5 md:p-10 z-20">
          <span className="section-label mb-3 inline-block text-white/80">{category}</span>
          <h2 className="text-xl md:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3 max-w-3xl" style={{ letterSpacing: '-0.03em' }}>
            <Link to={link} className="no-underline text-inherit hover:opacity-90 transition-opacity">{title}</Link>
          </h2>
          <div className="flex items-center gap-3 text-sm text-white/60">
            <span>{displayAuthor}</span>
            <span>·</span>
            <Clock className="w-3.5 h-3.5" />
            <span>{readTime} min read</span>
          </div>
        </div>
      </div>
    );
  }

  /* TRENDING — compact horizontal list item */
  if (variant === 'trending') {
    return (
      <Link to={link} className="flex items-center gap-4 group no-underline py-3 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
        <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0">
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="section-label text-[10px] block mb-1">{category}</span>
          <h4 className="text-sm font-semibold leading-snug line-clamp-2 transition-colors" style={{ color: 'var(--text-primary)' }}
            onMouseEnter={e => e.target.style.color = 'var(--accent)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}
          >{title}</h4>
          <span className="text-xs mt-1 block" style={{ color: 'var(--text-muted)' }}>{readTime} min</span>
        </div>
      </Link>
    );
  }

  /* LIST — very compact */
  if (variant === 'list') {
    return (
      <div className="flex items-center gap-3 group">
        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0">
          <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
        </div>
        <div className="min-w-0">
          <span className="section-label text-[10px] block mb-0.5">{category}</span>
          <h4 className="text-sm font-semibold leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
            <Link to={link} className="no-underline hover:text-[var(--accent)] transition-colors">{title}</Link>
          </h4>
        </div>
      </div>
    );
  }

  /* STANDARD — default grid card */
  return (
    <article className="card card-hover flex flex-col h-full group overflow-hidden">
      {/* Image */}
      <div className="aspect-[16/10] overflow-hidden shrink-0">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <span className="section-label mb-2 block">{category}</span>
        <h3 className="text-lg font-bold leading-snug mb-2 line-clamp-2 transition-colors" style={{ color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          <Link to={link} className="no-underline hover:text-[var(--accent)] transition-colors">{title}</Link>
        </h3>
        {summary && (
          <p className="text-sm leading-relaxed line-clamp-2 flex-1 mb-4" style={{ color: 'var(--text-muted)' }}>{summary}</p>
        )}

        {/* Meta */}
        <div className="flex items-center justify-between pt-4 mt-auto border-t text-xs" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
              {displayAuthor[0]?.toUpperCase()}
            </div>
            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{displayAuthor}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>{readTime} min</span>
            {date && <><span>·</span><span>{date}</span></>}
          </div>
        </div>
      </div>
    </article>
  );
};
