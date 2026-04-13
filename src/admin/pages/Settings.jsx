import React, { useState, useEffect } from 'react';
import AdminLayout from '../layout/AdminLayout';
import { Save, CheckCircle, Code, Settings as SettingsIcon } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { API_BASE_URL, ADMIN_SECRET } from '../../config';

const Settings = () => {
  const [formData, setFormData] = useState({
    siteName: 'NewsForge',
    themeColor: '#000000',
    adsenseScript: '',
    logoUrl: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/settings`);
        if (res.data) setFormData(res.data);
      } catch (err) {
        console.error("Failed to load settings.");
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await axios.put(`${API_BASE_URL}/settings`, formData, {
        headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
      });
      toast.success("Global settings updated");
    } catch (err) {
      toast.error("Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-1">Platform Settings</h1>
          <p className="text-sm text-slate-500">Configure global site preferences and monetization scripts.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <SettingsIcon size={18} className="text-primary" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Brand & Appearance</h2>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Website Name</label>
                   <input 
                     type="text" 
                     value={formData.siteName}
                     onChange={e => setFormData({...formData, siteName: e.target.value})}
                     className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Logo URI</label>
                   <input 
                     type="text" 
                     value={formData.logoUrl}
                     placeholder="https://..."
                     onChange={e => setFormData({...formData, logoUrl: e.target.value})}
                     className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Theme Color Hex</label>
                   <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={formData.themeColor}
                        onChange={e => setFormData({...formData, themeColor: e.target.value})}
                        className="w-10 h-10 p-0 border-none rounded-lg bg-transparent cursor-pointer"
                      />
                      <input 
                        type="text" 
                        value={formData.themeColor}
                        onChange={e => setFormData({...formData, themeColor: e.target.value})}
                        className="flex-1 p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white uppercase font-mono"
                      />
                   </div>
                </div>
             </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-6">
             <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <Code size={18} className="text-green-500" />
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Monetization & AdSense Integration</h2>
             </div>
             
              <div className="space-y-4">
                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Google AdSense Publisher ID</label>
                    <input 
                      type="text" 
                      value={formData.adsensePublisherId || ''}
                      placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                      onChange={e => setFormData({...formData, adsensePublisherId: e.target.value})}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
                    />
                 </div>

                 <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">AdSense Script (Master)</label>
                    <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs rounded-lg mb-2">
                      Paste the <code>&lt;script&gt;</code> block from Google AdSense here. It will be dynamically injected into the head of your public pages.
                    </div>
                    <textarea 
                      value={formData.adsenseScript}
                      onChange={e => setFormData({...formData, adsenseScript: e.target.value})}
                      rows={6}
                      placeholder="<script async src='https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'></script>"
                      className="w-full p-4 bg-slate-900 text-green-400 font-mono text-xs rounded-lg border-none outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                    />
                 </div>
              </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="px-6 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default Settings;
