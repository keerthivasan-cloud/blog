import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Home, LogOut, FileText, Settings, BarChart, 
  Search, Filter, ExternalLink, MoreVertical, Layout, Newspaper,
  Users, Layers, Bell, CheckCircle, Clock, AlertCircle, Moon, Sun, TrendingUp, Zap, Sparkles
} from 'lucide-react';

const AdminDashboard = () => {
  const { articles, deleteArticle, logout, user, darkMode, toggleTheme } = useContent();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();

  const handleDelete = (id) => {
    if (window.confirm('Delete this article permamently?')) {
      deleteArticle(id);
    }
  };

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || a.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Intelligence', 'Tech', 'Business', 'Finance', 'Market', 'Commodities'];

  const publishedCount = articles.filter(a => a.status === 'published').length;
  const draftCount = articles.filter(a => a.status === 'draft').length;
  const totalArticles = articles.length;
  const totalViews = articles.reduce((acc, a) => acc + (a.views || 0), 0);

  // NEWSFORGE v4.0 NICHE ANALYTICS
  const categoryMetrics = categories.filter(c => c !== 'All').map(cat => {
    const catArticles = articles.filter(a => a.category === cat);
    const count = catArticles.length;
    const views = catArticles.reduce((acc, a) => acc + (a.views || 0), 0);
    const velocity = count > 0 ? (views / count).toFixed(1) : 0;
    return { name: cat, count, views, velocity };
  }).sort((a, b) => b.views - a.views);

  const topNiche = categoryMetrics[0]?.name || 'N/A';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex overflow-hidden font-['Inter'] text-slate-900 dark:text-white transition-colors duration-500">
      
      {/* Sidebar - Dark/Light Adaptive */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-8 z-20 shadow-[20px_0_40px_rgba(0,0,0,0.02)] transition-colors duration-500">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-[#f97316] rounded-xl flex items-center justify-center shadow-[0_5px_15px_rgba(249,115,22,0.3)]">
            <Newspaper className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black font-['Outfit'] tracking-tighter dark:text-white">NewsForge</span>
        </div>

        <div className="space-y-8 flex-1">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-300 dark:text-slate-600 uppercase tracking-widest font-black px-4 mb-4">Command Center</p>
            <NavItem icon={<BarChart className="w-4 h-4" />} label="Overview" active={true} />
            <NavItem icon={<FileText className="w-4 h-4" />} label="All Stories" />
            <Link to="/admin/editor/new" className="no-underline text-inherit group">
               <NavItem icon={<Plus className="w-4 h-4" />} label="New Drafting" />
            </Link>
            <Link to="/admin/write" className="no-underline text-inherit group">
               <NavItem icon={<Zap className="w-4 h-4 text-orange-500" />} label="AI Synthesis" />
            </Link>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-slate-300 dark:text-slate-600 uppercase tracking-widest font-black px-4 mb-4">System Archive</p>
            <NavItem icon={<Layers className="w-4 h-4" />} label="Sections" />
            <NavItem icon={<Users className="w-4 h-4" />} label="Team Hub" />
            <NavItem icon={<Settings className="w-4 h-4" />} label="Engine Config" />
          </div>
        </div>

        <div className="mt-auto space-y-4 pt-10 border-t border-slate-100 dark:border-slate-800">
           <button 
             onClick={toggleTheme}
             className="w-full flex items-center gap-3 text-slate-400 hover:text-primary transition-all text-sm font-bold px-4 py-3 rounded-xl border-none bg-slate-50 dark:bg-slate-800 cursor-pointer mb-2"
           >
             {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
             {darkMode ? 'Switch to Light' : 'Switch to Dark'}
           </button>
          <Link to="/" className="flex items-center gap-3 text-slate-400 hover:text-primary transition-all text-sm font-bold px-4 no-underline group">
            <ExternalLink className="w-4 h-4 group-hover:scale-110" /> Frontend Site
          </Link>
          <button 
             onClick={() => { logout(); navigate('/admin/login'); }}
             className="w-full flex items-center gap-3 text-slate-400 hover:text-red-500 transition-all text-sm font-bold px-4 py-3 rounded-xl border-none bg-transparent cursor-pointer"
          >
            <LogOut className="w-4 h-4" /> Shutdown Session
          </button>
        </div>
      </aside>

      {/* Primary Workspace */}
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-b border-slate-200 dark:border-slate-800 p-8 flex items-center justify-between z-10 transition-all duration-500">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 dark:text-slate-600 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Search content repository..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800 border border-transparent rounded-2xl p-4 pl-12 text-sm text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-700 focus:border-primary/20 outline-none transition-all shadow-inner"
            />
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3 pr-6 border-r border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">
               Network: <span className="text-green-500">Secured</span>
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <button className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-400 hover:border-primary/30 transition-all cursor-pointer relative shadow-sm">
               <Bell className="w-5 h-5" />
               <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-slate-800" />
            </button>
          </div>
        </header>

        <section className="p-12 space-y-12 max-w-7xl mx-auto">
          {/* Quick Analytics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <StatCard label="Live Assets" value={publishedCount} icon={<CheckCircle className="w-6 h-6 text-green-500" />} trend="+3 this week" />
            <StatCard label="Total Reach" value={totalViews.toLocaleString()} icon={<Users className="w-6 h-6 text-primary" />} trend="Aggregated Views" />
            <StatCard label="Dominant Niche" value={topNiche} icon={<TrendingUp className="w-6 h-6 text-orange-400" />} trend="High Velocity" />
            <StatCard label="Flow Cycle" value="98%" icon={<CheckCircle className="w-6 h-6 text-emerald-400" />} trend="Optimal" />
          </div>

          {/* NEWSFORGE v4.0: NICHE DOMINANCE HUB */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/10">
               <div className="flex items-center justify-between mb-12">
                  <div>
                    <h3 className="text-2xl font-black font-['Outfit'] -tracking-tight dark:text-white uppercase">Niche Dominance Index</h3>
                    <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.4em] mt-2">View Velocity vs Content Volume</p>
                  </div>
                  <BarChart className="w-8 h-8 text-slate-100 dark:text-slate-800" />
               </div>
               
               <div className="space-y-10">
                  {categoryMetrics.map((cat, idx) => (
                    <div key={cat.name} className="space-y-4">
                       <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-widest">
                          <div className="flex items-center gap-3">
                             <span className="text-slate-300 dark:text-slate-700">0{idx+1}</span>
                             <span className="dark:text-white">{cat.name}</span>
                          </div>
                          <div className="flex gap-6">
                             <span className="text-slate-400">Vol: {cat.count}</span>
                             <span className="text-primary">Reach: {cat.views}</span>
                          </div>
                       </div>
                       <div className="h-3 w-full bg-slate-50 dark:bg-slate-850 rounded-full overflow-hidden flex">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(cat.views / (categoryMetrics[0]?.views || 1)) * 100}%` }}
                            transition={{ duration: 1, delay: idx * 0.1 }}
                            className="bg-primary h-full rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]"
                          />
                       </div>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-slate-900 p-12 rounded-[3.5rem] relative overflow-hidden group">
               <Sparkles className="absolute top-[-10%] right-[-10%] w-64 h-64 text-white/5 group-hover:rotate-45 transition-transform duration-1000" />
               <div className="relative z-10">
                  <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center mb-8 border border-primary/20">
                    <Zap className="w-6 h-6 text-primary fill-primary" />
                  </div>
                  <h3 className="text-2xl font-black font-['Outfit'] text-white uppercase mb-4">Strategic<br />Leverage</h3>
                  <p className="text-white/40 font-bold uppercase text-[9px] tracking-[0.3em] leading-loose mb-10">
                    Your {topNiche} content has the highest view velocity ({categoryMetrics[0]?.velocity}x). Consider increasing broadcast frequency in this partition.
                  </p>
                  <button className="w-full py-4 rounded-2xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-primary hover:text-white transition-all cursor-pointer border-none shadow-xl">
                    Generate Report
                  </button>
               </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black font-['Outfit'] -tracking-tight dark:text-white">Content Ecosystem</h2>
                <p className="text-slate-400 dark:text-slate-600 font-bold text-[10px] uppercase tracking-widest mt-2">{filteredArticles.length} matching story assets</p>
              </div>
              <div className="flex gap-4">
                 <div className="flex bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    {['All', 'Tech', 'Business', 'Finance'].map(cat => (
                      <button 
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-none cursor-pointer ${selectedCategory === cat ? 'bg-primary text-white shadow-xl shadow-primary/20 translate-y-[-1px]' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'}`}
                      >
                        {cat}
                      </button>
                    ))}
                 </div>
                 <Link to="/admin/editor/new" className="primary-btn no-underline px-8 shadow-[0_10px_30px_rgba(249,115,22,0.3)]">
                   <Plus className="w-5 h-5" /> New Story
                 </Link>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.03)] transition-colors duration-500">
               <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black tracking-[0.2em] text-slate-300 dark:text-slate-600">
                      <th className="px-10 py-8">Information Asset</th>
                      <th className="px-10 py-8 text-center">Status</th>
                      <th className="px-10 py-8">Section</th>
                      <th className="px-10 py-8">Access Level</th>
                      <th className="px-10 py-8 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <AnimatePresence mode="popLayout">
                    {filteredArticles.map((article, idx) => (
                      <motion.tr 
                        key={article._id || article.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-all group"
                      >
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-6">
                              <div className="w-16 h-12 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex-shrink-0 shadow-sm">
                                 <img src={article.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                              </div>
                              <div className="max-w-md">
                                 <div className="font-bold text-slate-800 dark:text-slate-100 text-lg font-['Outfit'] leading-tight group-hover:text-primary transition-colors truncate">{article.title}</div>
                                 <div className="text-[10px] text-slate-400 dark:text-slate-600 font-bold mt-2 uppercase tracking-widest">Entry Ref: {article.author} / {article.date}</div>
                              </div>
                           </div>
                        </td>
                        <td className="px-10 py-8 text-center text-inherit">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${article.status === 'published' ? 'bg-green-50 dark:bg-green-500/10 text-green-500 border-green-100 dark:border-green-500/20' : 'bg-orange-50 dark:bg-orange-500/10 text-orange-500 border-orange-100 dark:border-orange-500/20'}`}>
                            {article.status || 'published'}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                           <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 uppercase tracking-widest">{article.category}</span>
                        </td>
                        <td className="px-10 py-8">
                           <div className="flex items-center gap-2 text-xs font-bold text-slate-400 dark:text-slate-600">
                              <Layers className="w-3.5 h-3.5 opacity-40" />
                              Public Archive
                           </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <div className="flex items-center justify-end gap-3 translate-x-2 group-hover:translate-x-0 transition-transform opacity-40 group-hover:opacity-100">
                             <button 
                               onClick={() => navigate(`/admin/editor/${article._id || article.id}`)}
                               className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-primary transition-all shadow-sm cursor-pointer"
                             >
                               <Edit2 className="w-4 h-4" />
                             </button>
                             <button 
                               onClick={() => handleDelete(article._id || article.id)}
                               className="p-3 rounded-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-red-500 transition-all shadow-sm cursor-pointer"
                             >
                               <Trash2 className="w-4 h-4" />
                             </button>
                           </div>
                        </td>
                      </motion.tr>
                    ))}
                    </AnimatePresence>
                  </tbody>
               </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

const NavItem = ({ icon, label, active }) => (
  <button className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all border-none cursor-pointer ${active ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white bg-transparent'}`}>
    {icon} {label}
  </button>
);

const StatCard = ({ label, value, icon, trend }) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.03)] dark:shadow-none space-y-6 hover:translate-y-[-5px] transition-all group">
    <div className="flex items-center justify-between">
       <span className="text-[10px] text-slate-300 dark:text-slate-600 uppercase tracking-widest font-black">{label}</span>
       <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-50 dark:border-slate-700 text-slate-300 dark:text-slate-600 group-hover:bg-primary/10 group-hover:text-primary transition-all">
          {icon}
       </div>
    </div>
    <div>
      <div className="text-4xl font-black font-['Outfit'] text-slate-900 dark:text-white">{value}</div>
      <div className="text-[10px] font-black uppercase text-slate-300 dark:text-slate-600 mt-2 tracking-widest">{trend}</div>
    </div>
  </div>
);

export default AdminDashboard;
