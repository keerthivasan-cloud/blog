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

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    
    const fetchArticle = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/articles/${slug}`);
        setArticle(res.data);
        document.title = `${res.data.title} | NewsForge Intelligence`;
        trackView(res.data._id);
        
        const relRes = await axios.get(`${API_BASE_URL}/articles?category=${res.data.category}`);
        setRelated(relRes.data.filter(a => a._id !== res.data._id).slice(0, 4));
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
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500 selection:bg-primary/10">
      <ReadingProgressBar />
      <Navbar />

      <main className="pt-12 lg:pt-24 pb-40">
        <div className="max-w-[1500px] mx-auto px-6">
          
          <header className="max-w-5xl mx-auto mb-16 text-left">
            <nav className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.4em] mb-10 text-slate-300 dark:text-slate-700">
              <Link to="/" className="hover:text-primary transition-colors no-underline text-inherit">Archive</Link>
              <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
              <Link to={`/${article.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary transition-colors no-underline text-inherit">{article.category}</Link>
              <div className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-800" />
              <span className="text-slate-100 dark:text-slate-800 truncate max-w-[300px]">{article.title}</span>
            </nav>
 
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <div className="inline-flex items-center gap-4 mb-8">
                {isBreaking(article.createdAt) && (
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-500 text-white text-[10px] font-black uppercase tracking-[0.2em] animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.5)]">
                    <Zap className="w-3 h-3 fill-white" /> Breaking
                  </div>
                )}
                <div className="px-5 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[9px] font-black uppercase tracking-[0.4em]">
                  {article.category} Analysis
                </div>
              </div>
              
              <h1 className="text-6xl md:text-[6.5rem] font-black font-['Outfit'] text-slate-900 dark:text-white leading-[0.9] -tracking-[0.05em] mb-10 uppercase">
                {article.title}
              </h1>
 
              <div className="flex flex-wrap items-center justify-between gap-8 py-8 border-y border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-900/10 px-8 rounded-2xl">
                <div className="flex items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-3 pr-8 rounded-[2rem] border border-white/20 dark:border-slate-800/40 shadow-sm transition-all hover:bg-white/60 dark:hover:bg-slate-900/60">
                   <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-base border border-primary/20 shrink-0">
                     {article.author?.[0] || 'V'}
                   </div>
                   <div className="text-left">
                     <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-1">Lead Analyst</p>
                     <p className="text-sm font-black dark:text-white uppercase tracking-widest">{article.author || 'vynexsol Intelligence'}</p>
                   </div>
                </div>
                <div className="flex items-center gap-10 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-[8px] text-slate-200 dark:text-slate-800 font-bold">Published Node</span>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><Calendar className="w-3.5 h-3.5 text-primary" /> {formattedDate}</div>
                  </div>
                  <div className="flex flex-col gap-1 text-left">
                    <span className="text-[8px] text-slate-200 dark:text-slate-800 font-bold">Data Capacity</span>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400"><Clock className="w-3.5 h-3.5 text-primary" /> {article.readTime || 5} MINS</div>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <button onClick={copyLink} className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary transition-all cursor-pointer relative group shadow-sm">
                    {copied ? <CheckCircle2 className="w-4.5 h-4.5 text-green-500" /> : <Copy className="w-4.5 h-4.5" />}
                    <span className="absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[8px] px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Copy Link</span>
                  </button>
                  <button className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary transition-all cursor-pointer shadow-sm"><Share2 className="w-4.5 h-4.5" /></button>
                </div>
              </div>
            </motion.div>
          </header>

          <section className="max-w-[1000px] mx-auto px-0 mb-16">
            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, delay: 0.2 }} className="relative rounded-[3rem] overflow-hidden shadow-2xl h-[300px] lg:h-[500px] border border-slate-100 dark:border-slate-800">
              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 relative">
            <div className="hidden xl:block xl:col-span-1">
              <div className="sticky top-40 flex flex-col items-center gap-6">
                <div className="text-[8px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700 [writing-mode:vertical-lr] rotate-180 mb-4 whitespace-nowrap">Broadcast Insight</div>
                <div className="w-px h-12 bg-slate-100 dark:bg-slate-900 mb-2" />
                <SocialShareBtn icon={<Twitter className="w-4 h-4" />} label="X" color="hover:text-[#1DA1F2]" />
                <SocialShareBtn icon={<Linkedin className="w-4 h-4" />} label="IN" color="hover:text-[#0A66C2]" />
                <SocialShareBtn icon={<LinkIcon className="w-4 h-4" />} label="URI" onClick={copyLink} />
              </div>
            </div>

            <article className="lg:col-span-8 xl:col-span-7 lg:max-w-none text-left">
              <div className="prose-wrapper max-w-[950px]">
                {article.keyInsight && (
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-12 p-8 md:p-10 rounded-[2.5rem] bg-primary/5 border border-primary/20 relative group overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform duration-700"><Quote className="w-20 h-20 text-primary" /></div>
                    <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-6">
                        <Zap className="w-5 h-5 text-primary fill-primary" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Strategic Insight</span>
                      </div>
                      <p className="text-xl md:text-2xl font-black font-lora text-slate-900 dark:text-white leading-[1.4] -tracking-tight uppercase">"{article.keyInsight}"</p>
                    </div>
                  </motion.div>
                )}

                <div className="flex items-center justify-between mb-8 pb-8 border-b border-slate-100 dark:border-slate-900">
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-700">Intelligence Tier v4.2.0</div>
                  <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                    {[
                      { id: 'full', label: 'Full Analysis', icon: <BookOpen className="w-3.5 h-3.5" /> },
                      { id: '30s', label: '30s Mode', icon: <Zap className="w-3.5 h-3.5" /> },
                      { id: 'eli5', label: 'Explain (ELI5)', icon: <HelpCircle className="w-3.5 h-3.5" /> }
                    ].map(mode => (
                      <button 
                        key={mode.id}
                        onClick={() => setContentMode(mode.id)}
                        className={`px-6 py-2.5 rounded-full flex items-center gap-2.5 text-[9px] font-black uppercase tracking-wider transition-all border-none cursor-pointer ${contentMode === mode.id ? 'bg-primary text-white shadow-lg shadow-orange-500/20 translate-y-[-1px]' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'}`}
                      >
                        {mode.icon} {mode.label}
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
                    <motion.div key="eli5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="mb-20 p-10 md:p-14 rounded-[3.5rem] bg-indigo-50/50 dark:bg-indigo-500/5 border border-indigo-100 dark:border-indigo-500/20 relative group">
                      <HelpCircle className="absolute top-10 right-10 w-16 h-16 text-indigo-500/10 group-hover:scale-110 transition-transform duration-1000" />
                      <div className="flex items-center gap-3 mb-8">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20"><HelpCircle className="w-4 h-4 text-white" /></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-500">Conceptual Simplification</span>
                      </div>
                      <p className="text-xl md:text-2xl font-black font-lora text-slate-800 dark:text-white leading-relaxed italic uppercase tracking-tight">{article.eli5}</p>
                    </motion.div>
                  ) : (
                    <motion.div key="full" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <BlockRenderer blocks={article.content} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="mt-20 pt-12 border-t border-slate-100 dark:border-slate-900">
                   <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                      <div className="space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Intelligence Feedback</p>
                         <div className="flex gap-4">
                            {['like', 'insight', 'fire'].map((type) => (
                              <button key={type} onClick={() => axios.post(`${API_BASE_URL}/articles/${article._id}/react`, { type })} className="px-6 py-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 text-slate-400 hover:text-primary transition-all flex items-center gap-3 text-[10px] font-black uppercase tracking-widest cursor-pointer group">
                                {type === 'like' && <CheckCircle className="w-4 h-4" />}
                                {type === 'insight' && <Zap className="w-4 h-4" />}
                                {type === 'fire' && <TrendingUp className="w-4 h-4" />}
                                {type}
                              </button>
                            ))}
                         </div>
                      </div>
                      <div className="p-6 rounded-3xl bg-primary/5 border border-primary/20 text-center md:text-left flex items-center gap-6 group cursor-pointer hover:bg-primary/10 transition-all">
                         <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-orange-500/30 group-hover:rotate-12 transition-transform"><Zap className="w-6 h-6 fill-white" /></div>
                         <div>
                            <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Join Intelligence Hub</p>
                            <p className="text-[9px] font-bold text-primary uppercase tracking-[0.2em] mt-1">Direct via WhatsApp</p>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="mt-40 p-12 lg:p-16 rounded-[4rem] bg-slate-900 text-white relative overflow-hidden">
                <Sparkles className="absolute top-[-10%] right-[-5%] w-60 h-60 text-white/5" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center text-3xl font-black font-['Outfit'] border-4 border-white/10 shrink-0 shadow-2xl">
                    {article.author?.[0] || 'A'}
                  </div>
                  <div className="text-center md:text-left">
                     <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-2 block">Primary Intelligence Catalyst</span>
                     <h4 className="text-2xl font-black font-['Outfit'] mb-4 uppercase tracking-tight">{article.author}</h4>
                     <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] leading-relaxed max-w-xl">Strategic analyst focused on emerging market architectures and technical paradigms.</p>
                  </div>
                </div>
              </div>
            </article>

            <aside className="hidden lg:block lg:col-span-4 self-start sticky top-40">
              <div className="space-y-20">
                <div className="glass p-12 rounded-[3.5rem] border-slate-100/50 dark:border-slate-800/50"><TableOfContents content={article.content} /></div>
                <div className="px-6">
                   <div className="flex items-center gap-3 mb-12">
                      <TrendingUp className="w-5 h-5 text-primary" /><h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white font-['Outfit']">Global Pulse</h4>
                   </div>
                   <div className="space-y-12">
                      {trending.map((item, idx) => (
                        <Link to={`/${item.category.toLowerCase().replace(/\s+/g, '-')}/${item.slug}`} key={item._id} className="block group no-underline text-left">
                          <div className="flex gap-6 items-start">
                             <span className="text-3xl font-black text-slate-100 dark:text-slate-900 font-['Outfit']">0{idx+1}</span>
                             <div>
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 mb-2 block">{item.category}</span>
                                <h5 className="text-lg font-black font-['Outfit'] text-slate-800 dark:text-white group-hover:text-primary transition-colors uppercase">{item.title}</h5>
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
   <div className="min-h-screen bg-white dark:bg-slate-950 px-8 pt-40 flex flex-col items-center gap-12">
      <div className="w-24 h-1 bg-primary/10 rounded-full relative overflow-hidden"><motion.div initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1, repeat: Infinity }} className="absolute inset-0 bg-primary w-1/2" /></div>
      <div className="w-full max-w-4xl space-y-6"><div className="h-20 w-3/4 bg-slate-50 dark:bg-slate-900 rounded-3xl animate-pulse" /><div className="h-8 w-full bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse" /></div>
   </div>
);

const ArticleNotFound = () => (
   <div className="min-h-screen flex items-center justify-center p-8"><div className="text-center font-['Outfit'] uppercase"><h1 className="text-9xl font-black opacity-10">404</h1><Link to="/" className="primary-btn mt-10">Return Home</Link></div></div>
);

export default ArticleDetail;
