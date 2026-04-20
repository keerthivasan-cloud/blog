import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Navbar, Footer, BlogCard } from '../components/Layout';
import { Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import { updateSEOMetadata } from '../utils/seo';
import { useContent } from '../context/ContentContext';

const SkeletonCard = () => (
  <div className="card overflow-hidden animate-pulse">
    <div className="aspect-[16/10]" style={{ background: 'var(--bg-soft)' }} />
    <div className="p-5 space-y-3">
      <div className="h-3 w-16 rounded" style={{ background: 'var(--bg-soft)' }} />
      <div className="h-5 w-full rounded" style={{ background: 'var(--bg-soft)' }} />
      <div className="h-5 w-3/4 rounded" style={{ background: 'var(--bg-soft)' }} />
    </div>
  </div>
);

const CategoryPage = ({ category, title, description }) => {
  const { lastDeletedId } = useContent();
  const [articles,    setArticles]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page,        setPage]        = useState(1);
  const [hasMore,     setHasMore]     = useState(true);

  useEffect(() => {
    updateSEOMetadata({ title: `${title} | NewsForge`, description });
  }, [category, title, description]);

  // Global Deletion Sync
  useEffect(() => {
    if (lastDeletedId) {
      setArticles(prev => prev.filter(a => String(a.id || a._id) !== String(lastDeletedId)));
    }
  }, [lastDeletedId]);

  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchArticles(1, true);
  }, [category]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchArticles = async (pageNum, isInitial = false) => {
    if (!isInitial) setLoadingMore(true);
    try {
      const res  = await axios.get(`${API_BASE_URL}/articles?category=${category}&page=${pageNum}&limit=9`);
      const next = res.data.articles || [];
      setArticles(prev => isInitial ? next : [...prev, ...next]);
      setHasMore(pageNum < res.data.totalPages);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchArticles(next);
  };

  const articleLink = (item) =>
    `/${(item.category || 'news').toLowerCase().replace(/\s+/g, '-')}/${item.slug}`;

  return (
    <div style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />

      <main className="max-w-7xl mx-auto px-5 md:px-8 pt-10 pb-20">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm mb-6 no-underline transition-colors hover:text-[var(--accent)]"
            style={{ color: 'var(--text-muted)' }}
          >
            <ArrowLeft className="w-4 h-4" /> Back to home
          </Link>

          <div className="border-l-4 pl-5" style={{ borderColor: 'var(--accent)' }}>
            <p className="section-label mb-1">Section</p>
            <h1
              className="text-3xl md:text-5xl font-bold mb-3"
              style={{ letterSpacing: '-0.03em' }}
            >{title}</h1>
            {description && (
              <p className="text-base leading-relaxed max-w-2xl" style={{ color: 'var(--text-muted)' }}>
                {description}
              </p>
            )}
          </div>
        </motion.div>

        {/* Divider */}
        <div className="divider mb-10" />

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((item, idx) => (
                <motion.div
                  key={item._id || item.id}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (idx % 3) * 0.06, duration: 0.4 }}
                >
                  <BlogCard
                    title={item.title}
                    category={item.category}
                    author={item.author || 'NewsForge'}
                    readTime={item.readTime || 5}
                    image={item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800'}
                    link={articleLink(item)}
                    excerpt={item.excerpt}
                    date={new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric'
                    })}
                  />
                </motion.div>
              ))}
            </div>

            {hasMore && (
              <div className="mt-10 text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="btn-ghost px-8 py-2.5 disabled:opacity-50"
                >
                  {loadingMore
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading…</>
                    : <><span>Load more</span><ArrowRight className="w-4 h-4" /></>
                  }
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24">
            <p className="text-5xl font-bold mb-4 opacity-10">—</p>
            <h3 className="text-xl font-bold mb-3">No articles yet</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
              Nothing published in <strong>{title}</strong> yet. Check back soon.
            </p>
            <Link to="/" className="btn-primary">Browse all articles</Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
