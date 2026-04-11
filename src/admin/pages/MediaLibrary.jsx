import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Upload, Search, Copy, Trash2, Image as ImageIcon, Sparkles 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { API_BASE_URL, ADMIN_SECRET } from '../../config';
import ConfirmDialog from '../components/ConfirmDialog';
import AdminLayout from '../layout/AdminLayout';

const MediaLibrary = () => {
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
      toast.error("Failed to load media");
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
      loading: 'Uploading...',
      success: () => {
        fetchMedia();
        return 'Upload successful';
      },
      error: 'Upload Failed'
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
    handleUpload(e.dataTransfer.files[0]);
  };

  const deleteAsset = async () => {
    if (!confirmDelete.id) return;
    try {
      await axios.delete(`${API_BASE_URL}/media/${confirmDelete.id}`, { headers: authHeader });
      toast.success("Asset deleted");
      fetchMedia();
    } catch (err) {
      toast.error("Failed to delete asset");
    }
    setConfirmDelete({ open: false, id: null });
  };

  const copyUrl = (url) => {
    navigator.clipboard.writeText(url);
    toast.success("URL Copied", { icon: '🔗' });
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Media Library</h1>
          <p className="text-sm text-slate-500">Manage your images and assets.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-900 dark:text-white"
            />
          </div>
          <label className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center gap-2 cursor-pointer border-none shadow-sm">
            <Upload size={16} /> Upload Asset
            <input type="file" className="hidden" onChange={(e) => handleUpload(e.target.files[0])} />
          </label>
        </div>
      </div>

      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          mb-8 h-32 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2
          ${isDragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/50'
          }
        `}
      >
        <ImageIcon className={`w-8 h-8 transition-colors ${isDragActive ? 'text-primary' : 'text-slate-400'}`} />
        <p className={`text-sm font-medium transition-colors ${isDragActive ? 'text-primary' : 'text-slate-500'}`}>
          {isDragActive ? 'Drop image here' : 'Drag & Drop files to upload'}
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center p-12 text-slate-400">Loading...</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {media.filter(m => m.file_name.toLowerCase().includes(searchTerm.toLowerCase())).map((asset) => (
            <div key={asset.id} className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm aspect-square transition-all hover:shadow-md">
               <img src={asset.file_url} alt={asset.file_name} className="w-full h-full object-cover" />
               
               <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 p-4 backdrop-blur-[2px]">
                  <button 
                    onClick={() => copyUrl(asset.file_url)}
                    className="w-full py-2 rounded-lg bg-white text-slate-900 text-xs font-medium hover:bg-primary hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Copy size={14} /> Copy URL
                  </button>
                  <button 
                    onClick={() => setConfirmDelete({ open: true, id: asset.id })}
                    className="w-full py-2 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-600 hover:text-white transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
               </div>
               
               <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-900/90 to-transparent p-3 pt-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-[10px] font-medium text-white truncate">{asset.file_name}</p>
                  <p className="text-[9px] text-slate-300 mt-0.5">{(asset.file_size / 1024).toFixed(1)} KB</p>
               </div>
            </div>
          ))}
        </div>
      )}

      {total > 15 && (
        <div className="flex items-center justify-center gap-4 pt-10">
          <button 
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
            className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-600 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Previous
          </button>
          <span className="text-sm font-medium text-slate-500">Page {page} of {Math.ceil(total / 15)}</span>
          <button 
             disabled={page >= Math.ceil(total / 15)}
             onClick={() => setPage(p => p + 1)}
             className="px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-600 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmDialog 
        isOpen={confirmDelete.open}
        title="Delete Image"
        message="Are you sure you want to completely delete this image? It will be removed from your cloud storage and any posts using it may break."
        onConfirm={deleteAsset}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        confirmText="Delete Image"
      />
    </AdminLayout>
  );
};

export default MediaLibrary;
