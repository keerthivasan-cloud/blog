import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Navbar, Footer, BlogCard } from '../components/Layout';
import { 
  Clock, Calendar, User, ChevronRight, Share2, 
  Twitter, Linkedin, Link as LinkIcon, CheckCircle, 
  ArrowLeft, Zap, ArrowRight, BookOpen, Quote,
  MessageSquare, TrendingUp, Sparkles, 
  Copy, CheckCircle2, ChevronDown, HelpCircle, ThumbsUp, Flame, ThumbsDown
} from 'lucide-react';
import { ReadingProgressBar, TableOfContents, BlockRenderer } from '../components/ArticlePageComponents';
import API_BASE_URL from '../config';

const ArticleDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [contentMode, setContentMode] = useState('full'); // 'full', '30s', 'eli5'
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const fetchTrending = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/articles/trending`);
      setTrending(res.data);
    } catch (err) {
      console.error("Trending fetch failure:", err);
    }
  };

  const trackView = async (id) => {
    try {
      await axios.post(`${API_BASE_URL}/articles/${id}/view`);
    } catch (err) {
      console.error("View tracking failure:", err);
    }
  };

  const updateSEOMetadata = (seo) => {
    if (!seo) return;
    
    // Update Document Title
    document.title = `${seo.title} | NewsForge Terminal`;

    const metaUpdates = [
      { name: 'description', content: seo.description },
      { name: 'keywords', content: seo.keywords },
      { property: 'og:title', content: seo.title },
      { property: 'og:description', content: seo.description },
      { property: 'og:image', content: seo.ogImage },
      { property: 'og:url', content: window.location.href },
      { name: 'twitter:card', content: 'summary_large_image' }
    ];

    metaUpdates.forEach(update => {
      const selector = update.name ? `meta[name="${update.name}"]` : `meta[property="${update.property}"]`;
      let tag = document.querySelector(selector);
      if (!tag) {
        tag = document.createElement('meta');
        if (update.name) tag.setAttribute('name', update.name);
        if (update.property) tag.setAttribute('property', update.property);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', update.content);
    });
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    
    const fetchArticle = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/articles/${slug}`);
        setArticle(res.data);
        updateSEOMetadata(res.data.seo);
        trackView(res.data._id);
        
        const relRes = await axios.get(`${API_BASE_URL}/articles?category=${res.data.category}`);
        setRelated(relRes.data.filter(a => a.slug !== res.data.slug).slice(0, 4));
      } catch (err) {
        console.error("Article acquisition failure:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
    fetchTrending();
  }, [slug]);

  const isBreaking = (date) => {
    const diff = new Date() - new Date(date);
    return diff < (6 * 60 * 60 * 1000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = useMemo(() => {
    if (!article) return '';
    return new Date(article.createdAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, [article]);

  if (loading) return <ArticleSkeleton />;
  if (!article) return <ArticleNotFound />;

  return (
    <div className="min-h-screen transition-colors duration-500 selection:bg-primary/20 relative overflow-hidden" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <div className="mesh-gradient opacity-10" />
      <ReadingProgressBar />
      <Navbar />

      <main className="pt-8 lg:pt-16 pb-20">
        <div className="max-w-[1500px] mx-auto px-6">
          
          <header className="max-w-5xl mx-auto mb-10 text-left">
            <nav className="flex items-center gap-2 text-[8px] font-bold uppercase tracking-[0.3em] mb-6 mono subtitle">
              <Link to="/" className="hover:text-[var(--accent)] transition-colors no-underline text-inherit">Index</Link>
              <div className="w-1 h-1 rounded-full" style={{ background: 'var(--border)' }} />
              <Link to={`/${article.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-[var(--accent)] transition-colors no-underline text-inherit">{article.category}</Link>
              <div className="w-1 h-1 rounded-full" style={{ background: 'var(--border)' }} />
              <span className="truncate max-w-[200px] opacity-40">{article.title}</span>
            </nav>
 
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
              <div className="inline-flex items-center gap-3 mb-6">
                {isBreaking(article.createdAt) && (
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-600 text-white text-[8px] font-bold uppercase tracking-wider animate-pulse shadow-lg shadow-red-600/30">
                    <Zap className="w-2.5 h-2.5 fill-white" /> Live
                  </div>
                )}
                <div className="px-3 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary text-[8px] font-bold uppercase tracking-widest mono">
                  {article.category} Protocol
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-[800] leading-[1.15] tracking-[-0.04em] mb-8 uppercase title">
                {article.title}
              </h1>
 
              <div className="flex flex-wrap items-center justify-between gap-6 py-4 border-y border-border/40 px-6 rounded-xl bg-muted/30">
                <div className="flex items-center gap-3 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md p-2 pr-6 rounded-xl border border-border/40 shadow-sm">
                   <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-xs border border-primary/20 shrink-0 uppercase">
                     {article.author?.[0] || 'V'}
                   </div>
                   <div className="text-left">
                     <p className="text-[7px] font-bold uppercase tracking-widest text-primary mb-0.5">Contributor</p>
                     <p className="text-xs font-black dark:text-white uppercase tracking-wider leading-none">{article.author || 'NewsForge Intelligence'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-8 text-[7px] font-bold uppercase tracking-widest text-muted-foreground mono">
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="opacity-40">Timestamp</span>
                    <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3 text-primary" /> {formattedDate}</div>
                  </div>
                  <div className="flex flex-col gap-0.5 text-left">
                    <span className="opacity-40">Capacity</span>
                    <div className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-primary" /> {article.readTime || 5} MINS</div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyLink} className="p-2.5 rounded-lg bg-background border border-border/40 text-muted-foreground hover:text-primary transition-all cursor-pointer relative group">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button className="p-2.5 rounded-lg bg-background border border-border/40 text-muted-foreground hover:text-primary transition-all cursor-pointer"><Share2 className="w-4 h-4" /></button>
                </div>
              </div>
            </motion.div>
          </header>

          <section className="max-w-[1000px] mx-auto mb-12">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }} className="relative rounded-2xl overflow-hidden shadow-2xl h-[300px] lg:h-[450px] border border-border/40 bg-muted">
              <img 
                src={article.image} 
                alt={article.title} 
                className="w-full h-full object-cover" 
                loading="lazy"
                onLoad={(e) => e.target.classList.add('opacity-100')}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
            <div className="hidden xl:block xl:col-span-1">
              <div className="sticky top-40 flex flex-col items-center gap-6">
                <div className="text-[8px] font-black uppercase tracking-[0.4em] [writing-mode:vertical-lr] rotate-180 mb-4 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>Broadcast Insight</div>
                <div className="w-px h-12 mb-2" style={{ background: 'var(--border)' }} />
                <SocialShareBtn icon={<Twitter className="w-4 h-4" />} label="X" color="hover:text-[#1DA1F2]" />
                <SocialShareBtn icon={<Linkedin className="w-4 h-4" />} label="IN" color="hover:text-[#0A66C2]" />
                <SocialShareBtn icon={<LinkIcon className="w-4 h-4" />} label="URI" onClick={copyLink} />
              </div>
            </div>

            <article className="lg:col-span-8 xl:col-span-7 lg:max-w-none text-left">
              <div className="prose-wrapper max-w-[950px]">
                {article.keyInsight && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    whileInView={{ opacity: 1, scale: 1 }} 
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }} 
                    className="mb-12 p-8 md:p-12 rounded-[3rem] relative group overflow-hidden"
                    style={{ background: 'var(--accent-soft)', border: '1px solid var(--accent-soft)' }}
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 group-hover:rotate-12 transition-transform duration-1000"><Quote className="w-24 h-24" style={{ color: 'var(--accent)' }} /></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-8">
                        <Zap className="w-5 h-5 fill-current" style={{ color: 'var(--accent)' }} />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--accent)' }}>Strategic Insight</span>
                      </div>
                      <p className="text-xl md:text-2xl font-black leading-tight -tracking-tight uppercase title">"{article.keyInsight}"</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-between mb-8 pb-8 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="text-[10px] font-black uppercase tracking-widest opacity-40 shrink-0">Intelligence Tier v4.2.0</div>
                  <div className="flex p-1 rounded-lg border shadow-sm relative" style={{ background: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                    {[
                      { id: 'full', label: 'Nodes', icon: <BookOpen className="w-3 h-3" /> },
                      { id: '30s', label: 'Sync', icon: <Zap className="w-3 h-3" /> },
                      { id: 'eli5', label: 'Brief', icon: <HelpCircle className="w-3 h-3" /> }
                    ].map(mode => (
                      <button 
                        key={mode.id}
                        onClick={() => setContentMode(mode.id)}
                        className={`px-4 py-2 rounded-md flex items-center gap-2 text-[8px] font-bold uppercase tracking-wider transition-all border-none cursor-pointer relative z-10 ${contentMode === mode.id ? 'text-white' : 'bg-transparent subtitle hover:text-[var(--text-primary)]'}`}
                      >
                        {mode.icon} {mode.label}
                        {contentMode === mode.id && (
                          <motion.div 
                            layoutId="activeMode"
                            className="absolute inset-0 rounded-md -z-10 shadow-lg shadow-orange-500/20"
                            style={{ background: 'var(--accent)' }}
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {contentMode === '30s' && article.bullets?.length > 0 ? (
                    <motion.div key="30s" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6 mb-20">
                      {article.bullets.map((bullet, idx) => (
                        <div key={idx} className="flex gap-6 items-start">
                           <div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center shrink-0 text-primary font-black font-lora">0{idx+1}</div>
                           <p className="text-lg font-black font-lora text-slate-800 dark:text-slate-200 leading-relaxed uppercase tracking-tight pt-1">{bullet}</p>
                        </div>
                      ))}
                    </motion.div>
                  ) : contentMode === 'eli5' && article.eli5 ? (
                    <motion.div key="eli5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mb-20 p-10 md:p-14 rounded-[3.5rem] border relative group" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <HelpCircle className="absolute top-10 right-10 w-16 h-16 opacity-10 group-hover:scale-110 transition-transform duration-1000" />
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20" style={{ background: 'var(--accent)' }}><HelpCircle className="w-4 h-4 text-white" /></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--accent)' }}>Conceptual Simplification</span>
                      </div>
                      <p className="text-xl font-bold font-lora leading-relaxed italic uppercase tracking-tight title">{article.eli5}</p>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="full" 
                      initial={{ opacity: 0, x: 20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      exit={{ opacity: 0, x: -20 }} 
                      className="prose-system"
                    >
                      <BlockRenderer blocks={article.blocks} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-20 pt-12 border-t" style={{ borderColor: 'var(--border)' }}>
                   <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--text-muted)' }}>Intelligence Feedback</p>
                         <div className="flex gap-4">
                            {['like', 'insight', 'fire'].map((type) => (
                              <button key={type} onClick={() => axios.post(`${API_BASE_URL}/articles/${article._id}/react`, { type })} className="px-6 py-3 rounded-2xl border transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest cursor-pointer group subtitle hover:text-[var(--text-primary)]" style={{ background: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                                {type === 'like' && <CheckCircle className="w-4 h-4" />}
                                {type === 'insight' && <Zap className="w-4 h-4" />}
                                {type === 'fire' && <TrendingUp className="w-4 h-4" />}
                                {type}
                              </button>
                            ))}
                         </div>
                      </div>
                      <div className="p-6 rounded-3xl border text-center md:text-left flex items-center gap-6 group cursor-pointer hover:bg-opacity-80 transition-all shadow-xl" style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-soft)' }}>
                         <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:rotate-12 transition-transform" style={{ background: 'var(--accent)' }}><Zap className="w-6 h-6 fill-white" /></div>
                         <div>
                            <p className="text-xs font-black uppercase tracking-tight title">Join Intelligence Hub</p>
                            <p className="text-[9px] font-bold uppercase tracking-[0.2em] mt-1" style={{ color: 'var(--accent)' }}>Direct via WhatsApp</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="mt-40 p-12 lg:p-16 rounded-[4rem] relative overflow-hidden text-white" style={{ background: 'var(--accent)' }}>
                <Sparkles className="absolute top-[-10%] right-[-5%] w-60 h-60 text-white/5" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center text-3xl font-black border-4 border-white/10 shrink-0 shadow-2xl" style={{ background: 'var(--bg-main)', color: 'var(--accent)' }}>
                    {article.author?.[0] || 'A'}
                  </div>
                  <div className="text-center md:text-left">
                     <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/60 mb-2 block">Primary Intelligence Catalyst</span>
                     <h4 className="text-2xl font-black mb-4 uppercase tracking-tight">{article.author}</h4>
                     <p className="text-white/80 font-bold uppercase tracking-[0.2em] text-[10px] leading-relaxed max-w-xl">Strategic analyst focused on emerging market architectures and technical paradigms.</p>
                  </div>
                </div>
              </div>
            </article>

            <aside className="hidden lg:block lg:col-span-4 self-start sticky top-40">
              <div className="space-y-20">
                <div className="card p-12 rounded-[3.5rem]"><TableOfContents content={article.blocks || []} /></div>
                <div className="px-6">
                   <div className="flex items-center gap-3 mb-12">
                      <TrendingUp className="w-5 h-5" style={{ color: 'var(--accent)' }} /><h4 className="text-sm font-black uppercase tracking-[0.2em] title">Global Pulse</h4>
                   </div>
                   <div className="space-y-12">
                      {trending.map((item, idx) => (
                        <Link to={`/${(item.category || 'intelligence').toLowerCase().replace(/\s+/g, '-')}/${item.slug}`} key={item._id || idx} className="block group no-underline text-left">
                          <div className="flex gap-6 items-start">
                             <span className="text-3xl font-black opacity-10">0{idx+1}</span>
                             <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] mb-2 block" style={{ color: 'var(--accent)' }}>{item.category}</span>
                                <h5 className="text-lg font-black group-hover:text-[var(--accent)] transition-colors uppercase title">{item.title}</h5>
                             </div>
                          </div>
                        </Link>
                      ))}
                   </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

const SocialShareBtn = ({ icon, label, onClick, color }) => (
  <button onClick={onClick} className={`p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-300 transition-all cursor-pointer group shadow-sm flex items-center justify-center ${color}`}>
    {icon}
  </button>
);

const ArticleSkeleton = () => (
   <div className="min-h-screen px-8 pt-40 flex flex-col items-center gap-12" style={{ background: 'var(--bg-main)' }}>
      <div className="w-24 h-1.5 rounded-full relative overflow-hidden bg-muted">
        <motion.div 
          initial={{ x: "-100%" }} 
          animate={{ x: "100%" }} 
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} 
          className="absolute inset-0 w-1/2" 
          style={{ background: 'var(--accent)' }} 
        />
      </div>
      <div className="w-full max-w-4xl space-y-12">
        <div className="space-y-4">
          <div className="h-20 w-3/4 rounded-3xl animate-pulse bg-muted" />
          <div className="h-20 w-1/2 rounded-3xl animate-pulse bg-muted opacity-50" />
        </div>
        <div className="space-y-6">
          <div className="h-8 w-full rounded-2xl animate-pulse bg-muted opacity-40" />
          <div className="h-8 w-full rounded-2xl animate-pulse bg-muted opacity-30" />
          <div className="h-8 w-2/3 rounded-2xl animate-pulse bg-muted opacity-20" />
        </div>
      </div>
   </div>
);

const ArticleNotFound = () => (
   <div className="min-h-screen flex items-center justify-center p-8"><div className="text-center font-['Outfit'] uppercase"><h1 className="text-9xl font-black opacity-10">404</h1><Link to="/" className="primary-btn mt-10">Return Home</Link></div></div>
);

export default ArticleDetail;
