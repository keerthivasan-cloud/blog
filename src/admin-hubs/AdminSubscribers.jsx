import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Search, Trash2, Download, Filter, UserX, UserCheck, 
  Mail, Calendar, ChevronLeft, ChevronRight, Hash, Sparkles 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_BASE_URL, ADMIN_SECRET } from '../config';
import ConfirmModal from '../components/ConfirmModal';
import { SubscriberSkeleton } from '../components/SkeletonLoaders';

const AdminSubscribers = () => {
  const [subs, setSubs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  
  const authHeader = { Authorization: `Bearer ${ADMIN_SECRET}` };

  const fetchSubs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_BASE_URL}/subscribers?page=${page}&limit=20&q=${search}&status=${status}`, 
        { headers: authHeader }
      );
      setSubs(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      toast.error("Audience Retrieval Failed");
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSubs(), 300);
    return () => clearTimeout(timer);
  }, [fetchSubs]);

  const deleteSub = async () => {
    if (!confirmDelete.id) return;
    try {
      await axios.delete(`${API_BASE_URL}/subscribers/${confirmDelete.id}`, { headers: authHeader });
      toast.success("Contact Removed");
      fetchSubs();
    } catch (err) {
      toast.error("Cleanup Failure");
    }
  };

  const exportCSV = () => {
    if (subs.length === 0) return toast.error("No contacts detected in current view");
    
    const headers = ["ID", "Email", "Status", "Subscribed At"];
    const rows = subs.map(s => [s.id, s.email, s.status, s.created_at]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(e => e.join(","))
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `newsforge_audience_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Audience Data Exported");
  };

  return (
    <div className="space-y-10 animate-fade-in p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h2 className="text-4xl font-black font-['Outfit'] dark:text-white uppercase tracking-tighter">Audience Hub</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.5em]">
              {total} REGISTERED NODES DETECTED
            </span>
          </div>
        </div>
        <button onClick={exportCSV} className="primary-btn px-10 shadow-xl shadow-primary/20 flex items-center gap-3">
          <Download className="w-4 h-4" />
          Export CSV Asset
        </button>
      </div>

      {/* FILTERS BAR */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-8 flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-slate-200/50 dark:shadow-none">
        <div className="flex-1 relative w-full">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search Intelligence Contacts..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-slate-850 border-none rounded-2xl outline-none focus:ring-2 ring-primary/20 text-[12px] font-bold text-slate-700 dark:text-white transition-all"
          />
        </div>
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-60">
            <Filter className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <select 
              value={status}
              onChange={(e) => { setStatus(e.target.value); setPage(1); }}
              className="w-full pl-14 pr-10 py-5 bg-slate-50 dark:bg-slate-850 border-none rounded-2xl outline-none focus:ring-2 ring-primary/20 text-[10px] font-black uppercase tracking-widest appearance-none cursor-pointer"
            >
              <option value="all">Display All Nodes</option>
              <option value="active">Active Channels</option>
              <option value="unsubscribed">Archived Channels</option>
            </select>
          </div>
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          {loading ? (
             <SubscriberSkeleton />
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 text-[10px] uppercase font-black tracking-widest text-slate-400">
                <tr>
                   <th className="px-10 py-8">Channel Email / Identity</th>
                   <th className="px-10 py-8">Subscription Status</th>
                   <th className="px-10 py-8">Registration Timestamp</th>
                   <th className="px-10 py-8 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-bold">
                {subs.length > 0 ? subs.map((sub) => (
                  <tr key={sub.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 group transition-colors">
                    <td className="px-10 py-8 flex items-center gap-4">
                       <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary">
                          <Mail className="w-4 h-4" />
                       </div>
                       <span className="text-slate-900 dark:text-white">{sub.email}</span>
                    </td>
                    <td className="px-10 py-8">
                       <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${
                         sub.status === 'active' 
                           ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                           : 'bg-slate-500/10 text-slate-400 border-slate-400/20'
                       }`}>
                          {sub.status || 'Active'}
                       </span>
                    </td>
                    <td className="px-10 py-8 text-slate-400 mono text-[10px] uppercase tracking-widest">
                       {new Date(sub.created_at).toLocaleDateString(undefined, {
                         year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                       })}
                    </td>
                    <td className="px-10 py-8 text-right">
                       <button 
                         onClick={() => setConfirmDelete({ open: true, id: sub.id })}
                         className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all border-none bg-transparent cursor-pointer opacity-0 group-hover:opacity-100"
                        >
                         <Trash2 className="w-5 h-5" />
                       </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="py-20 text-center text-slate-400 uppercase text-[10px] font-black tracking-widest">
                       No Intelligence Nodes Detected in Current Filter
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* PAGINATION */}
      {total > 20 && (
         <div className="flex items-center justify-between px-6 py-10">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
               Showing {subs.length} of {total} Nodes
            </p>
            <div className="flex items-center gap-3">
               <button 
                 disabled={page === 1}
                 onClick={() => setPage(p => p - 1)}
                 className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all cursor-pointer"
               >
                 <ChevronLeft className="w-5 h-5" />
               </button>
               <span className="text-[12px] font-black px-4">{page}</span>
               <button 
                 disabled={page >= Math.ceil(total / 20)}
                 onClick={() => setPage(p => p + 1)}
                 className="w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center disabled:opacity-30 hover:bg-slate-50 transition-all cursor-pointer"
               >
                 <ChevronRight className="w-5 h-5" />
               </button>
            </div>
         </div>
      )}
      <ConfirmModal 
        isOpen={confirmDelete.open}
        title="Remove Audience Node?"
        message="This will decouple the intelligence channel from the NewsForge network. The contact will no longer receive secure transmissions."
        onConfirm={deleteSub}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </div>
  );
};

export default AdminSubscribers;
