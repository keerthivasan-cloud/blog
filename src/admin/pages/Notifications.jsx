import React, { useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
import { Send, Bell, RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Notifications = () => {
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'system'
  });
  const [isSending, setIsSending] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.message) return;
    
    setIsSending(true);
    // Simulate sending broadcast
    setTimeout(() => {
      toast.success("Broadcast sent to all active users");
      setIsSending(false);
      setFormData({ title: '', message: '', type: 'system' });
    }, 1500);
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Notifications</h1>
          <p className="text-sm text-slate-500">Dispatch system alerts or promotional payloads to users.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <form onSubmit={handleSend} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <Bell size={18} className="text-primary" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Compose Broadcast</h2>
             </div>
             
             <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Broadcast Type</label>
                   <select 
                     value={formData.type}
                     onChange={e => setFormData({...formData, type: e.target.value})}
                     className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white cursor-pointer"
                   >
                     <option value="system">System Alert (Blue)</option>
                     <option value="success">Feature Launch (Green)</option>
                     <option value="warning">Maintenance (Yellow)</option>
                     <option value="danger">Critical Outage (Red)</option>
                   </select>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notification Title</label>
                   <input 
                     type="text" 
                     value={formData.title}
                     onChange={e => setFormData({...formData, title: e.target.value})}
                     placeholder="e.g. Server Maintenance Window"
                     className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message Body</label>
                   <textarea 
                     value={formData.message}
                     onChange={e => setFormData({...formData, message: e.target.value})}
                     placeholder="Detailed message regarding the broadcast..."
                     rows={4}
                     className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white resize-none"
                   />
                </div>
             </div>

             <button type="submit" disabled={isSending || !formData.title || !formData.message} className="w-full py-3 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                {isSending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                {isSending ? "Dispatching..." : "Send Broadcast Now"}
             </button>
          </form>

          <div>
             <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Preview</h3>
             <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
                {!formData.title && !formData.message ? (
                  <div className="text-center text-slate-400 text-sm py-8">Start typing to see preview...</div>
                ) : (
                  <div className={`p-4 rounded-lg flex items-start gap-4 border
                    ${formData.type === 'system' ? 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-500/10 dark:border-blue-500/20 dark:text-blue-400' : ''}
                    ${formData.type === 'success' ? 'bg-green-50 border-green-200 text-green-800 dark:bg-green-500/10 dark:border-green-500/20 dark:text-green-400' : ''}
                    ${formData.type === 'warning' ? 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-500/10 dark:border-yellow-500/20 dark:text-yellow-400' : ''}
                    ${formData.type === 'danger' ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400' : ''}
                  `}>
                     <Bell className="w-5 h-5 shrink-0 mt-0.5" />
                     <div>
                       <h4 className="font-bold text-sm mb-1">{formData.title || 'Notification Title'}</h4>
                       <p className="text-xs opacity-90 leading-relaxed">{formData.message || 'The detailed message payload goes here.'}</p>
                     </div>
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Notifications;
