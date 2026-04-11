import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Copy, Trash2, LayoutGrid, List, Filter, 
  Upload, Sparkles, Image as ImageIcon, CheckCircle2, X 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_BASE_URL, ADMIN_SECRET } from '../config';
import ConfirmModal from '../components/ConfirmModal';
import { MediaSkeleton } from '../components/SkeletonLoaders';

const AdminMedia = () => {
  const [media, setMedia] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });
  
  const authHeader = { Authorization: `Bearer ${ADMIN_SECRET}` };

  const fetchMedia = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/media?page=${page}&limit=15`, { headers: authHeader });
      setMedia(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      toast.error("Archive Retrieval Failed");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);

    const uploadPromise = axios.post(`${API_BASE_URL}/upload`, formData, {
      headers: { ...authHeader, 'Content-Type': 'multipart/form-data' }
    });

    toast.promise(uploadPromise, {
      loading: 'Synthesizing Asset...',
      success: () => {
        fetchMedia();
        return 'Asset Integration Complete';
      },
      error: 'Upload Failure'
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => setIsDragActive(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragActive(false);
    const file = e.dataTransfer.files[0];
    handleUpload(file);
  };

  const deleteAsset = async () => {
    if (!confirmDelete.id) return;
    try {
      await axios.delete(`${API_BASE_URL}/media/${confirmDelete.id}`, { headers: authHeader });
      toast.success("Asset Purged");
      fetchMedia();
    } catch (err) {
      toast.error("Cleanup Failure");
    }
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("URI Copied to Clipboard", {
      icon: '🔗',
      style: { borderRadius: '15px', background: '#333', color: '#fff' }
    });
  };

  const runSync = async () => {
    setIsSyncing(true);
    try {
      await axios.post(`${API_BASE_URL}/media/sync`, {}, { headers: authHeader });
      toast.success("Index Synchronized with Storage");
      fetchMedia();
    } catch (err) {
      toast.error("Sync Failure");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-4">
        <div>
          <h2 className="text-4xl font-black font-['Outfit'] dark:text-white uppercase tracking-tighter">Media Storage Hub</h2>
          <p className="text-[10px] text-slate-400 dark:text-slate-600 font-bold uppercase tracking-[0.5em] mt-2">
            {total} CLOUD ASSETS DETECTED IN ARCHIVE
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-600 group-focus-within:text-primary transition-colors" />
            <input 
              type="text" 
              placeholder="Filter Archive..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-100 dark:bg-white/5 border border-transparent rounded-2xl p-4 pl-12 text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:border-primary/20 outline-none transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={runSync} 
            disabled={isSyncing}
            className="px-6 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-white/10 transition-all disabled:opacity-50 border-none cursor-pointer"
          >
            {isSyncing ? "Syncing..." : "Sync Storage"}
          </button>
          <label className="primary-btn px-10 py-4 text-[10px] shadow-xl shadow-primary/20 cursor-pointer flex items-center gap-3">
            <Upload className="w-4 h-4" />
            Upload Asset
            <input type="file" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />
          </label>
        </div>
      </div>

      {/* DRAG AND DROP ZONE */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative h-40 rounded-[3rem] border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2
          ${isDragActive ? 'border-primary bg-primary/5 scale-[0.99]' : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50'}
        `}
      >
        {isDragActive ? (
          <>
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-widest text-primary">Release to Synthesize</p>
          </>
        ) : (
          <>
            <ImageIcon className="w-6 h-6 text-slate-400" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Drag & Drop Assets to Auto-Archive</p>
          </>
        )}
      </div>

      {loading ? (
        <MediaSkeleton />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
          {media.filter(m => m.file_name.toLowerCase().includes(searchTerm.toLowerCase())).map((asset) => (
            <div key={asset.id} className="group relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-sm hover:shadow-2xl transition-all aspect-square relative">
               <img src={asset.file_url} alt={asset.file_name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 group-hover:blur-[2px]" />
               
               <div className="absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4 p-8">
                  <button 
                    onClick={() => copyUrl(asset.file_url)}
                    className="w-full py-4 rounded-xl bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest border-none cursor-pointer hover:bg-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy URI
                  </button>
                  <button 
                    onClick={() => setConfirmDelete({ open: true, id: asset.id })}
                    className="w-full py-4 rounded-xl bg-red-600/10 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Purge Asset
                  </button>
               </div>
               
               <div className="absolute bottom-4 left-4 right-4 bg-black/40 backdrop-blur-md p-3 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[8px] font-black text-white/60 uppercase tracking-widest truncate">{asset.file_name}</p>
                  <p className="text-[6px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {(asset.file_size / 1024).toFixed(1)} KB • {new Date(asset.created_at).toLocaleDateString()}
                  </p>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* PAGINATION */}
      {total > 15 && (
        <div className="flex items-center justify-center gap-4 pt-10">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 disabled:opacity-30"
          >
            ←
          </button>
          <span className="text-[10px] font-black uppercase tracking-widest">Page {page} of {Math.ceil(total / 15)}</span>
          <button 
             disabled={page >= Math.ceil(total / 15)}
             onClick={() => setPage(p => p + 1)}
             className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 disabled:opacity-30"
          >
            →
          </button>
        </div>
      )}
      <ConfirmModal 
        isOpen={confirmDelete.open}
        title="Purge Global Asset?"
        message="This operation will physically erase the asset from cloud storage and the metadata index. Links to this URI in existing articles will break."
        onConfirm={deleteAsset}
        onCancel={() => setConfirmDelete({ open: false, id: null })}
      />
    </div>
  );
};

export default AdminMedia;
