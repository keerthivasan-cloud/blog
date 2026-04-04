import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { Navbar, Footer, BlogCard } from '../components/Layout';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const CategoryPage = ({ category, title, description }) => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:5000/api/articles?category=${category}&status=published`)
      .then(res => setArticles(res.data))
      .catch(err => console.error("Failed to fetch category articles:", err))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <div className="min-h-screen bg-slate-50/30 dark:bg-slate-950 transition-colors duration-500">
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
 
          <div className="w-12 h-1 bg-[#f97316] mb-10 rounded-full shadow-lg shadow-orange-500/20" />
          <h1 className="text-6xl md:text-8xl font-black mt-4 mb-8 font-['Outfit'] -tracking-tighter text-slate-900 dark:text-white uppercase leading-[0.9]">{title}</h1>
          <p className="text-xl md:text-2xl text-slate-400 dark:text-slate-500 font-medium font-lora italic leading-relaxed max-w-4xl border-l-4 border-slate-100 dark:border-slate-900 pl-8">{description}</p>
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
          <div className="glass p-24 rounded-[4rem] text-center border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-2xl max-w-2xl mx-auto">
            <h3 className="text-3xl font-black mb-6 font-['Outfit'] dark:text-white uppercase tracking-tight">Active Coverage Pending</h3>
            <p className="text-slate-500 font-bold uppercase text-[11px] tracking-widest leading-loose">Insights for "{title}" are currently in the editorial terminal. Checking synchronization status...</p>
            <Link to="/" className="primary-btn mt-12 py-5 px-10 text-[10px] uppercase tracking-widest">Return Home</Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default CategoryPage;
