import React, { useEffect, useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { FileText, Users, Image as ImageIcon, TrendingUp, Activity } from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL, ADMIN_SECRET } from '../../config';
import AdminLayout from '../layout/AdminLayout';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon, subtitle }) => (
  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-primary">
        {icon}
      </div>
      {subtitle && <span className="text-xs font-medium text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">{subtitle}</span>}
    </div>
    <div className="space-y-1">
      <h4 className="text-sm font-medium text-slate-500">{title}</h4>
      <div className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{value}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const { articles, user } = useContent();
  const [stats, setStats] = useState({ articles: 0, views: 0, media: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/admin/stats`, { 
          headers: { Authorization: `Bearer ${ADMIN_SECRET}` } 
        });
        setStats(res.data);
      } catch (err) {
        if (!err?.isDuplicate) console.error("Stats Sync Failure", err);
      }
    };
    fetchStats();
  }, []);

  const recentActivity = articles.slice(0, 5);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight mb-2">Overview</h1>
        <p className="text-sm text-slate-500">Welcome back, {user?.username || 'Admin'}. Here is what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Posts" value={stats.articles || articles.length} icon={<FileText size={20} />} subtitle="+2 today" />
        <StatCard title="Total Views" value={stats.views?.toLocaleString() || 0} icon={<Activity size={20} />} subtitle="Global" />
        <StatCard title="Media Assets" value={stats.media || 0} icon={<ImageIcon size={20} />} />
        <StatCard title="Subscribers" value="0" icon={<Users size={20} />} subtitle="Beta" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Posts */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
             <h3 className="font-semibold text-slate-900 dark:text-white">Recent Posts</h3>
             <Link to="/admin/blogs" className="text-sm text-primary hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800/50">
             {recentActivity.map(article => (
               <div key={article._id || article.id} className="p-6 flex items-start gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                  <div className="w-16 h-12 rounded-lg bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0">
                     {article.image ? (
                        <img src={article.image} alt="" className="w-full h-full object-cover" />
                     ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400"><ImageIcon size={16} /></div>
                     )}
                  </div>
                  <div className="flex-1 min-w-0">
                     <Link to={`/admin/editor/${article.slug}`} className="font-semibold text-slate-900 dark:text-white truncate block hover:text-primary transition-colors">
                       {article.title}
                     </Link>
                     <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="capitalize">{article.status || 'published'}</span>
                     </div>
                  </div>
                  <div className="text-sm font-medium text-slate-600 dark:text-slate-400">
                     {article.views?.toLocaleString() || 0} views
                  </div>
               </div>
             ))}
             {recentActivity.length === 0 && (
               <div className="p-10 text-center text-slate-500 text-sm">No recent posts found.</div>
             )}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800">
             <h3 className="font-semibold text-slate-900 dark:text-white">System Activity</h3>
          </div>
          <div className="p-6 space-y-6">
             <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                  <TrendingUp size={14} />
                </div>
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">System metrics synced successfully</p>
                  <span className="text-xs text-slate-400">Just now</span>
                </div>
             </div>
             <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-green-50 dark:bg-green-500/10 text-green-500 flex items-center justify-center shrink-0">
                  <FileText size={14} />
                </div>
                <div>
                  <p className="text-sm text-slate-700 dark:text-slate-300">New draft auto-saved in Editor</p>
                  <span className="text-xs text-slate-400">2 hours ago</span>
                </div>
             </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
