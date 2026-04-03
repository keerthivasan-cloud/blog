import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, PenTool, TrendingUp, Search, Github, Twitter, Linkedin, ArrowRight, Clock } from 'lucide-react';

export const Navbar = () => (
  <nav className="glass sticky top-0 z-50 w-full px-8 py-4 flex items-center justify-between">
    <Link to="/" className="flex items-center gap-2 text-inherit no-underline" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="w-10 h-10 rounded-xl flex items-center justify-center border" style={{ background: 'hsla(263,70%,50%,0.2)', borderColor: 'hsla(263,70%,50%,0.2)' }}>
        <PenTool style={{ width: '1.25rem', height: '1.25rem', color: '#a855f7' }} />
      </div>
      <span className="text-xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>BlogScale</span>
    </Link>
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
      <Link to="/" className="hover:text-foreground transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>Home</Link>
      <Link to="/news" className="hover:text-foreground transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>News</Link>
      <Link to="/business" className="hover:text-foreground transition-colors" style={{ textDecoration: 'none', color: 'inherit' }}>Business</Link>
    </div>
    <div className="flex items-center gap-4">
      <button className="p-2 hover:bg-secondary rounded-full transition-colors">
        <Search style={{ width: '1.25rem', height: '1.25rem' }} />
      </button>
      <button className="primary-btn">Write</button>
    </div>
  </nav>
);

export const Footer = () => (
  <footer style={{ borderTop: '1px solid hsl(var(--border))', marginTop: '8rem', padding: '4rem 2rem', background: 'hsla(240,5%,15%,0.3)' }}>
    <div style={{ maxWidth: '80rem', margin: '0 auto', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '2rem' }}>
      <div className="flex items-center gap-2">
        <PenTool style={{ width: '1.5rem', height: '1.5rem', color: '#a855f7' }} />
        <span className="text-2xl font-bold" style={{ fontFamily: 'Outfit, sans-serif' }}>BlogScale</span>
      </div>
      <div className="flex gap-8 text-sm text-muted-foreground">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }} className="hover:text-foreground">Home</Link>
        <Link to="/news" style={{ textDecoration: 'none', color: 'inherit' }} className="hover:text-foreground">News</Link>
        <Link to="/business" style={{ textDecoration: 'none', color: 'inherit' }} className="hover:text-foreground">Business</Link>
      </div>
      <div className="flex gap-4">
        <Twitter style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }} />
        <Github style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }} />
        <Linkedin style={{ width: '1.25rem', height: '1.25rem', cursor: 'pointer', color: 'hsl(var(--muted-foreground))' }} />
      </div>
    </div>
    <div style={{ textAlign: 'center', marginTop: '3rem', fontSize: '0.875rem', color: 'hsla(240,5%,65%,0.6)' }}>
      © 2026 BlogScale. Built with speed and precision.
    </div>
  </footer>
);

export const BlogCard = ({ title, category, author, date, readTime, image, link }) => (
  <motion.div whileHover={{ y: -8 }} className="glass rounded-3xl overflow-hidden card-hover group" style={{ borderColor: 'hsla(var(--border),0.4)' }}>
    <div style={{ aspectRatio: '16/9', width: '100%', overflow: 'hidden', position: 'relative' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, hsla(240,10%,4%,0.8), transparent)', zIndex: 10 }} />
      <img src={image} alt={title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} />
      <div style={{ position: 'absolute', top: '1rem', left: '1rem', zIndex: 20, padding: '0.25rem 0.75rem', borderRadius: '9999px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.75rem', fontWeight: '500' }}>
        {category}
      </div>
    </div>
    <div style={{ padding: '1.5rem' }}>
      <div className="flex items-center gap-3 text-xs text-muted-foreground" style={{ marginBottom: '1rem' }}>
        <span className="flex items-center gap-1"><Clock style={{ width: '0.75rem', height: '0.75rem' }} /> {readTime} min read</span>
        <span>•</span>
        <span>{date}</span>
      </div>
      <h3 className="text-xl font-bold" style={{ marginBottom: '1rem', lineHeight: '1.375', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{title}</h3>
      <div className="flex items-center justify-between" style={{ marginTop: '1.5rem' }}>
        <div className="flex items-center gap-2">
          <div style={{ width: '2rem', height: '2rem', borderRadius: '9999px', background: 'hsl(var(--secondary))', border: '1px solid hsl(var(--border))' }} />
          <span className="text-sm font-medium">{author}</span>
        </div>
        {link && (
          <Link to={link} style={{ padding: '0.5rem', borderRadius: '9999px', color: 'hsl(var(--muted-foreground))', textDecoration: 'none', display: 'flex' }}>
            <BookOpen style={{ width: '1rem', height: '1rem' }} />
          </Link>
        )}
      </div>
    </div>
  </motion.div>
);
