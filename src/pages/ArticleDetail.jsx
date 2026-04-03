import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Navbar, Footer, BlogCard } from '../components/Layout';
import { Calendar, User, Clock, ArrowLeft, Share2, Bookmark, Loader2, MessageSquare, Plus } from 'lucide-react';

const ArticleDetail = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/articles/${slug}`)
      .then(res => {
        setArticle(res.data);
        return axios.get(`http://localhost:5000/api/articles?category=${res.data.category}&status=published`);
      })
      .then(res => {
        const others = res.data.filter(a => a.slug !== slug).slice(0, 3);
        setRelated(others);
      })
      .catch(err => {
        console.error("Failed to sync article terminal:", err);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-60 gap-8">
          <div className="w-16 h-1 w-20 bg-orange-500/10 rounded-full overflow-hidden relative border border-orange-500/5">
            <motion.div 
               initial={{ x: "-100%" }} 
               animate={{ x: "100%" }} 
               transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 bg-primary w-1/2"
            />
          </div>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.6em]">Decoding Insight...</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 text-slate-900 transition-colors duration-500">
        <div className="text-center p-20 max-w-lg mx-auto glass rounded-[3rem]">
          <h1 className="text-9xl font-black mb-4 font-['Outfit'] opacity-5 text-slate-400">404</h1>
          <p className="text-xl text-slate-500 mb-12 font-bold font-['Outfit']">This entry has been archived or doesn't exist in the current network scope.</p>
          <Link to="/" className="primary-btn no-underline">Terminal Home</Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(article.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      <Navbar />
      <main className="max-w-4xl mx-auto px-8 pt-40 pb-60">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-12 group no-underline text-xs font-black uppercase tracking-widest">
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> Repository Index
          </Link>

          <span className="px-5 py-2.5 rounded-full bg-orange-50/50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-[#f97316] mb-10 inline-block shadow-sm">
            {article.category}
          </span>
          
          <h1 className="text-5xl md:text-8xl font-black mt-4 mb-14 leading-[0.95] font-['Outfit'] text-slate-900 dark:text-white -tracking-tight text-left">
            {article.title}
          </h1>
          
          <div className="flex flex-wrap items-center justify-between gap-10 mb-20 border-y border-slate-100 dark:border-slate-800 py-12">
            <div className="flex items-center gap-5 text-left">
               <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-black text-slate-400 font-['Outfit'] text-xl">
                 {article.author ? article.author.substring(0, 1).toUpperCase() : 'N'}
               </div>
               <div className="text-sm">
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Author</div>
                  <div className="font-black text-slate-900 dark:text-white font-['Outfit'] text-xl tracking-tight leading-none">{article.author || "NewsForge Analyst"}</div>
               </div>
            </div>
            <div className="flex items-center gap-12 text-slate-400 text-[10px] uppercase tracking-widest font-black">
               <div className="flex flex-col gap-2 text-left">
                  <span className="text-[8px] text-slate-300 dark:text-slate-700">Timestamp</span>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> {formattedDate}</div>
               </div>
               <div className="flex flex-col gap-2 text-left">
                  <span className="text-[8px] text-slate-300 dark:text-slate-700">Read Time</span>
                  <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> {article.readTime || 5} Min</div>
               </div>
            </div>
            <div className="flex gap-4">
              <button className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl text-slate-400 hover:bg-primary/10 hover:text-primary transition-all border-none cursor-pointer"><Share2 className="w-4 h-4" /></button>
              <button className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-primary/10 hover:text-primary transition-all border-none cursor-pointer"><Bookmark className="w-4 h-4" /></button>
            </div>
          </div>

          <p className="text-3xl text-slate-500 dark:text-slate-400 font-medium italic mb-20 leading-relaxed border-l-[6px] border-primary pl-10 py-4 font-['Outfit'] opacity-80 text-left">
            {article.excerpt || "Decrypting the structural shifts in the global economy and technical landscape through the NewsForge perspective."}
          </p>

          <div className="relative group mb-32 rounded-[4rem] overflow-hidden shadow-[0_60px_100px_-30px_rgba(0,0,0,0.25)] dark:shadow-none">
             <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30 z-10" />
             <img
               src={article.image || "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=2070"}
               alt={article.title}
               className="w-full h-[600px] object-cover transition-transform duration-1000 group-hover:scale-105"
             />
          </div>

          {/* Premium Article Typography */}
          <div 
            className="prose-container max-w-none text-slate-600 dark:text-slate-400 leading-[2] text-2xl whitespace-pre-wrap font-medium text-left"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          <div className="mt-40 pt-20 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-10">
             <div className="flex items-center gap-3">
                <button className="primary-btn px-8 py-4 text-sm flex items-center gap-2 no-underline">
                   <Plus className="w-4 h-4" /> Follow Insight
                </button>
             </div>
             <div className="flex items-center gap-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discuss Content</span>
                <button className="flex items-center justify-center p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-primary transition-colors border-none cursor-pointer">
                   <MessageSquare className="w-6 h-6" />
                </button>
             </div>
          </div>
        </motion.div>
      </main>

      {/* RELATED ARTICLES SECTION */}
      {related.length > 0 && (
         <section className="bg-slate-50/50 dark:bg-slate-900/10 py-40 border-t border-slate-100 dark:border-slate-900">
            <div className="max-w-7xl mx-auto px-8">
               <div className="flex items-center justify-between mb-16 px-4">
                  <div className="text-left">
                    <h2 className="text-4xl font-black font-['Outfit'] text-slate-900 dark:text-white tracking-tight">More Perspectives</h2>
                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 ml-1">Continuing the {article.category} narrative</p>
                  </div>
                  <Link to={`/${article.category.toLowerCase().replace(/\s+/g, '-')}`} className="px-6 py-3 rounded-full border border-slate-200 dark:border-slate-800 text-slate-400 font-black text-xs hover:text-primary hover:border-primary/20 transition-all no-underline uppercase tracking-widest shadow-sm bg-white dark:bg-slate-900">
                    Explore Index
                  </Link>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                  {related.map((item, idx) => (
                    <motion.div 
                       key={item._id}
                       initial={{ opacity: 0, y: 30 }}
                       whileInView={{ opacity: 1, y: 0 }}
                       transition={{ delay: idx * 0.1 }}
                    >
                      <BlogCard 
                        title={item.title}
                        category={item.category}
                        author={item.author || "NewsForge Analyst"}
                        date={new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        readTime={item.readTime || 5}
                        image={item.image || "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=2070"}
                        link={`/${item.category.toLowerCase().replace(/\s+/g, '-')}/${item.slug}`}
                      />
                    </motion.div>
                  ))}
               </div>
            </div>
         </section>
      )}

      <Footer />
      
      <style>{`
         .prose-container p { margin-bottom: 2.5rem; }
         .prose-container h2, .prose-container h3 { 
            font-family: 'Outfit', sans-serif; 
            margin-top: 4rem; 
            margin-bottom: 1.5rem; 
            font-weight: 800;
            letter-spacing: -0.02em;
         }
         .dark .prose-container h2, .dark .prose-container h3 { color: #f8fafc; }
         .prose-container h2 { font-size: 2.5rem; line-height: 1.1; color: #0f172a; }
         .prose-container blockquote {
            padding: 2rem 3rem;
            margin: 4rem 0;
            background: #f8fafc;
            border-left: 8px solid #f97316;
            border-radius: 0 2rem 2rem 0;
            font-style: italic;
            font-size: 1.8rem;
            color: #64748b;
         }
         .dark .prose-container blockquote { background: #0f172a; color: #94a3b8; }
         .prose-container img {
            border-radius: 2.5rem;
            margin: 4rem 0;
            box-shadow: 0 20px 50px -10px rgba(0,0,0,0.1);
         }
      `}</style>
    </div>
  );
};

export default ArticleDetail;
