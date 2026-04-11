import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Search, Trash2, Download, CheckCircle2, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_BASE_URL, ADMIN_SECRET } from '../../config';
import ConfirmDialog from '../components/ConfirmDialog';
import AdminLayout from '../layout/AdminLayout';

const Subscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  
  const authHeader = { Authorization: `Bearer ${ADMIN_SECRET}` };

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/subscribers`, { headers: authHeader });
      setSubscribers(res.data.data || []);
    } catch (err) {
      toast.error("Failed to fetch subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const deleteSubscriber = async () => {
    if (!confirmDelete.id) return;
    try {
      await axios.delete(`${API_BASE_URL}/subscribers/${confirmDelete.id}`, { headers: authHeader });
      toast.success("Subscriber disconnected");
      fetchSubscribers();
    } catch (err) {
      toast.error("Failed to delete subscriber");
    }
    setConfirmDelete({ open: false, id: null });
  };

  const downloadCSV = () => {
    if (subscribers.length === 0) return toast.error("No data to export");
    
    const headers = "Email,Subscribed On,Status\n";
    const csvContent = subscribers.map(s => 
      `"${s.email}","${new Date(s.createdAt).toLocaleDateString()}","${s.status || 'Active'}"`
    ).join("\n");
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `newsforge_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success("Export successful");
  };

  const filteredSubs = subscribers.filter(s => 
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Subscribers</h1>
          <p className="text-sm text-slate-500">Manage your newsletter audience.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={downloadCSV}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 border-none"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
         <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search emails..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-shadow text-slate-900 dark:text-white"
               />
            </div>
         </div>

         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
               <thead>
                 <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 font-medium tracking-wide text-xs uppercase">
                   <th className="px-6 py-4">User Identity</th>
                   <th className="px-6 py-4">Status</th>
                   <th className="px-6 py-4 hidden sm:table-cell">Joined</th>
                   <th className="px-6 py-4 text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                 {loading ? (
                   <tr>
                     <td colSpan="4" className="px-6 py-12 text-center text-slate-500">Loading directory...</td>
                   </tr>
                 ) : filteredSubs.length === 0 ? (
                   <tr>
                     <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                       <Mail className="w-8 h-8 mx-auto mb-3 text-slate-300 dark:text-slate-700" />
                       <span className="block mb-2">No subscribers found.</span>
                     </td>
                   </tr>
                 ) : (
                   filteredSubs.map((sub) => (
                     <tr key={sub.id || sub._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                       <td className="px-6 py-4">
                         <div className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                             {sub.email.charAt(0).toUpperCase()}
                           </div>
                           <span className="font-semibold text-slate-900 dark:text-white">{sub.email}</span>
                         </div>
                       </td>
                       <td className="px-6 py-4">
                         <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20">
                           <CheckCircle2 size={12} /> Active
                         </span>
                       </td>
                       <td className="px-6 py-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                          {new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                       </td>
                       <td className="px-6 py-4 text-right">
                          <button
                             onClick={() => setConfirmDelete({ open: true, id: sub.id || sub._id })}
                             className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                          >
                             <Trash2 size={16} />
                          </button>
                       </td>
                     </tr>
                   ))
                 )}
               </tbody>
            </table>
         </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmDelete.open}
        title="Revoke Access"
        message="Are you sure you want to delete this subscriber? They will no longer receive newsletter updates."
        onConfirm={deleteSubscriber}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        confirmText="Revoke"
        isDestructive={true}
      />
    </AdminLayout>
  );
};

export default Subscribers;
