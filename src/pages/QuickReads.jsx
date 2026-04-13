import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Navbar, Footer } from '../components/Layout';
import { Zap, Clock, ArrowRight, BookOpen } from 'lucide-react';
import API_BASE_URL from '../config';
import { updateSEOMetadata } from '../utils/seo';

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ── Skeleton ──────────────────────────────── */
const QuickReadsSkeleton = () => (
  <div className="min-h-screen" style={{ background: 'var(--bg-main)' }}>
    <Navbar />
    <div className="max-w-3xl mx-auto px-5 md:px-8 py-16 space-y-8">
      {[1, 2, 3].map(i => (
        <div key={i} className="card rounded-xl p-8 animate-pulse space-y-4">
          <div className="h-3 w-24 rounded" style={{ background: 'var(--bg-soft)' }} />
          <div className="h-7 w-3/4 rounded" style={{ background: 'var(--bg-soft)' }} />
          <div className="h-4 w-full rounded" style={{ background: 'var(--bg-soft)' }} />
          <div className="h-4 w-5/6 rounded" style={{ background: 'var(--bg-soft)' }} />
        </div>
      ))}
    </div>
  </div>
);

/* ── Page ──────────────────────────────────── */
const QuickReads = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    updateSEOMetadata({
      title: 'Quick Reads — NewsForge',
      description: 'Short-form news briefs for professionals on the move.',
    });
  }, []);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/articles?limit=20&page=1`);
        const data = res.data.articles || [];
        setArticles(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        console.error('Quick Reads fetch failure:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  if (loading) return <QuickReadsSkeleton />;

  return (
    <div style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />

      <section className="max-w-3xl mx-auto px-5 md:px-8 pt-14 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <p className="section-label">Quick Reads</p>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ letterSpacing: '-0.03em' }}>
          Short-form Briefings
        </h1>
        <p className="text-base" style={{ color: 'var(--text-muted)' }}>
          Key stories distilled to their essentials — read in under 3 minutes.
        </p>
      </section>

      <div className="divider" />

      <main className="max-w-3xl mx-auto px-5 md:px-8 py-10 space-y-6">
        {articles.length === 0 ? (
          <div className="text-center py-24" style={{ color: 'var(--text-muted)' }}>
            <BookOpen className="w-10 h-10 mx-auto mb-4 opacity-30" />
            <p className="text-sm font-medium">No articles yet.</p>
          </div>
        ) : articles.map((article, idx) => (
          <motion.article
            key={article.id || article._id || idx}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: (idx % 5) * 0.05, duration: 0.4 }}
            className="card card-hover rounded-xl p-7 group"
          >
            {/* Meta row */}
            <div className="flex items-center gap-3 mb-4">
              <span
                className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded"
                style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
              >
                {article.category}
              </span>
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {formatDate(article.createdAt)}
              </span>
              <span className="flex items-center gap-1 text-xs ml-auto" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3 h-3" /> {article.readTime || 3} min
              </span>
            </div>

            {/* Title */}
            <h2
              className="text-xl md:text-2xl font-bold leading-snug mb-3 group-hover:text-[var(--accent)] transition-colors"
              style={{ letterSpacing: '-0.02em' }}
            >
              {article.title}
            </h2>

            {/* Excerpt / bullets */}
            {article.excerpt ? (
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                {article.excerpt}
              </p>
            ) : article.bullets?.length > 0 ? (
              <ul className="space-y-2 mb-5">
                {article.bullets.slice(0, 3).map((bullet, bIdx) => (
                  <li key={bIdx} className="flex gap-2 items-start text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Zap className="w-3 h-3 shrink-0 mt-0.5" style={{ color: 'var(--accent)' }} />
                    {bullet}
                  </li>
                ))}
              </ul>
            ) : null}

            {/* Read link */}
            <Link
              to={`/${(article.category || 'news').toLowerCase().replace(/\s+/g, '-')}/${article.slug}`}
              className="inline-flex items-center gap-2 text-sm font-semibold no-underline transition-all group-hover:gap-3"
              style={{ color: 'var(--accent)' }}
            >
              Read article <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.article>
        ))}
      </main>

      <Footer />
    </div>
  );
};

export default QuickReads;
