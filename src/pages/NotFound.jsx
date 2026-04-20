import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/Layout';
import { ArrowLeft, Search } from 'lucide-react';
import { updateSEOMetadata } from '../utils/seo';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    updateSEOMetadata({ title: '404 — Page Not Found | NewsForge', description: 'This page does not exist.' });
  }, []);

  return (
    <div style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="min-h-[70vh] flex items-center justify-center px-5 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md"
        >
          <p className="section-label mb-4">404 Error</p>
          <h1 className="text-6xl md:text-8xl font-bold mb-4" style={{ letterSpacing: '-0.04em' }}>
            Not Found
          </h1>
          <p className="text-base mb-8" style={{ color: 'var(--text-muted)' }}>
            The page at <code className="text-sm px-1.5 py-0.5 rounded" style={{ background: 'var(--bg-soft)', color: 'var(--accent)' }}>{location.pathname}</code> doesn't exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary">
              <ArrowLeft className="w-4 h-4" /> Back to Home
            </Link>
            <Link to="/quick-reads" className="btn-ghost">
              <Search className="w-4 h-4" /> Browse Articles
            </Link>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default NotFound;
