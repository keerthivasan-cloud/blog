import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight, Sparkles, Loader2, Zap, Newspaper, Star, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { Navbar, Footer, BlogCard } from '../components/Layout';
import { Link } from 'react-router-dom';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    axios.get("http://localhost:5000/api/articles")
      .then(res => {
        const published = res.data.filter(a => a.status === 'published');
        setArticles(published);
      })
      .catch(err => console.error("Failed to sync metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
     return (
        <div className="min-h-screen bg-white dark:bg-slate-950">
           <Navbar />
           <div className="flex flex-col items-center justify-center p-60 gap-8">
              <Loader2 className="w-16 h-16 animate-spin text-primary opacity-20" />
              <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.6em] ml-2">Initializing System...</p>
           </div>
        </div>
     );
  }

  // Content Segmentation
  const featured = articles[0] || null;
  const smallFeatured = articles.slice(1, 4);
  const trending = articles.slice(0, 5);
  
  const techArticles = articles.filter(a => a.category === 'Tech').slice(0, 3);
  const financeArticles = articles.filter(a => a.category === 'Finance').slice(0, 3);
  
  const mainFeed = articles.slice(4, 50);

  const SectionHeader = ({ title, icon: Icon, href }) => (
    <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100 dark:border-slate-800">
      <div className="flex items-center gap-3">
        {Icon && <Icon className="w-5 h-5 text-primary" />}
        <h2 className="text-2xl font-black font-['Outfit'] text-slate-900 dark:text-white tracking-tight uppercase leading-none">{title}</h2>
      </div>
      {href && (
        <Link to={href} className="text-[10px] font-black uppercase tracking-widest text-slate-300 hover:text-primary transition-colors flex items-center gap-2 no-underline">
          Access Index <ArrowRight className="w-4 h-4" />
        </Link>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500 selection:bg-primary/10">
      <Navbar />

      {/* NewsForge v2.0: TODAY IN 2 MINUTES (Daily Digest) */}
      <section className="bg-slate-900 dark:bg-slate-900 border-b border-white/5 py-12 px-6">
        <div className="max-w-[1500px] mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-[0.4em] text-primary">
                <Zap className="w-3.5 h-3.5 fill-primary" /> Signature Dispatch
              </div>
              <h2 className="text-5xl md:text-7xl font-black font-['Outfit'] text-white leading-none -tracking-tighter uppercase mb-2">Today in <br />2 Minutes</h2>
              <p className="text-slate-400 font-bold uppercase text-[11px] tracking-widest leading-loose">The 5 essential intelligence nodes for the industrial architect.</p>
            </div>
            
            <div className="flex-[2] grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
              {articles.slice(0, 6).map((item, idx) => (
                <Link key={item._id} to={`/${item.category.toLowerCase().replace(/\s+/g, '-')}/${item.slug}`} className="group flex items-start gap-5 no-underline">
                  <div className="text-2xl font-black text-slate-700 font-['Outfit'] group-hover:text-primary transition-colors">0{idx+1}</div>
                  <div className="pt-1">
                    <h4 className="text-sm font-black text-slate-100 font-lora leading-tight uppercase transition-all group-hover:translate-x-1">{item.title}</h4>
                    <div className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mt-2">{item.category} / {item.readTime}M sync</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section - Compressed & Content Rich */}
      <section className="relative pt-12 pb-16 px-6 overflow-hidden">
        <div className="hero-glow absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[500px] bg-orange-50/20 dark:bg-orange-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="max-w-[1500px] mx-auto">
           <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              <div className="lg:col-span-8">
                 {featured && (
                   <BlogCard 
                     {...featured} 
                     variant="featured" 
                     link={`/${featured.category.toLowerCase().replace(/\s+/g, '-')}/${featured.slug}`} 
                   />
                 )}
              </div>
              <div className="lg:col-span-4 flex flex-col justify-between gap-6">
                 <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-600 mb-6 flex items-center gap-2">
                       <Zap className="w-3.5 h-3.5 text-primary fill-primary" /> Must Reads
                    </h4>
                    {smallFeatured.map((item, idx) => (
                        <BlogCard 
                          key={item._id} 
                          {...item} 
                          variant="list" 
                          link={`/${item.category.toLowerCase().replace(/\s+/g, '-')}/${item.slug}`} 
                        />
                    ))}
                 </div>
                 <div className="glass p-8 rounded-[2rem] bg-slate-900 dark:bg-slate-900/50 border-none text-white overflow-hidden relative group mt-4">
                    <Zap className="w-20 h-20 absolute -right-4 -bottom-4 text-white/5 group-hover:scale-125 transition-transform duration-700" />
                    <div className="relative z-10">
                       <h4 className="text-xl font-black mb-2 font-['Outfit']">Premium Access</h4>
                       <p className="text-[11px] text-white/40 mb-6 font-bold uppercase tracking-widest leading-loose">Private technical briefs delivered to your terminal daily.</p>
                       <button className="primary-btn w-full text-[10px] uppercase tracking-widest py-4">Upgrade Terminal</button>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Content Engine: Latest, Trending, Categories */}
      <section className="py-12 px-6 max-w-[1500px] mx-auto">
         <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* MAIN CONTENT COLUMN */}
            <div className="lg:col-span-8">
               
               {/* LATEST SECTION */}
               <SectionHeader title="Latest Insights" icon={Newspaper} href="/global-market" />
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
                  {articles.slice(0, 6).map((item, idx) => (
                    <BlogCard 
                       key={item._id} 
                       {...item} 
                       link={`/${item.category.toLowerCase().replace(/\s+/g, '-')}/${item.slug}`} 
                       date={new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    />
                  ))}
               </div>
               
               {/* CATEGORY BLOCK - TECH */}
                <div className="mt-24">
                   <SectionHeader title="Technical Frontier" icon={Sparkles} href="/tech" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="md:col-span-2">
                        {techArticles[0] && (
                          <div className="h-full">
                            <BlogCard 
                               {...techArticles[0]} 
                               link={`/tech/${techArticles[0].slug}`}
                               variant="standard"
                             />
                          </div>
                        )}
                     </div>
                     <div className="flex flex-col gap-6">
                        {techArticles.slice(1, 3).map(item => (
                          <BlogCard key={item._id} {...item} variant="list" link={`/tech/${item.slug}`} />
                        ))}
                     </div>
                  </div>
               </div>

                {/* CATEGORY BLOCK - FINANCE */}
                <div className="mt-24">
                   <SectionHeader title="Monetary Flow" icon={Star} href="/finance" />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                     <div className="flex flex-col gap-6">
                        {financeArticles.slice(1, 3).map(item => (
                          <BlogCard key={item._id} {...item} variant="list" link={`/finance/${item.slug}`} />
                        ))}
                     </div>
                     <div className="md:col-span-2 order-first md:order-last">
                        {financeArticles[0] && (
                          <div className="h-full">
                            <BlogCard 
                               {...financeArticles[0]} 
                               link={`/finance/${financeArticles[0].slug}`}
                               variant="standard"
                             />
                          </div>
                        )}
                     </div>
                  </div>
               </div>
            </div>

            {/* SIDEBAR ENGINE */}
            <div className="lg:col-span-4 space-y-16">
               <div className="glass p-10 rounded-[3rem] border-slate-100/50 shadow-2xl shadow-slate-200/20 dark:shadow-none">
                  <SectionHeader title="Trending Now" icon={TrendingUp} />
                  <div className="space-y-10">
                     {trending.map((item, idx) => (
                        <div key={item._id} className="flex gap-6 group">
                           <div className="text-4xl font-black text-slate-100 dark:text-slate-800 transition-colors font-['Outfit'] shadow-sm leading-none">0{idx+1}</div>
                           <div className="pt-1">
                              <div className="text-[10px] font-black uppercase tracking-widest text-[#f97316]/60 mb-2 leading-none">{item.category}</div>
                              <h4 className="text-lg font-black text-slate-900 dark:text-white leading-[1.3] group-hover:text-primary transition-colors font-['Outfit'] text-left">
                                <Link to={`/${item.category.toLowerCase().replace(/\s+/g, '-')}/${item.slug}`} className="text-inherit no-underline">{item.title}</Link>
                              </h4>
                           </div>
                        </div>
                     ))}
                  </div>
                  <button className="w-full mt-12 py-5 rounded-2xl border-2 border-slate-50 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest hover:border-primary/30 hover:text-primary transition-all bg-transparent cursor-pointer text-slate-400">Expand Analysis</button>
               </div>

               {/* AD/CTA BLOCK */}
               <div className="bg-primary p-12 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl shadow-orange-500/20">
                  <div className="absolute top-0 right-0 p-4 opacity-20"><Sparkles className="w-20 h-20" /></div>
                  <h4 className="text-3xl font-black mb-6 font-['Outfit'] leading-tight relative z-10 text-left">Global Shift: <br />The 2026 Report</h4>
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] mb-8 opacity-70 relative z-10 text-left">Limited edition briefing for market architects.</p>
                  <button className="bg-white text-primary px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl relative z-10 flex items-center gap-3 cursor-pointer border-none">Secure Copy <ArrowRight className="w-4 h-4" /></button>
               </div>
            </div>
         </div>
      </section>

      {/* INFINITE-STYLE GRID FEED */}
      <section className="bg-slate-50/50 dark:bg-slate-900/20 py-24 px-6 border-y border-slate-100 dark:border-slate-900">
         <div className="max-w-[1500px] mx-auto">
            <SectionHeader title="Continuous Intelligence" icon={Zap} />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
               {mainFeed.map((item, idx) => (
                  <motion.div 
                     key={item._id}
                     initial={{ opacity: 0, y: 30 }}
                     whileInView={{ opacity: 1, y: 0 }}
                     viewport={{ once: true }}
                     transition={{ delay: (idx%4) * 0.1 }}
                  >
                     <BlogCard 
                        {...item} 
                        link={`/${item.category.toLowerCase().replace(/\s+/g, '-')}/${item.slug}`} 
                        date={new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                     />
                  </motion.div>
               ))}
            </div>
            <div className="mt-20 flex justify-center">
               <button className="primary-btn px-16 py-6 text-[10px] uppercase tracking-widest rounded-full shadow-2xl shadow-orange-500/20 hover:scale-105 transition-transform duration-500">Synchronize More Records</button>
            </div>
         </div>
      </section>

      {/* FINAL NEWSLETTER CTA */}
      <section className="py-40 px-6 bg-slate-950 text-white relative overflow-hidden">
         <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-10">
               <Zap className="w-4 h-4 fill-primary" /> Stay Prioritized
            </div>
            <h2 className="text-6xl md:text-8xl font-black font-['Outfit'] mb-10 leading-none tracking-tighter">Architecture of <br /><span className="gradient-text">Success</span></h2>
            <p className="text-lg text-white/40 mb-16 max-w-2xl mx-auto font-bold uppercase tracking-widest leading-loose">JOIN 42,000+ DECISION MAKERS RECEIVING OUR TECHNICAL ALPHA TWICE A WEEK.</p>
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
               <input type="email" placeholder="Enter your nexus email" className="flex-1 p-7 rounded-2xl bg-white/5 border border-white/10 text-white font-black outline-none focus:ring-4 focus:ring-primary/20 transition-all font-['Inter'] text-[11px] placeholder:text-white/20 uppercase tracking-widest" />
               <button className="primary-btn px-16 py-7 text-[12px] uppercase tracking-[0.3em] font-black shadow-none">Subscribe</button>
            </div>
         </div>
         {/* Background Decor */}
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-primary/5 rounded-full blur-[180px] pointer-events-none" />
      </section>

      <Footer />
    </div>
  );
};

export default Home;
