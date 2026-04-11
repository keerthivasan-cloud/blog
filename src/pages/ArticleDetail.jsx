import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar, Footer, BlogCard } from '../components/Layout';
import {
  Clock, Calendar, Share2,
  Link as LinkIcon, BookOpen, Zap,
  Copy, CheckCircle2, HelpCircle, TrendingUp
} from 'lucide-react';

/* Inline SVGs for deprecated lucide brand icons */
const IconX        = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.74l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>;
const IconLinkedin = () => <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
import { ReadingProgressBar, TableOfContents, BlockRenderer } from '../components/ArticlePageComponents';
import API_BASE_URL from '../config';
import { updateSEOMetadata, injectArticleJSONLD } from '../utils/seo';
import AdPlacement from '../components/AdPlacement';

/* ─── Markdown → HTML ───────────────────────── */
const renderMarkdown = (md) => {
  if (!md) return '';
  return md
    .replace(/^---[\s\S]*?---\n*/m, '')
    .replace(/^#{1}\s+(.+)$/gm,  '<h1>$1</h1>')
    .replace(/^#{2}\s+(.+)$/gm,  '<h2>$1</h2>')
    .replace(/^#{3}\s+(.+)$/gm,  '<h3>$1</h3>')
    .replace(/^\>\s+(.+)$/gm,    '<blockquote><p>$1</p></blockquote>')
    .replace(/\*\*(.+?)\*\*/g,   '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,       '<em>$1</em>')
    .replace(/^[-*]\s+(.+)$/gm,  '<li>$1</li>')
    .replace(/(<li>[\s\S]*?<\/li>)/g, '<ul>$1</ul>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^(?!<[hbuliop])/gm, '')
    .replace(/^(.+)$/gm, line => line.startsWith('<') ? line : `<p>${line}</p>`);
};

/* ─── ArticleDetail ─────────────────────────── */
const ArticleDetail = () => {
  const { category, slug } = useParams();
  console.log("[DEBUG] ArticleDetail rendering for:", { category, slug });
  const [article,     setArticle]     = useState(null);
  const [related,     setRelated]     = useState([]);
  const [trending,    setTrending]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [copied,      setCopied]      = useState(false);
  const [contentMode, setContentMode] = useState('full');

  useEffect(() => {
    if (category === 'admin') return;

    window.scrollTo(0, 0);
    setLoading(true);
    const load = async () => {
      try {
        const res  = await axios.get(`${API_BASE_URL}/articles/${slug}`);
        const data = res.data;
        setArticle(data);
        updateSEOMetadata({
          title:       data.seo?.title       || data.title,
          description: data.seo?.description || data.excerpt,
          image:       data.seo?.ogImage     || data.image,
          keywords:    data.seo?.keywords,
          type:        'article',
        });
        injectArticleJSONLD(data);
        axios.post(`${API_BASE_URL}/articles/${data._id || data.id}/view`).catch(() => {});
        const relRes = await axios.get(`${API_BASE_URL}/articles?category=${data.category}`);
        setRelated((relRes.data.articles || []).filter(a => a.slug !== data.slug).slice(0, 3));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
    axios.get(`${API_BASE_URL}/articles/trending`).then(r => setTrending(r.data)).catch(() => {});
  }, [slug]);

  const formattedDate = useMemo(() => {
    if (!article) return '';
    return new Date(article.createdAt).toLocaleDateString('en-US', {
      month: 'long', day: 'numeric', year: 'numeric',
    });
  }, [article]);

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isBreaking = (date) => (new Date() - new Date(date)) < 6 * 3600 * 1000;

  const articleLink = (item) =>
    `/${(item.category || 'news').toLowerCase().replace(/\s+/g, '-')}/${item.slug}`;

  if (loading) return <ArticleSkeleton />;
  if (!article) return <ArticleNotFound />;

  return (
    <div style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <ReadingProgressBar />
      <Navbar />

      <main className="pb-20">
        <div className="max-w-7xl mx-auto px-5 md:px-8 pt-8">

          {/* ── Breadcrumb ────────────────────── */}
          <nav className="flex items-center gap-1.5 text-xs mb-6" style={{ color: 'var(--text-muted)' }}>
            <Link to="/" className="hover:text-[var(--accent)] transition-colors no-underline">Home</Link>
            <span>/</span>
            <Link
              to={`/${article.category.toLowerCase().replace(/\s+/g, '-')}`}
              className="hover:text-[var(--accent)] transition-colors no-underline"
            >{article.category}</Link>
            <span>/</span>
            <span className="truncate max-w-[200px]">{article.title}</span>
          </nav>

          {/* ── Article header ────────────────── */}
          <motion.header
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl"
          >
            {/* Tags row */}
            <div className="flex items-center gap-2 flex-wrap mb-4">
              {isBreaking(article.createdAt) && (
                <span className="px-2 py-0.5 rounded text-[11px] font-bold text-white animate-pulse"
                  style={{ background: 'var(--red)' }}>
                  Breaking
                </span>
              )}
              <span className="section-label">{article.category}</span>
              <span style={{ color: 'var(--border)' }}>·</span>
              <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                <Clock className="w-3 h-3" /> {article.readTime || 5} min read
              </span>
            </div>

            {/* Title */}
            <h1
              className="text-3xl md:text-5xl font-bold leading-tight mb-5"
              style={{ letterSpacing: '-0.03em' }}
            >
              {article.title}
            </h1>

            {/* Meta bar */}
            <div
              className="flex flex-wrap items-center justify-between gap-4 py-4 border-y mb-0"
              style={{ borderColor: 'var(--border)' }}
            >
              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                >
                  {(article.author || 'N')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>
                    {article.author || 'NewsForge'}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Contributor</p>
                </div>
              </div>

              {/* Date + share */}
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Calendar className="w-3.5 h-3.5" /> {formattedDate}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={copyLink}
                    className="p-2 rounded-md border cursor-pointer transition-colors hover:bg-[var(--bg-soft)]"
                    style={{ borderColor: 'var(--border)' }}
                    title="Copy link"
                  >
                    {copied
                      ? <CheckCircle2 className="w-3.5 h-3.5" style={{ color: 'var(--green)' }} />
                      : <Copy         className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    }
                  </button>
                  <button
                    className="p-2 rounded-md border cursor-pointer transition-colors hover:bg-[var(--bg-soft)]"
                    style={{ borderColor: 'var(--border)' }}
                    title="Share"
                    onClick={() => navigator.share?.({ title: article.title, url: window.location.href })}
                  >
                    <Share2 className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  </button>
                </div>
              </div>
            </div>
          </motion.header>
        </div>

        {/* ── Cover image ───────────────────────── */}
        <div className="max-w-5xl mx-auto px-5 md:px-8 mt-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            <img
              src={article.image}
              alt={article.title}
              className="w-full object-cover"
              style={{ maxHeight: '480px' }}
              loading="lazy"
            />
          </motion.div>
        </div>

        {/* ── Main content grid ─────────────────── */}
        <div className="max-w-7xl mx-auto px-5 md:px-8 mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Article body */}
            <article className="lg:col-span-8">
              <AdPlacement slotId="top-article-banner" />

              {/* Content mode switcher */}
              {(article.bullets?.length || article.eli5) && (
                <div
                  className="flex gap-1 p-1 rounded-lg mb-8 w-fit"
                  style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}
                >
                  {[
                    { id: 'full', label: 'Full article', icon: BookOpen },
                    { id: '30s',  label: '30-sec read',  icon: Zap       },
                    { id: 'eli5', label: 'Simple',        icon: HelpCircle},
                  ].map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setContentMode(id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer border-none transition-all"
                      style={{
                        background: contentMode === id ? 'var(--bg-card)'     : 'transparent',
                        color:      contentMode === id ? 'var(--text-primary)' : 'var(--text-muted)',
                        boxShadow:  contentMode === id ? 'var(--shadow-sm)'   : 'none',
                      }}
                    >
                      <Icon className="w-3.5 h-3.5" /> {label}
                    </button>
                  ))}
                </div>
              )}

              {/* Content */}
              <AnimatePresence mode="wait">
                {contentMode === '30s' && article.bullets?.length > 0 ? (
                  <motion.div
                    key="30s"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                    className="space-y-4 mb-16"
                  >
                    <h2 className="text-lg font-bold mb-6">Key Takeaways</h2>
                    {article.bullets.map((bullet, idx) => (
                      <div key={idx} className="flex gap-4 items-start">
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
                          style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                        >{idx + 1}</span>
                        <p className="text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{bullet}</p>
                      </div>
                    ))}
                  </motion.div>

                ) : contentMode === 'eli5' && article.eli5 ? (
                  <motion.div
                    key="eli5"
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}
                    className="rounded-xl p-8 mb-16"
                    style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <HelpCircle className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                      <span className="text-sm font-semibold">Plain English Summary</span>
                    </div>
                    <p className="text-lg leading-relaxed" style={{ color: 'var(--text-secondary)', fontFamily: 'Georgia, serif' }}>
                      {article.eli5}
                    </p>
                  </motion.div>

                ) : (
                  <motion.div
                    key="full"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }} transition={{ duration: 0.2 }}
                    className="prose-article"
                  >
                    {Array.isArray(article.content) && article.content.length > 0
                      ? <BlockRenderer blocks={article.content} />
                      : article.markdownContent
                        ? <div dangerouslySetInnerHTML={{ __html: renderMarkdown(article.markdownContent) }} />
                        : <p style={{ color: 'var(--text-muted)' }}>No content available.</p>
                    }
                  </motion.div>
                )}
              </AnimatePresence>
              
              <AdPlacement slotId="bottom-article-banner" />

              {/* Social share row (mobile) */}
              <div
                className="flex items-center gap-3 mt-10 pt-8 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <span className="text-sm font-medium mr-2" style={{ color: 'var(--text-muted)' }}>Share:</span>
                <a
                  href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(article.title)}`}
                  target="_blank" rel="noreferrer"
                  className="p-2 rounded-md border transition-colors hover:bg-[var(--bg-soft)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  aria-label="Share on X"
                >
                  <IconX />
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(window.location.href)}`}
                  target="_blank" rel="noreferrer"
                  className="p-2 rounded-md border transition-colors hover:bg-[var(--bg-soft)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  aria-label="Share on LinkedIn"
                >
                  <IconLinkedin />
                </a>
                <button
                  onClick={copyLink}
                  className="p-2 rounded-md border cursor-pointer transition-colors hover:bg-[var(--bg-soft)]"
                  style={{ borderColor: 'var(--border)' }}
                  aria-label="Copy link"
                >
                  {copied
                    ? <CheckCircle2 className="w-4 h-4" style={{ color: 'var(--green)' }} />
                    : <LinkIcon     className="w-4 h-4" style={{ color: 'var(--text-secondary)' }} />
                  }
                </button>
              </div>

              {/* Author bio */}
              <div
                className="mt-10 p-6 rounded-xl flex items-start gap-5"
                style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}
              >
                <div
                  className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                  style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}
                >
                  {(article.author || 'N')[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: 'var(--text-muted)' }}>Written by</p>
                  <h4 className="text-base font-bold mb-2">{article.author || 'NewsForge'}</h4>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    NewsForge contributor covering technology, finance, and global markets.
                  </p>
                </div>
              </div>

              {/* Related articles */}
              {related.length > 0 && (
                <section className="mt-14">
                  <div className="flex items-center gap-3 mb-6 pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <div className="w-1 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
                    <h2 className="text-xl font-bold">More in {article.category}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {related.map(item => (
                      <BlogCard
                        key={item.slug}
                        title={item.title}
                        category={item.category}
                        author={item.author}
                        readTime={item.readTime || 5}
                        image={item.image}
                        link={articleLink(item)}
                        excerpt={item.excerpt}
                        date={new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      />
                    ))}
                  </div>
                </section>
              )}
            </article>

            {/* ── Sidebar ─────────────────────── */}
            <aside className="hidden lg:block lg:col-span-4 self-start sticky top-24 space-y-8">

              {/* Table of contents */}
              {Array.isArray(article.content) && article.content.length > 0 && (
                <div
                  className="rounded-xl p-5"
                  style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}
                >
                  <h4 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: 'var(--text-muted)' }}>
                    Contents
                  </h4>
                  <TableOfContents content={article.content} />
                </div>
              )}

              {/* Trending */}
              {trending.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <TrendingUp className="w-4 h-4" style={{ color: 'var(--accent)' }} />
                    <h4 className="text-sm font-bold">Trending Now</h4>
                  </div>
                  <div className="space-y-1">
                    {trending.slice(0, 5).map((item, idx) => (
                      <BlogCard
                        key={item.slug || idx}
                        variant="trending"
                        title={item.title}
                        category={item.category}
                        readTime={item.readTime || 5}
                        image={item.image}
                        link={articleLink(item)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

/* ─── Article helpers ───────────────────────── */
const ArticleSkeleton = () => (
  <div style={{ background: 'var(--bg-main)' }}>
    <Navbar />
    <div className="max-w-3xl mx-auto px-5 pt-10 pb-20 space-y-6 animate-pulse">
      <div className="h-3 w-24 rounded" style={{ background: 'var(--bg-soft)' }} />
      <div className="h-10 w-full rounded" style={{ background: 'var(--bg-soft)' }} />
      <div className="h-10 w-4/5 rounded" style={{ background: 'var(--bg-soft)' }} />
      <div className="h-[360px] w-full rounded-xl" style={{ background: 'var(--bg-soft)' }} />
      {[1,2,3,4].map(i => (
        <div key={i} className="h-4 rounded" style={{ background: 'var(--bg-soft)', width: i % 2 ? '100%' : '80%' }} />
      ))}
    </div>
  </div>
);

const ArticleNotFound = () => (
  <div style={{ background: 'var(--bg-main)' }}>
    <Navbar />
    <div className="min-h-[60vh] flex items-center justify-center p-8 text-center">
      <div>
        <p className="text-7xl font-bold mb-4 opacity-10" style={{ color: 'var(--text-primary)' }}>404</p>
        <h1 className="text-2xl font-bold mb-3">Article not found</h1>
        <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          This article may have been moved or deleted.
        </p>
        <Link to="/" className="btn-primary">Back to home</Link>
      </div>
    </div>
  </div>
);

export default ArticleDetail;
