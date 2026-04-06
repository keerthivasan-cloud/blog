import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Navbar, Footer, BlogCard } from '../components/Layout';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';

const CategoryPage = ({ category, title, description }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`${API_BASE_URL}/articles?category=${category}&status=published`)
      .then(res => setArticles(res.data))
      .catch(err => console.error("Failed to fetch category articles:", err))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="max-w-[1500px] mx-auto px-8 pt-24 pb-40">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="mb-16 text-left max-w-5xl"
        >
          <Link to="/" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors mb-12 group no-underline text-[9px] font-black uppercase tracking-[0.4em] leading-none">
             <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" /> System Index
          </Link>
 
          <div className="w-12 h-1 mb-10 rounded-full shadow-lg shadow-orange-500/20" style={{ background: 'var(--accent)' }} />
          <h1 className="text-6xl md:text-8xl font-black mt-4 mb-8 -tracking-tighter uppercase leading-[0.9] title">{title}</h1>
          <p className="text-xl md:text-2xl font-medium italic leading-relaxed max-w-4xl border-l-4 pl-8 subtitle" style={{ borderColor: 'var(--border)' }}>{description}</p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-6">
            <Loader2 className="w-12 h-12 animate-spin text-primary opacity-20" />
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.5em] ml-2">Mapping {category} Node...</p>
          </div>
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {articles.map((item, idx) => (
              <motion.div 
                key={item._id || item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <BlogCard 
                  title={item.title}
                  category={item.category}
                  author={item.author || "NewsForge Analyst"}
                  date={new Date(item.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  readTime={item.readTime || 5}
                  image={item.image || "https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&q=80&w=2070"}
                  link={`/${item.category.toLowerCase().replace(/\s+/g, '-')}/${item.slug}`}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card p-20 md:p-32 rounded-[5rem] text-center max-w-4xl mx-auto relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-20 opacity-[0.03] rotate-12"><Loader2 className="w-96 h-96 animate-spin-slow" /></div>
            <div className="relative z-10">
               <h3 className="text-4xl md:text-6xl font-black mb-8 uppercase tracking-tighter leading-none title">Active Coverage <br /><span className="gradient-text">Pending</span></h3>
               <p className="font-bold uppercase text-[12px] tracking-[0.4em] leading-loose max-w-lg mx-auto mb-16 subtitle">The "{title}" intelligence node is currently being recalibrated. Editorial synchronization is scheduled for the next market cycle.</p>
               <Link to="/" className="btn-primary py-6 px-16 text-[11px] uppercase tracking-[0.5em] rounded-full shadow-2xl inline-block no-underline">Return to Nexus</Link>
            </div>
          </motion.div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
