import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Plus, Edit2, Trash2, Home, LogOut, FileText, Settings, BarChart, 
  Search, Filter, ExternalLink, MoreVertical, Layout, Newspaper,
  Users, Layers, Bell, CheckCircle, Clock, AlertCircle, Moon, Sun, TrendingUp, Zap, Sparkles
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL, ADMIN_SECRET } from '../config';
import AdminMedia from '../admin-hubs/AdminMedia';
import AdminSubscribers from '../admin-hubs/AdminSubscribers';
import ConfirmModal from '../components/ConfirmModal';
import { StatCardSkeleton, ArticleListItemSkeleton } from '../components/SkeletonLoaders';
import SearchOverlay from '../components/SearchOverlay';
import { toast } from 'react-hot-toast';

import AdminLayout from '../components/AdminLayout';

const AdminDashboard = () => {
  const { articles, deleteArticle, logout, user, darkMode, toggleTheme } = useContent();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeHub, setActiveHub] = useState('Overview');
  const [showConfig, setShowConfig] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null, batch: false });
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();

  const authHeader = { Authorization: `Bearer ${ADMIN_SECRET}` };

  const fetchStats = async () => {
    setLoadingStats(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/stats`, { headers: authHeader });
      setStats(res.data);
    } catch (err) {
      toast.error("Analytics Sync Failure");
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    if (activeHub === 'Overview') fetchStats();
  }, [activeHub]);

  useEffect(() => {
    const handleToggleSearch = () => setIsSearchOpen(prev => !prev);
    document.addEventListener('toggleSearch', handleToggleSearch);
    return () => document.removeEventListener('toggleSearch', handleToggleSearch);
  }, []);

  if (!user) return null;

  const handleHubChange = (hub) => {
    setActiveHub(hub);
    setSearchTerm('');
  };

  const handleDelete = async () => {
    if (!confirmDelete.id && !confirmDelete.batch) return;
    
    try {
      if (confirmDelete.batch) {
        await Promise.all(selectedArticles.map(id => deleteArticle(id)));
        setSelectedArticles([]);
        toast.success(`Purged ${selectedArticles.length} Nodes`);
      } else {
        await deleteArticle(confirmDelete.id);
        toast.success("Intelligence Node Purged");
      }
      fetchStats();
      setConfirmDelete({ open: false, id: null, batch: false });
    } catch (err) {
      toast.error("Cleanup Failure");
    }
  };

  const toggleSelect = (id) => {
    setSelectedArticles(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedArticles.length === filteredArticles.length) {
      setSelectedArticles([]);
    } else {
      setSelectedArticles(filteredArticles.map(a => a._id || a.id));
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
    <AdminLayout>
      <div className="max-w-7xl mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* Hub Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-8" style={{ borderBottom: '1px solid var(--border)' }}>
          {['Overview', 'Subscribers', 'Media'].map((hub) => (
            <button
              key={hub}
              onClick={() => handleHubChange(hub)}
              className="shrink-0 px-4 py-3.5 text-sm font-medium transition-colors border-b-2 cursor-pointer bg-transparent"
              style={{
                color: activeHub === hub ? 'var(--accent)' : 'var(--text-muted)',
                borderColor: activeHub === hub ? 'var(--accent)' : 'transparent',
                fontWeight: activeHub === hub ? 700 : 500,
              }}
            >
              {hub}
            </button>
          ))}
        </div>
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
          <div className="flex items-center gap-6 relative">
            <div className="flex items-center gap-3 pr-6 border-r border-slate-100 dark:border-white/5 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-600">
               Network: <span className="text-green-500">Secured</span>
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer relative shadow-sm ${showNotifications ? 'bg-primary text-white border-primary' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-white/10 text-slate-400 hover:border-primary/30'}`}
            >
               <Bell className="w-5 h-5" />
               <div className="absolute top-3 right-3 w-2 h-2 bg-primary rounded-full border-2 border-white dark:border-slate-800" />
            </button>

            <AnimatePresence>
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-[100]" onClick={() => setShowNotifications(false)} />
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-4 w-96 bg-white dark:bg-slate-900 border border-slate-100 dark:border-white/10 rounded-[2.5rem] shadow-2xl z-[110] overflow-hidden"
                  >
                    <div className="p-8 border-b border-slate-50 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                       <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-900 dark:text-white flex items-center gap-3">
                         <Bell className="w-3.5 h-3.5 text-primary" /> Active Transmissions
                       </h4>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto p-4 space-y-2">
                       <NotificationItem icon={<CheckCircle className="w-4 h-4 text-green-500" />} title="Sync Success" time="2m ago" />
                       <NotificationItem icon={<AlertCircle className="w-4 h-4 text-orange-500" />} title="System Backup" time="45m ago" />
                       <NotificationItem icon={<TrendingUp className="w-4 h-4 text-primary" />} title="Traffic Spike" time="2h ago" />
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </header>

        <div className="space-y-12">
          {activeHub === 'Overview' && (
             loadingStats ? (
               <StatCardSkeleton />
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 <div className="card p-6 border group" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                   <div className="flex items-center gap-3 mb-2" style={{ color: 'var(--text-secondary)' }}><FileText className="w-5 h-5" /> <span className="text-sm font-semibold uppercase tracking-wider">Total Nodes</span></div>
                   <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.articles || 0}</div>
                 </div>
                 <div className="card p-6 border group" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                   <div className="flex items-center gap-3 mb-2" style={{ color: 'var(--text-secondary)' }}><Users className="w-5 h-5" /> <span className="text-sm font-semibold uppercase tracking-wider">Global Reach</span></div>
                   <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.views?.toLocaleString() || 0}</div>
                 </div>
                 <div className="card p-6 border group" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                   <div className="flex items-center gap-3 mb-2" style={{ color: 'var(--text-secondary)' }}><TrendingUp className="w-5 h-5" /> <span className="text-sm font-semibold uppercase tracking-wider">Dominant Niche</span></div>
                   <div className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{topNiche}</div>
                 </div>
                 <div className="card p-6 border group" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                   <div className="flex items-center gap-3 mb-2" style={{ color: 'var(--text-secondary)' }}><BarChart className="w-5 h-5" /> <span className="text-sm font-semibold uppercase tracking-wider">Storage</span></div>
                   <div className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats?.media || 0}</div>
                 </div>
               </div>
             )
          )}

          {/* NEWSFORGE v4.0: NICHE DOMINANCE HUB */}
          {activeHub === 'Overview' ? (
            <div className="space-y-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-2xl font-bold" style={{ letterSpacing: '-0.03em' }}>Content Ecosystem</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{filteredArticles.length} matching story assets</p>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-center">
                   <div className="relative">
                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
                     <input 
                       type="text" 
                       placeholder="Search content repository..." 
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                       className="input pl-10 h-10 w-64 text-sm"
                     />
                   </div>
                   <select 
                     value={selectedCategory} 
                     onChange={(e) => setSelectedCategory(e.target.value)}
                     className="input h-10 text-sm cursor-pointer"
                   >
                     {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                   </select>

                  <Link to="/admin/editor/new" className="btn-primary py-2 px-5 no-underline ml-2 text-sm gap-2 whitespace-nowrap">
                    <Plus className="w-4 h-4" /> Compose Post
                  </Link>
                </div>
              </div>

              <div className="card border overflow-hidden mt-8" style={{ borderColor: 'var(--border)', background: 'var(--bg-card)' }}>
                <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-soft)', color: 'var(--text-muted)' }}>
                        <th className="px-6 py-4 text-center w-16">
                          <input 
                            type="checkbox"
                            className="w-4 h-4 rounded border-gray-300 accent-primary cursor-pointer"
                            checked={selectedArticles.length === filteredArticles.length && filteredArticles.length > 0}
                            onChange={toggleSelectAll}
                          />
                        </th>
                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Title</th>
                        <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Author</th>
                        <th className="px-6 py-4 font-semibold text-center uppercase tracking-wider text-xs">Views</th>
                        <th className="px-6 py-4 font-semibold text-center uppercase tracking-wider text-xs">Published</th>
                        <th className="px-6 py-4 text-center font-semibold uppercase tracking-wider text-xs">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                      {filteredArticles.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="py-20 text-center opacity-50">
                             <div className="flex flex-col items-center">
                                <Search className="w-10 h-10 mb-4 opacity-30" />
                                <span className="font-medium text-lg">No content matched parameters.</span>
                             </div>
                          </td>
                        </tr>
                      ) : (
                        filteredArticles.map(article => (
                          <motion.tr 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            key={article._id || article.slug} 
                            className="transition-colors hover:bg-[var(--bg-soft)]"
                          >
                            <td className="px-6 py-4 text-center">
                               <input 
                                 type="checkbox"
                                 className="w-4 h-4 rounded border-gray-300 accent-[#f97316] cursor-pointer"
                                 checked={selectedArticles.includes(article._id || article.id)}
                                 onChange={() => toggleSelect(article._id || article.id)}
                               />
                            </td>
                            <td className="px-6 py-4">
                              <div className="font-semibold text-base mb-1 line-clamp-1">
                                <Link to={`/admin/editor/${article.slug}`} className="no-underline text-inherit hover:text-[var(--accent)] transition-colors">{article.title}</Link>
                              </div>
                              <div className="flex gap-2">
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>{article.category}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{article.author}</td>
                            <td className="px-6 py-4 text-center font-bold" style={{ color: 'var(--text-secondary)' }}>{article.views?.toLocaleString() || 0}</td>
                            <td className="px-6 py-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                              {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-6 py-4 text-center">
                               <div className="flex justify-center gap-2">
                                  <Link to={`/admin/editor/${article.slug}`} className="p-2 border rounded-md transition-colors bg-white hover:border-[var(--accent)] hover:text-[var(--accent)] dark:bg-slate-800 dark:border-slate-700 dark:hover:border-orange-500" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                     <Edit2 className="w-4 h-4" />
                                  </Link>
                                  <button onClick={() => setConfirmDelete({ open: true, id: article._id || article.id, batch: false })} className="p-2 border rounded-md transition-colors bg-white hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 dark:bg-slate-800 dark:border-slate-700 dark:hover:border-rose-900/50 dark:hover:text-rose-400 cursor-pointer" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                                     <Trash2 className="w-4 h-4" />
                                  </button>
                               </div>
                            </td>
                          </motion.tr>
                        ))
                      )}
                    </tbody>
                </table>
              </div>
            </div>
          ) : activeHub === 'Subscribers' ? (
            <div className="anim-fade-in"><AdminSubscribers /></div>
          ) : activeHub === 'Media' ? (
            <div className="anim-fade-in"><AdminMedia /></div>
          ) : null}
        </div>
      </main>

      <ConfirmModal 
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null, batch: false })}
        onConfirm={handleDelete}
        title={confirmDelete.batch ? "Purge Multiple Nodes" : "Purge Intelligence Node"}
        message={confirmDelete.batch ? `Are you sure you want to permanently execute ${selectedArticles.length} nodes from the network?` : "Are you sure you want to permanently execute this node from the network?"}
      />

      <SearchOverlay 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Batch Action Bar */}
      <AnimatePresence>
        {selectedArticles.length > 0 && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900/90 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-4 flex items-center gap-10 shadow-2xl"
          >
             <div className="flex items-center gap-4 pl-6 border-r border-white/10 pr-10">
                <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Selected</span>
                <span className="text-2xl font-black text-white font-['Outfit']">{selectedArticles.length}</span>
             </div>
             <div className="flex items-center gap-3 pr-4">
                <button 
                  onClick={() => setConfirmDelete({ open: true, batch: true })}
                  className="px-8 py-4 rounded-2xl bg-red-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all cursor-pointer border-none shadow-lg shadow-red-500/20"
                >
                  Purge Batch
                </button>
                <button 
                  onClick={() => setSelectedArticles([])}
                  className="px-8 py-4 rounded-2xl bg-white/5 text-slate-400 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 hover:text-white transition-all cursor-pointer border-none"
                >
                  Discard Selection
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </AdminLayout>
  );
};

const NotificationItem = ({ icon, title, time }) => (
  <div className="flex items-center gap-6 p-5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-3xl transition-all cursor-pointer group">
     <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
        {icon}
     </div>
     <div className="flex-1 text-left">
        <div className="text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{title}</div>
        <div className="text-[9px] font-bold text-slate-400 dark:text-slate-600 mt-1 uppercase tracking-widest">{time}</div>
     </div>
  </div>
);

const NavItem = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group font-black uppercase text-[10px] tracking-widest border-none cursor-pointer ${active ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_10px_20px_rgba(249,115,22,0.1)]' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 bg-transparent'}`}
  >
    <div className={`transition-transform group-hover:scale-110 ${active ? 'text-primary' : ''}`}>{icon}</div>
    <span className={active ? 'text-primary' : ''}>{label}</span>
  </button>
);

const StatCard = ({ label, value, icon, trend }) => (
  <div className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[3.5rem] border border-slate-200 dark:border-white/5 shadow-[0_15px_60px_-15px_rgba(0,0,0,0.03)] dark:shadow-none space-y-8 hover:translate-y-[-8px] transition-all group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors" />
    <div className="flex items-center justify-between relative z-10">
       <span className="text-[9px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] font-black">{label}</span>
       <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/10 text-slate-400 dark:text-slate-500 flex items-center justify-center group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all group-hover:rotate-6">
          {icon}
       </div>
    </div>
    <div className="relative z-10">
      <div className="text-5xl font-black font-['Outfit'] text-slate-900 dark:text-white tracking-tighter">{value}</div>
      <div className="flex items-center gap-2 mt-3">
        <div className="px-2 py-0.5 rounded-md bg-green-500/10 text-[8px] font-black uppercase tracking-widest text-green-500">Pulse</div>
        <div className="text-[9px] font-bold text-slate-400 dark:text-slate-600 tracking-wider">/ {trend}</div>
      </div>
    </div>
  </div>
);

export default AdminDashboard;
