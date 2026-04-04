import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar, Footer, BlogCard } from '../components/Layout';
import { 
  Calendar, User, Clock, ArrowLeft, Share2, Bookmark, 
  MessageSquare, ChevronRight, TrendingUp, Sparkles, 
  Zap, Copy, CheckCircle2, ChevronDown
} from 'lucide-react';
import { ReadingProgressBar, TableOfContents, BlockRenderer } from '../components/ArticlePageComponents';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    
    // Fetch article by slug
    axios.get(`http://localhost:5000/api/articles/${slug}`)
      .then(res => {
        setArticle(res.data);
        // SEO: Set Document Title
        document.title = `${res.data.title} | NewsForge Intelligence`;
        
        // Fetch related articles
        const relatedReq = axios.get(`http://localhost:5000/api/articles?category=${res.data.category}&status=published`);
        // Fetch trending articles (just latest published for now)
        const trendingReq = axios.get(`http://localhost:5000/api/articles?status=published`);
        
        return Promise.all([relatedReq, trendingReq]);
      })
      .then(([relatedRes, trendingRes]) => {
        setRelated(relatedRes.data.filter(a => a.slug !== slug).slice(0, 3));
        setTrending(trendingRes.data.slice(0, 5));
      })
      .catch(err => {
        console.error("Link Failure: Terminal Connection Error", err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

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

      <main className="pt-20 lg:pt-40 pb-60">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* 1. HEADER META SECTION */}
          <header className="max-w-4xl mx-auto mb-20 text-left">
            <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] mb-12 text-slate-300 dark:text-slate-600">
              <Link to="/" className="hover:text-primary transition-colors no-underline text-inherit">Home</Link>
              <ChevronRight className="w-3 h-3" />
              <Link to={`/${article.category.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary transition-colors no-underline text-inherit">{article.category}</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-100 dark:text-slate-800 truncate max-w-[200px]">{article.title}</span>
            </nav>

            <motion.div
               initial={{ opacity: 0, y: 30 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-sm">
                <Zap className="w-3.5 h-3.5 fill-primary" /> {article.category} Analysis
              </div>
              
              <h1 className="text-5xl md:text-8xl font-black font-['Outfit'] text-slate-900 dark:text-white leading-[0.9] -tracking-tight mb-12 uppercase drop-shadow-sm">
                {article.title}
              </h1>

              <p className="text-2xl md:text-3xl text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wide leading-relaxed mb-16 max-w-3xl">
                {article.excerpt}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-8 py-8 border-y border-slate-100 dark:border-slate-900">
                <div className="flex items-center gap-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md p-3 pr-8 rounded-[2rem] border border-white/20 dark:border-slate-800/40 shadow-sm transition-all hover:bg-white/60 dark:hover:bg-slate-900/60">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center font-black text-primary text-base border border-primary/20 shrink-0">
                    {article.author?.[0] || 'A'}
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] uppercase font-black tracking-[0.3em] text-slate-400 mb-0.5">Author Access</div>
                    <div className="text-sm font-black font-['Outfit'] text-slate-900 dark:text-white uppercase tracking-tight">{article.author || "NewsForge Analyst"}</div>
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

          {/* 2. HERO IMAGE */}
          <section className="max-w-7xl mx-auto px-0 mb-32">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1.2, delay: 0.4 }}
               className="relative rounded-[4rem] overflow-hidden shadow-[0_80px_120px_-40px_rgba(0,0,0,0.3)] dark:shadow-none h-[500px] lg:h-[800px]"
            >
              <img src={article.image} alt={article.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
            </motion.div>
          </section>

          {/* 3. MAIN CONTENT GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
            
            {/* CONTENT COLUMN */}
            <article className="lg:col-span-8 lg:max-w-[800px] mx-auto text-left">
              <div className="prose-wrapper">
                <BlockRenderer blocks={article.content} />
              </div>

              {/* 5. AUTHOR SECTION */}
              <div className="mt-40 p-12 lg:p-16 rounded-[4rem] bg-slate-900 text-white relative overflow-hidden">
                <Sparkles className="absolute top-[-10%] right-[-5%] w-60 h-60 text-white/5" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-primary to-orange-700 flex items-center justify-center text-3xl font-black font-['Outfit'] border-4 border-white/10 shrink-0 shadow-2xl">
                    {article.author?.[0] || 'A'}
                  </div>
                  <div className="text-center md:text-left">
                     <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary mb-2 block">Primary Intelligence Catalyst</span>
                     <h4 className="text-2xl font-black font-['Outfit'] mb-4 uppercase tracking-tight">{article.author || "NewsForge Analyst"}</h4>
                     <p className="text-white/40 font-bold uppercase tracking-[0.2em] text-[10px] leading-relaxed max-w-xl">
                       Strategic analyst focused on emerging market architectures and technical paradigms. Exploring the nexus of data, finance, and global infrastructure.
                     </p>
                  </div>
                </div>
              </div>

              {/* 6. CTA SECTION */}
              <div className="mt-20 p-12 lg:p-20 rounded-[4.5rem] border-2 border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/10 text-center">
                 <h3 className="text-4xl font-black font-['Outfit'] dark:text-white uppercase mb-4">Stay Synced</h3>
                 <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest mb-12">Technical briefs delivered to your terminal every Tuesday.</p>
                 <div className="flex flex-col md:flex-row gap-4 max-w-xl mx-auto">
                   <input placeholder="Enter nexus email" className="flex-1 px-8 py-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-bold text-xs uppercase tracking-widest outline-none focus:ring-4 focus:ring-primary/20 transition-all" />
                   <button className="primary-btn px-12 py-5 rounded-2xl shadow-xl">Secure Access</button>
                 </div>
              </div>
            </article>

            {/* STICKY SIDEBAR */}
            <aside className="hidden lg:block lg:col-span-4 self-start sticky top-40">
              <div className="space-y-20">
                
                {/* 4. TABLE OF CONTENTS */}
                <div className="glass p-12 rounded-[3.5rem] border-slate-100/50 dark:border-slate-800/50 shadow-2xl shadow-slate-200/20 dark:shadow-none">
                  <TableOfContents content={article.content} />
                </div>

                {/* TRENDING BAR */}
                <div className="px-6">
                   <div className="flex items-center gap-3 mb-12">
                      <TrendingUp className="w-5 h-5 text-primary" />
                      <h4 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white font-['Outfit']">Global Pulse</h4>
                   </div>
                   <div className="space-y-12">
                      {trending.map((item, idx) => (
                        <Link to={`/${item.category.toLowerCase().replace(/\s+/g, '-')}/${item.slug}`} key={item._id} className="block group no-underline text-left">
                          <div className="flex gap-6 items-start">
                             <span className="text-3xl font-black text-slate-100 dark:text-slate-900 font-['Outfit'] leading-none">0{idx+1}</span>
                             <div className="pt-0.5">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary/60 mb-2 block">{item.category}</span>
                                <h5 className="text-lg font-black font-['Outfit'] text-slate-800 dark:text-white leading-[1.3] group-hover:text-primary transition-colors uppercase">
                                  {item.title}
                                </h5>
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

      {/* 4. INTERNAL LINKING SECTION */}
      {related.length > 0 && (
         <section className="bg-slate-50/50 dark:bg-slate-900/20 py-40 border-t border-slate-100 dark:border-slate-900">
            <div className="max-w-7xl mx-auto px-6">
               <div className="flex items-center justify-between mb-20 px-4">
                  <div className="text-left">
                    <h2 className="text-5xl font-black font-['Outfit'] text-slate-950 dark:text-white tracking-tighter uppercase leading-none">Logical Continuum</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.5em] mt-4">Intersecting insights in {article.category} segment</p>
                  </div>
                  <Link to={`/${article.category.toLowerCase().replace(/\s+/g, '-')}`} className="px-8 py-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-primary hover:border-primary/30 transition-all no-underline shadow-sm bg-white dark:bg-slate-900">
                    Explore Index
                  </Link>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {related.map((item, idx) => (
                    <motion.div 
                       key={item._id}
                       initial={{ opacity: 0, y: 30 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: idx * 0.1 }}
                    >
                      <BlogCard 
                        {...item}
                        author={item.author || "NewsForge Analyst"}
                        date={new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        link={`/${item.category.toLowerCase().replace(/\s+/g, '-')}/${item.slug}`}
                      />
                    </motion.div>
                  ))}
               </div>
            </div>
         </section>
      )}

      <Footer />
    </div>
  );
};

const ArticleSkeleton = () => (
   <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <div className="max-w-4xl mx-auto px-8 pt-40 flex flex-col items-center gap-12">
         <div className="w-16 h-1 w-24 bg-orange-500/10 rounded-full overflow-hidden relative border border-orange-500/5">
            <motion.div 
               initial={{ x: "-100%" }} 
               animate={{ x: "100%" }} 
               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 bg-primary w-1/2"
            />
         </div>
         <div className="w-full space-y-6">
            <div className="h-20 w-3/4 bg-slate-50 dark:bg-slate-900 rounded-3xl animate-pulse" />
            <div className="h-8 w-full bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse" />
            <div className="h-8 w-1/2 bg-slate-50 dark:bg-slate-900 rounded-2xl animate-pulse" />
         </div>
         <div className="w-full h-[600px] bg-slate-50 dark:bg-slate-900 rounded-[4rem] animate-pulse mt-20" />
      </div>
   </div>
);

const ArticleNotFound = () => (
   <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-8">
      <div className="glass p-20 rounded-[4rem] text-center max-w-xl">
         <h1 className="text-[12rem] font-black font-['Outfit'] opacity-5 text-slate-400 leading-none mb-10">404</h1>
         <h2 className="text-3xl font-black font-['Outfit'] text-slate-800 dark:text-white uppercase mb-6">Archive Missing</h2>
         <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest leading-loose mb-12">This insight node has been de-indexed or moved to a restricted partition.</p>
         <Link to="/" className="primary-btn inline-block no-underline">Return Home</Link>
      </div>
   </div>
);

export default ArticleDetail;
