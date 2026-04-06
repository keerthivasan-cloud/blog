import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, ArrowRight, Sparkles, Zap, Newspaper, Star, CheckCircle, Clock } from 'lucide-react';
import axios from 'axios';
import { Navbar, Footer, BlogCard } from '../components/Layout';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';

const SkeletonCard = () => (
  <div className="card p-6 h-[400px] animate-pulse">
    <div className="aspect-[16/10] w-full bg-slate-200 dark:bg-slate-800 rounded-xl mb-6 opacity-20" />
    <div className="h-4 w-1/4 bg-slate-200 dark:bg-slate-800 rounded mb-4 opacity-20" />
    <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded mb-4 opacity-20" />
    <div className="h-8 w-2/3 bg-slate-200 dark:bg-slate-800 rounded opacity-20" />
  </div>
);

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [trendingTags, setTrendingTags] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeTag, setActiveTag] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (activeCategory !== "All") params.append("category", activeCategory);
    if (activeTag) params.append("tag", activeTag);

    axios.get(`${API_BASE_URL}/articles?${params.toString()}`)
      .then(res => {
        setArticles(res.data);
      })
      .catch(err => console.error("Nexus Intelligence Failure:", err))
      .finally(() => setLoading(false));
  }, [activeCategory, activeTag]);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/articles/trending-tags`)
      .then(res => setTrendingTags(res.data))
      .catch(err => console.error("Tag synchronization failure:", err));
  }, []);

  const categories = [
    { name: "Tech", icon: Zap },
    { name: "Business", icon: Newspaper },
    { name: "Finance", icon: TrendingUp },
    { name: "Markets", icon: Star },
    { name: "Commodities", icon: CheckCircle }
  ];

  const filteredArticles = activeCategory === "All" 
    ? articles 
    : articles.filter(a => a.category === activeCategory);

  const featured = filteredArticles[0] || null;
  const trendingList = articles.slice(1, 6);
  const latestGrid = filteredArticles.slice(1, 50);

  const SectionHeader = ({ title, icon: Icon, href, subtitle }) => (
    <div className="flex flex-col mb-16 text-left">
      <div className="flex items-center gap-4 mb-3">
        {Icon && <Icon className="w-5 h-5 text-orange-500" />}
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-orange-500/80">Analysis Node</span>
      </div>
      <div className="flex items-end justify-between gap-8">
         <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-[-0.05em]">{title}</h2>
            {subtitle && <p className="text-sm font-medium text-[#64748B] mt-2 max-w-xl">{subtitle}</p>}
         </div>
         {href && (
           <Link to={href} className="text-[10px] font-black uppercase tracking-[0.3em] hover:text-orange-500 transition-all flex items-center gap-3 no-underline py-2 border-b-2 border-white/5 hover:border-orange-500/50" style={{ color: 'var(--text-muted)' }}>
             Explore All <ArrowRight className="w-4 h-4" />
           </Link>
         )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen transition-colors duration-700 selection:bg-orange-500/30 relative overflow-hidden" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />

      {/* HERO COMMAND CENTER */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-20 items-stretch">
            
            {/* Main Hero Column */}
            <div className="lg:col-span-8 flex flex-col justify-center space-y-10 animate-fade-in text-left">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-orange-500/20 text-[10px] font-black uppercase tracking-[0.4em] bg-orange-500/5 text-orange-500">
                <Zap className="w-4 h-4 fill-current" /> NewsForge Intelligence Terminal
              </div>
              <h1 className="text-7xl md:text-9xl tracking-[-0.06em] leading-[0.85] font-black uppercase title">
                Intelligence <br /><span className="gradient-text">Terminal</span>.
              </h1>
              <p className="text-xl md:text-2xl font-medium leading-relaxed max-w-2xl text-[#94A3B8]">
                Professional-grade technical journalism for the modern architect of digital and financial systems. High-density nodes, synthesized daily.
              </p>
              
              <div className="flex flex-wrap items-center gap-6 pt-6">
                <button 
                  onClick={() => document.getElementById('latest-feed')?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary px-12 py-6 text-xs"
                >
                  Read Latest Stories
                </button>
                <button 
                  onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-10 py-6 rounded-full border border-white/10 hover:border-orange-500 font-black uppercase text-xs tracking-[0.2em] transition-all bg-white/5 flex items-center gap-3 hover:bg-orange-600 hover:text-white group cursor-pointer"
                >
                   Explore Categories <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Trending Sidebar */}
            <div className="lg:col-span-4 lg:border-l border-white/5 lg:pl-12 flex flex-col">
              <div className="flex items-center justify-between mb-10">
                 <h4 className="text-[11px] font-black uppercase tracking-[0.4em] flex items-center gap-3"><TrendingUp className="w-4 h-4 text-orange-500" /> Trending Now</h4>
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </div>
              
              <div className="flex flex-col gap-4">
                {loading ? [1,2,3,4].map(i => <div key={i} className="h-24 bg-white/5 rounded-3xl animate-pulse" />) : trendingList.map(item => (
                  <BlogCard 
                    key={item.slug}
                    {...item}
                    variant="trending"
                    link={`/${item.category.toLowerCase().replace(/\s+/g, '-')}/${item.slug}`} 
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-orange-600/5 blur-[150px] pointer-events-none rounded-full" />
      </section>

      {/* FILTER CONTROLS */}
      <div className="sticky top-[80px] z-40 bg-var(--bg-main)/80 backdrop-blur-md border-b border-white/5 py-6 px-6">
         <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2 md:pb-0">
               <button 
                onClick={() => setActiveCategory("All")}
                className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border ${activeCategory === "All" ? 'bg-orange-600 text-white border-orange-600' : 'bg-transparent text-[#64748B] border-white/10 hover:border-white/20'}`}
               >
                 All Protocols
               </button>
               {categories.map(cat => (
                 <button
                   key={cat.name}
                   onClick={() => setActiveCategory(cat.name)}
                   className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border ${activeCategory === cat.name ? 'bg-orange-600 text-white border-orange-600' : 'bg-transparent text-[#64748B] border-white/10 hover:border-white/20'}`}
                 >
                   {cat.name}
                 </button>
               ))}
            </div>
            <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-[#64748B]">
               <span>{filteredArticles.length} Nodes Online</span>
               <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
               <span>Last Dispatch: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
         </div>
      </div>

      {/* CATEGORY GRID */}
      <section id="categories" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <SectionHeader title="Protocol Sectors" subtitle="Navigate through our specialized intelligence verticals, each managed by subject matter experts." />
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {categories.map((cat, i) => (
              <motion.button
                key={cat.name}
                whileHover={{ y: -5 }}
                onClick={() => setActiveCategory(cat.name)}
                className={`p-10 rounded-[2.5rem] border transition-all flex flex-col items-center gap-6 group cursor-pointer ${activeCategory === cat.name ? 'bg-orange-600 border-orange-600' : 'bg-white/[0.02] border-white/5 hover:border-orange-500/50'}`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${activeCategory === cat.name ? 'bg-white/20' : 'bg-white/5 group-hover:bg-orange-600 group-hover:scale-110'}`}>
                   <cat.icon className={`w-8 h-8 ${activeCategory === cat.name ? 'text-white' : 'text-orange-500 group-hover:text-white'}`} />
                </div>
                <span className={`text-xs font-black uppercase tracking-widest transition-colors ${activeCategory === cat.name ? 'text-white' : 'text-[#64748B] group-hover:text-white'}`}>{cat.name}</span>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* MAIN CONTENT FEED */}
      <section id="latest-feed" className="py-32 px-6 bg-white/[0.01] border-y border-white/5">
        <div className="max-w-7xl mx-auto">
          <SectionHeader 
            title="Latest Articles" 
            subtitle="Recent technical dispatches and architectural insights from the NewsForge editorial desk."
            href={`/${activeCategory.toLowerCase()}`}
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-left">
            {loading ? [1,2,3,4,5,6].map(i => <SkeletonCard key={i} />) : latestGrid.slice(0, 9).map((item, idx) => (
              <motion.div 
                key={item.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (idx % 3) * 0.1 }}
              >
                <BlogCard 
                  {...item} 
                  link={`/${item.category.toLowerCase().replace(/\s+/g, '-')}/${item.slug}`} 
                  date={new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
              </motion.div>
            ))}
          </div>
          
          <div className="mt-24 text-center">
             <button className="px-16 py-6 rounded-full border border-white/10 hover:border-orange-500 font-black uppercase text-xs tracking-[0.3em] transition-all bg-white/5 text-[#94A3B8] hover:text-white cursor-pointer shadow-xl">
               Load More Intelligence
             </button>
          </div>
        </div>
      </section>

      {/* TRENDING TOPICS SIDEBAR REPLACED BY NEWSLETTER & TAGS */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
           
           <div className="text-left space-y-10">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-orange-500/20 text-[10px] font-black uppercase tracking-[0.4em] bg-orange-500/5 text-orange-500">
                <CheckCircle className="w-4 h-4 fill-current" /> Stay Ahead of the Curve
              </div>
              <h2 className="text-5xl md:text-7xl font-black uppercase leading-[0.9] tracking-tighter">
                Synchronize <br /><span className="gradient-text">Your Mind</span>.
              </h2>
              <p className="text-lg font-medium text-[#94A3B8] leading-relaxed max-w-lg">
                Join 42,000+ engineers, decision makers, and architects receiving our high-density technical alpha. Zero noise, absolute signals.
              </p>
              <div className="flex flex-col md:flex-row gap-4 max-w-md">
                 <input type="email" placeholder="YOUR NEXUS EMAIL" className="flex-1 bg-white/[0.03] border border-white/10 rounded-2xl px-6 py-5 text-xs font-black uppercase tracking-widest outline-none focus:border-orange-500 transition-all" />
                 <button className="btn-primary py-5 px-10 text-[11px]">Subscribe</button>
              </div>
           </div>

           <div className="grid grid-cols-1 gap-12">
              <div className="space-y-6 text-left">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-between text-[#64748B]">
                     <div className="flex items-center gap-3"><TrendingUp className="w-4 h-4 text-orange-500" /> Active Keywords</div>
                  </h4>
                  <div className="flex flex-wrap gap-3">
                    {trendingTags.map(tag => (
                      <button
                        key={tag.name}
                        onClick={() => setActiveTag(tag.name)}
                        className={`px-5 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer border ${activeTag === tag.name ? 'bg-orange-600 text-white border-orange-600' : 'bg-white/5 text-[#94A3B8] border-white/5 hover:border-orange-500/50'}`}
                      >
                        {tag.name} <span className="opacity-30 ml-2">/{tag.count}</span>
                      </button>
                    ))}
                  </div>
              </div>
              
              <div className="p-12 rounded-[3rem] relative overflow-hidden bg-orange-600 group">
                 <Zap className="w-40 h-40 absolute -right-10 -bottom-10 text-white/10 group-hover:scale-110 transition-transform duration-1000" />
                 <div className="relative z-10 text-left">
                    <h4 className="text-5xl font-black mb-4 uppercase text-white tracking-tighter leading-none">Upgrade Terminal</h4>
                    <p className="text-xs text-white/80 mb-10 font-black uppercase tracking-[0.2em]">Unlock elite market dispatches and daily technical synthesis.</p>
                    <button className="w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-95 transition-all bg-white text-black border-none cursor-pointer">Start Alpha Trial</button>
                 </div>
              </div>
           </div>

        </div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-orange-600/5 blur-[200px] pointer-events-none rounded-full" />
      </section>

      <Footer />
    </div>
  );
};

export default Home;
