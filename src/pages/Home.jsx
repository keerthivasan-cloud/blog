import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Zap, Tag } from 'lucide-react';
import axios from 'axios';
import { Navbar, Footer, BlogCard } from '../components/Layout';
import API_BASE_URL from '../config';
import { updateSEOMetadata } from '../utils/seo';
import { useContent } from '../context/ContentContext';
import AdPlacement from '../components/AdPlacement';

/* ─── Skeleton card ─────────────────────────── */
const SkeletonCard = () => (
  <div className="card overflow-hidden animate-pulse" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
    <div className="aspect-[16/10] w-full" style={{ background: 'var(--bg-soft)' }} />
    <div className="p-5 space-y-4">
      <div className="flex justify-between">
        <div className="h-3 w-16 rounded" style={{ background: 'var(--bg-soft)' }} />
        <div className="h-3 w-12 rounded" style={{ background: 'var(--bg-soft)' }} />
      </div>
      <div className="h-5 w-full rounded" style={{ background: 'var(--bg-soft)' }} />
      <div className="h-4 w-3/4 rounded" style={{ background: 'var(--bg-soft)' }} />
      <div className="pt-4 border-t" style={{ borderColor: 'var(--border-soft)' }}>
        <div className="flex justify-between">
          <div className="h-5 w-20 rounded" style={{ background: 'var(--bg-soft)' }} />
          <div className="h-5 w-12 rounded" style={{ background: 'var(--bg-soft)' }} />
        </div>
      </div>
    </div>
  </div>
);

const SkeletonFeatured = () => (
  <div className="rounded-xl overflow-hidden animate-pulse flex flex-col md:aspect-[21/9]" style={{ border: '1px solid var(--border)' }}>
    <div className="aspect-[16/10] md:aspect-auto md:flex-1" style={{ background: 'var(--bg-soft)' }} />
    <div className="p-5 md:p-10 space-y-3">
      <div className="h-3 w-20 rounded" style={{ background: 'var(--bg-soft)' }} />
      <div className="h-8 md:h-12 w-full rounded" style={{ background: 'var(--bg-soft)' }} />
      <div className="h-5 w-1/3 rounded" style={{ background: 'var(--bg-soft)' }} />
    </div>
  </div>
);

/* ─── Category tabs ─────────────────────────── */
const CATEGORIES = ['All', 'General News', 'Tech', 'Business', 'Finance', 'Markets', 'Commodities'];

const articleLink = (item) =>
  `/${(item.category || 'news').toLowerCase().replace(/\s+/g, '-')}/${item.slug}`;

const formatDate = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ─── Home ──────────────────────────────────── */
const Home = () => {
  const { articles: cachedArticles } = useContent();
  const [articles,      setArticles]      = useState(cachedArticles || []);
  const [trendingTags,  setTrendingTags]  = useState([]);
  const [activeCategory,setActiveCategory]= useState('All');
  const [activeTag,     setActiveTag]     = useState(null);
  // If we already have cached articles, skip the skeleton; start loading=false
  const [loading,       setLoading]       = useState(cachedArticles.length === 0);
  const [loadingMore,   setLoadingMore]   = useState(false);
  const [page,          setPage]          = useState(1);
  const [hasMore,       setHasMore]       = useState(true);

  useEffect(() => {
    updateSEOMetadata({
      title: 'NewsForge — Journalism for Modern Professionals',
      description: 'In-depth reporting on tech, finance, and global markets.',
    });
  }, []);

  /* Refetch on category / tag change */
  useEffect(() => {
    setLoading(true);
    setPage(1);
    fetchArticles(1, true);
  }, [activeCategory, activeTag]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchArticles = async (pageNum, isInitial = false) => {
    if (!isInitial) setLoadingMore(true);
    const params = new URLSearchParams({ page: pageNum, limit: 6 });
    if (activeCategory !== 'All') params.append('category', activeCategory);
    if (activeTag)                params.append('tag', activeTag);
    try {
      const res = await axios.get(`${API_BASE_URL}/articles?${params}`);
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

  useEffect(() => {
    axios.get(`${API_BASE_URL}/articles/trending-tags`)
      .then(r => setTrendingTags(r.data))
      .catch(() => {});
  }, []);

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchArticles(next);
  };

  const featured      = articles[0]         || null;
  const secondaryRow  = articles.slice(1, 4);
  const gridArticles  = articles.slice(4);

  return (
    <div style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />

      {/* ── HERO ──────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 pt-6 md:pt-10 pb-8 md:pb-12">

        {/* Featured article */}
        {loading ? <SkeletonFeatured /> : featured && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <BlogCard
              variant="featured"
              title={featured.title}
              category={featured.category}
              author={featured.author}
              readTime={featured.readTime || 5}
              image={featured.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200'}
              link={articleLink(featured)}
              date={formatDate(featured.createdAt)}
            />
          </motion.div>
        )}

        {/* Secondary row — 3 articles below the hero */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : secondaryRow.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6">
            {secondaryRow.map((item, idx) => (
              <motion.div
                key={item.slug}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08, duration: 0.4 }}
              >
                <BlogCard
                  title={item.title}
                  category={item.category}
                  author={item.author}
                  readTime={item.readTime || 5}
                  image={item.image}
                  link={articleLink(item)}
                  excerpt={item.excerpt}
                  date={formatDate(item.createdAt)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </section>

      <AdPlacement slotId="home-main-banner" />

      {/* ── DIVIDER ───────────────────────────── */}
      <div className="divider" />

      {/* ── CATEGORY FILTER ───────────────────── */}
      <div
        className="sticky top-[60px] z-30 border-b"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-5 md:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-3">
            {CATEGORIES.map(cat => {
              const active = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setActiveTag(null); }}
                  className="shrink-0 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-all cursor-pointer border-none"
                  style={{
                    background: active ? 'var(--accent)'   : 'transparent',
                    color:      active ? '#FFFFFF'         : 'var(--text-muted)',
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── LATEST ARTICLES ───────────────────── */}
      <section id="latest-feed" className="max-w-7xl mx-auto px-5 md:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="section-label mb-1">Latest Articles</p>
            <h2 className="text-2xl font-bold" style={{ letterSpacing: '-0.03em' }}>
              {activeCategory === 'All' ? 'All Stories' : activeCategory}
            </h2>
          </div>
          {!loading && (
            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
              {articles.length} articles
            </span>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {loading
            ? [1, 2, 3, 4, 5, 6].map(i => <SkeletonCard key={i} />)
            : (activeCategory === 'All' ? gridArticles : articles).map((item, idx) => (
                <motion.div
                  key={item.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (idx % 3) * 0.06, duration: 0.4 }}
                >
                  <BlogCard
                    title={item.title}
                    category={item.category}
                    author={item.author}
                    readTime={item.readTime || 5}
                    image={item.image}
                    link={articleLink(item)}
                    excerpt={item.excerpt}
                    date={formatDate(item.createdAt)}
                  />
                </motion.div>
              ))
          }
        </div>

        {/* Load more */}
        {hasMore && !loading && (
          <div className="mt-10 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="btn-ghost px-8 py-2.5 disabled:opacity-50"
            >
              {loadingMore ? 'Loading…' : 'Load more articles'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </section>

      {/* ── DIVIDER ───────────────────────────── */}
      <div className="divider" />

      {/* ── TRENDING TOPICS + NEWSLETTER ──────── */}
      <section className="max-w-7xl mx-auto px-5 md:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">

          {/* Trending topics */}
          {trendingTags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Tag className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                <h3 className="text-lg font-bold">Trending Topics</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {trendingTags.map(tag => {
                  const active = activeTag === tag.name;
                  return (
                    <button
                      key={tag.name}
                      onClick={() => {
                        setActiveTag(active ? null : tag.name);
                        setActiveCategory('All');
                        document.getElementById('latest-feed')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="px-3 py-1.5 rounded-full text-sm font-medium border cursor-pointer transition-all"
                      style={{
                        background:   active ? 'var(--accent)'      : 'transparent',
                        color:        active ? '#fff'                : 'var(--text-secondary)',
                        borderColor:  active ? 'var(--accent)'       : 'var(--border)',
                      }}
                    >
                      {tag.name}
                      <span className="ml-1.5 text-xs opacity-50">{tag.count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Newsletter CTA */}
          <div
            className="rounded-xl p-8"
            style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}
          >
            <Zap className="w-6 h-6 mb-4" style={{ color: 'var(--accent)' }} />
            <h3 className="text-xl font-bold mb-2" style={{ letterSpacing: '-0.025em' }}>
              Stay ahead of the news
            </h3>
            <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-muted)' }}>
              Join 42,000+ professionals reading our weekly briefing. No spam, unsubscribe any time.
            </p>
            <form
              className="flex flex-col sm:flex-row gap-2"
              onSubmit={e => { e.preventDefault(); document.querySelector('footer input[type=email]')?.focus(); }}
            >
              <input
                type="email"
                placeholder="Your email address"
                className="input flex-1 text-sm"
                readOnly
                onFocus={e => { e.target.removeAttribute('readonly'); }}
              />
              <button type="submit" className="btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
