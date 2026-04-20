import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, Save, Eye, Layout, Type, Image as LucideImage, 
  FileText, Calendar, User, Clock, CheckCircle, FileWarning, 
  Layers, Tag, AlignLeft, Send, Sparkles, Zap, Plus, Trash2, 
  ChevronUp, ChevronDown, Quote, List as ListIcon, Info, History, X, RotateCcw,
  Check
} from 'lucide-react';
import { BlockRenderer } from '../../components/ArticlePageComponents';
import API_BASE_URL, { ADMIN_SECRET } from '../../config';
import VersionModal from '../../components/VersionModal';
import { toast } from 'react-hot-toast';
import AdminLayout from '../layout/AdminLayout';

const CustomSelect = ({ label, value, options, onChange, icon }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="space-y-4 text-left relative">
      <label className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 font-black px-8">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-white/5 rounded-[2rem] p-6 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-all shadow-sm group"
      >
        <div className="flex items-center gap-4">
          <div className="text-slate-300 dark:text-slate-700 group-hover:text-primary transition-colors">{icon}</div>
          <span className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">{value}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-300 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-[100]" onClick={() => setIsOpen(false)} />
            <motion.div 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute left-0 right-0 top-full mt-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 rounded-[2rem] shadow-2xl z-[110] overflow-hidden p-3"
            >
              {options.map(opt => (
                <div 
                  key={opt}
                  onClick={() => { onChange(opt); setIsOpen(false); }}
                  className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${opt === value ? 'bg-primary text-white shadow-lg' : 'hover:bg-slate-50 dark:hover:bg-white/5 text-slate-600 dark:text-slate-300'}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-widest">{opt}</span>
                  {opt === value && <Check className="w-3.5 h-3.5" />}
                </div>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const AdminEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = id === 'new';

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    category: 'Tech',
    author: 'vynexsol Intelligence',
    readTime: 5,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    content: [],
    status: 'published',
    excerpt: ''
  });

  const [activeTab, setActiveTab] = useState('Write');
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [showLibrary, setShowLibrary] = useState(null); // 'cover' or block index (number)
  const [libraryMedia, setLibraryMedia] = useState([]);
  const [librarySearch, setLibrarySearch] = useState('');

  const authHeader = { Authorization: `Bearer ${ADMIN_SECRET}` };

  const fetchVersions = async () => {
    if (isNew) return;
    setLoadingVersions(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/articles/${id}/versions`, {
        headers: { Authorization: `Bearer ${ADMIN_SECRET}` }
      });
      setVersions(res.data);
    } catch (err) {
      console.error("History retrieval failure", err);
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleRestore = async (versionId) => {
    const restorePromise = (async () => {
      await axios.post(`${API_BASE_URL}/articles/${id}/restore`, { version_id: versionId }, {
        headers: authHeader
      });
      window.location.reload();
    })();

    toast.promise(restorePromise, {
      loading: 'Initiating Temporal Restoration...',
      success: 'Timeline Restored',
      error: 'Restoration Failure'
    });
  };

  const fetchLibrary = (target) => {
    setShowLibrary(target);
    if (libraryMedia.length === 0) {
      axios.get(`${API_BASE_URL}/media`, { headers: authHeader })
        .then(res => setLibraryMedia(res.data.data))
        .catch(() => toast.error("Library Access Denied"));
    }
  };

  const handleLibrarySelect = (url) => {
    if (showLibrary === 'cover') {
      setFormData({ ...formData, image: url });
    } else if (typeof showLibrary === 'number') {
      updateBlock(showLibrary, { url });
    }
    setShowLibrary(null);
  };

  useEffect(() => {
    if (showHistory) fetchVersions();
  }, [showHistory]);

  useEffect(() => {
    if (!isNew) {
      axios.get(`${API_BASE_URL}/articles/${id}`)
        .then(res => {
          const article = res.data;
          if (article) {
            const formattedContent = Array.isArray(article.content) ? article.content : [];
            setFormData({ ...article, content: formattedContent });
          }
        })
        .catch(err => {
          if (!err?.isDuplicate) {
             console.error("Archive Retrieval Failure", err);
             alert("Failed to retrieve asset from archive.");
          }
        });
    }
  }, [id, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const savePromise = (async () => {
      if (isNew) {
        await axios.post(`${API_BASE_URL}/articles`, formData, { headers: authHeader });
      } else {
        const articleId = formData.id || formData._id;
        await axios.put(`${API_BASE_URL}/articles/${articleId}`, formData, { headers: authHeader });
      }
      navigate('/admin/dashboard');
    })();

    toast.promise(savePromise, {
      loading: 'Archiving Intelligence Node...',
      success: 'Deployment Successful',
      error: 'Archive Update Failed'
    }).finally(() => setIsSaving(false));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const res = await axios.post(`${API_BASE_URL}/upload`, uploadData, {
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${ADMIN_SECRET}` }
      });
      setFormData(prev => ({ ...prev, image: res.data.url }));
    } catch (err) {
      console.error("Upload Failure", err);
      alert("Failed to upload image. Resource denied.");
    }
  };
 
  const parseMarkdownToBlocks = (text) => {
    const lines = text.split('\n');
    const blocks = [];
    let currentList = null;
 
    lines.forEach(line => {
      const trimmed = line.trim();
      if (!trimmed) {
        if (currentList) {
          blocks.push({ type: 'list', items: currentList });
          currentList = null;
        }
        return;
      }
 
      const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)/);
      if (headingMatch) {
        if (currentList) { blocks.push({ type: 'list', items: currentList }); currentList = null; }
        const level = headingMatch[1].length;
        blocks.push({ type: 'heading', level: Math.min(level + 1, 3), text: headingMatch[2] });
        if (level === 1 && !formData.title) {
          setFormData(prev => ({ ...prev, title: headingMatch[2], slug: headingMatch[2].toLowerCase().replace(/\s+/g, '-') }));
        }
        return;
      }
 
      const quoteMatch = trimmed.match(/^>\s+(.*)/);
      if (quoteMatch) {
        if (currentList) { blocks.push({ type: 'list', items: currentList }); currentList = null; }
        blocks.push({ type: 'quote', text: quoteMatch[1] });
        return;
      }
 
      const listMatch = trimmed.match(/^[*-]\s+(.*)/);
      if (listMatch) {
        if (!currentList) currentList = [];
        currentList.push(listMatch[1]);
        return;
      }
 
      const imageMatch = trimmed.match(/^!\[(.*)\]\((.*)\)/);
      if (imageMatch) {
        if (currentList) { blocks.push({ type: 'list', items: currentList }); currentList = null; }
        blocks.push({ type: 'image', alt: imageMatch[1], url: imageMatch[2] });
        return;
      }
 
      const insightMatch = trimmed.match(/^:::insight\s+(.*)/);
      if (insightMatch) {
        if (currentList) { blocks.push({ type: 'list', items: currentList }); currentList = null; }
        blocks.push({ type: 'highlight', text: insightMatch[1] });
        return;
      }
 
      if (currentList) { blocks.push({ type: 'list', items: currentList }); currentList = null; }
      blocks.push({ type: 'paragraph', text: trimmed });
    });
 
    if (currentList) blocks.push({ type: 'list', items: currentList });
    return blocks;
  };
 
  const handleMarkdownUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
 
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const parsedBlocks = parseMarkdownToBlocks(content);
      setFormData(prev => ({
        ...prev,
        content: [...prev.content, ...parsedBlocks]
      }));
    };
    reader.readAsText(file);
  };

  const addBlock = (type) => {
    const newBlock = { type };
    if (type === 'paragraph' || type === 'quote' || type === 'highlight') newBlock.text = '';
    if (type === 'heading') { newBlock.text = ''; newBlock.level = 2; }
    if (type === 'list') newBlock.items = [''];
    if (type === 'image') { newBlock.url = ''; newBlock.alt = ''; }
    
    setFormData(prev => ({
      ...prev,
      content: [...prev.content, newBlock]
    }));
  };

  const removeBlock = (index) => {
    setFormData(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
  };

  const moveBlock = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= formData.content.length) return;
    
    const newContent = [...formData.content];
    [newContent[index], newContent[newIndex]] = [newContent[newIndex], newContent[index]];
    
    setFormData(prev => ({ ...prev, content: newContent }));
  };

  const updateBlock = (index, data) => {
    setFormData(prev => {
      const newContent = [...prev.content];
      newContent[index] = { ...newContent[index], ...data };
      return { ...prev, content: newContent };
    });
  };

  const updateListItem = (blockIndex, itemIndex, value) => {
    setFormData(prev => {
      const newContent = [...prev.content];
      const newItems = [...newContent[blockIndex].items];
      newItems[itemIndex] = value;
      newContent[blockIndex].items = newItems;
      return { ...prev, content: newContent };
    });
  };

  const addListItem = (blockIndex) => {
    setFormData(prev => {
      const newContent = [...prev.content];
      newContent[blockIndex].items = [...newContent[blockIndex].items, ''];
      return { ...prev, content: newContent };
    });
  };

  const removeListItem = (blockIndex, itemIndex) => {
    setFormData(prev => {
      const newContent = [...prev.content];
      newContent[blockIndex].items = newContent[blockIndex].items.filter((_, i) => i !== itemIndex);
      return { ...prev, content: newContent };
    });
  };

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-5 md:px-8 py-8 md:py-12">
        {/* Header Strip */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 pb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-4">
            <Link to="/admin/dashboard" className="p-2 border rounded-xl hover:bg-[var(--bg-soft)] transition-colors no-underline" style={{ borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                {isNew ? 'New Editorial Draft' : 'Editing: ' + (formData.title || 'Untitled Node')}
              </h1>
              <div className="flex items-center gap-2 mt-2 text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                {isNew ? 'Draft Node Status: Uninitialized' : <>Status: <span style={{ color: formData.status === 'published' ? 'var(--green)' : 'var(--orange)' }}>{formData.status}</span></>}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             {!isNew && (
               <button onClick={() => setShowHistory(true)} className="btn-ghost flex items-center gap-2 text-xs py-2 px-4 shadow-sm" style={{ border: '1px solid var(--border)' }}>
                 <History className="w-4 h-4" /> History
               </button>
             )}
            <button 
               onClick={handleSubmit} 
               disabled={isSaving}
               className="btn-primary py-2 px-6 flex items-center gap-2 text-xs"
            >
              <Save className="w-4 h-4" /> {isSaving ? 'Syncing...' : 'Publish'}
            </button>
          </div>
        </header>

        {/* Tab Strip */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar mb-8 border-b" style={{ borderColor: 'var(--border)' }}>
        {['Write', 'Meta', 'Media'].map((tab) => (
           <button 
             key={tab}
             onClick={() => setActiveTab(tab)}
             className="shrink-0 px-6 py-3.5 text-sm font-medium transition-colors border-b-2 bg-transparent cursor-pointer"
             style={{
               color: activeTab === tab ? 'var(--accent)' : 'var(--text-muted)',
               borderColor: activeTab === tab ? 'var(--accent)' : 'transparent',
               fontWeight: activeTab === tab ? 700 : 500,
             }}
           >
             {tab}
           </button>
        ))}
        </div>

        {/* Subpanels wrapped correctly */}
        {activeTab === 'Write' && (
           <div className="space-y-6 max-w-4xl">
              <input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Story Headline"
                className="w-full text-3xl md:text-5xl font-bold bg-transparent border-none outline-none placeholder:opacity-30 mb-8"
                style={{ color: 'var(--text-primary)' }}
              />
              <div className="space-y-6">
                 {formData.content.map((block, idx) => (
                    <div key={idx} className="group relative">
                       {block.type === 'paragraph' && (
                          <textarea
                             value={block.text}
                             onChange={(e) => updateBlock(idx, { text: e.target.value })}
                             placeholder="Start typing your paragraph here..."
                             className="w-full text-lg leading-relaxed bg-transparent border-none outline-none resize-none min-h-[100px] overflow-hidden rounded-xl p-4 transition-colors hover:bg-[var(--bg-soft)] focus:bg-[var(--bg-soft)]"
                             style={{ color: 'var(--text-primary)' }}
                          />
                       )}
                       {block.type === 'heading' && (
                          <input
                             value={block.text}
                             onChange={(e) => updateBlock(idx, { text: e.target.value })}
                             placeholder="Heading"
                             className={`w-full font-bold bg-transparent border-none outline-none rounded-xl p-4 transition-colors hover:bg-[var(--bg-soft)] focus:bg-[var(--bg-soft)] ${block.level === 2 ? 'text-3xl' : 'text-2xl'}`}
                             style={{ color: 'var(--text-primary)' }}
                          />
                       )}
                       <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => {
                            const newContent = formData.content.filter((_, i) => i !== idx);
                            setFormData(prev => ({ ...prev, content: newContent }));
                         }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer bg-white shadow-sm border" style={{ borderColor: 'var(--border)' }}>
                           <Trash2 className="w-4 h-4" />
                         </button>
                       </div>
                    </div>
                 ))}
                 
                 <div className="flex gap-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
                     <button onClick={() => addBlock('paragraph')} className="btn-ghost flex items-center gap-2 text-xs px-4" style={{ border: '1px solid var(--border)' }}><Type className="w-4 h-4"/> Paragraph</button>
                     <button onClick={() => addBlock('heading')} className="btn-ghost flex items-center gap-2 text-xs px-4" style={{ border: '1px solid var(--border)' }}><AlignLeft className="w-4 h-4"/> Heading</button>
                 </div>
              </div>
           </div>
        )}
        
        {activeTab === 'Meta' && (
           <div className="max-w-2xl space-y-6">
              <div className="space-y-2">
                 <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Excerpt</label>
                 <textarea 
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    placeholder="Short summary for SEO and preview cards..."
                    className="input w-full min-h-[100px] text-sm"
                 />
              </div>
              <div className="grid grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Category</label>
                   <select name="category" value={formData.category} onChange={handleInputChange} className="input w-full text-sm">
                      {['All', 'General News', 'Tech', 'Business', 'Finance', 'Markets', 'Commodities'].map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Read Time (mins)</label>
                   <input type="number" name="readTime" value={formData.readTime} onChange={handleInputChange} className="input w-full text-sm" />
                 </div>
              </div>
              <div className="space-y-2">
                 <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</label>
                 <select name="status" value={formData.status} onChange={handleInputChange} className="input w-full text-sm">
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                 </select>
              </div>
           </div>
        )}

        {activeTab === 'Media' && (
           <div className="max-w-4xl">
              <div className="space-y-4">
                 <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Cover Image Thumbnail</label>
                 <div className="border-2 border-dashed rounded-2xl p-6 text-center" style={{ borderColor: 'var(--border)', background: 'var(--bg-soft)' }}>
                    {formData.image && <img src={formData.image} alt="Cover Preview" className="w-full h-64 object-cover rounded-xl mb-4" />}
                    <div className="flex justify-center gap-4">
                       <label className="btn-primary cursor-pointer py-2 px-6 text-sm">
                          <LucideImage className="w-4 h-4 mr-2" /> Upload Asset
                          <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e)} />
                       </label>
                       <button onClick={() => fetchLibrary('cover')} className="btn-ghost py-2 px-6 border text-sm" style={{ borderColor: 'var(--border)' }}>
                          Browse Library
                       </button>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>

      <VersionModal 
        isOpen={showHistory} 
        onClose={() => setShowHistory(false)} 
        versions={versions} 
        onRestore={handleRestore}
        loading={loadingVersions}
      />
    </AdminLayout>
  );
};

export default AdminEditor;
