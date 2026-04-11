import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ChevronLeft, Save, Eye, Layout, Type, Image as LucideImage, 
  FileText, Calendar, User, Clock, CheckCircle, FileWarning, 
  Layers, Tag, AlignLeft, Send, Sparkles, Zap, Plus, Trash2, 
  ChevronUp, ChevronDown, Quote, List as ListIcon, Info
} from 'lucide-react';
import { BlockRenderer } from '../components/ArticlePageComponents';
import API_BASE_URL from '../config';

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

  useEffect(() => {
    if (!isNew) {
      axios.get(`${API_BASE_URL}/articles`)
        .then(res => {
          const article = res.data.find(a => a._id === id || a.slug === id);
          if (article) {
            // Ensure content is an array
            const formattedContent = Array.isArray(article.content) ? article.content : [];
            setFormData({ ...article, content: formattedContent });
          }
        })
        .catch(err => console.error("Archive Retrieval Failure", err));
    }
  }, [id, isNew]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    const authHeader = { Authorization: `Bearer admin123` };
    try {
      if (isNew) {
        await axios.post(`${API_BASE_URL}/articles`, formData, { headers: authHeader });
      } else {
        await axios.put(`${API_BASE_URL}/articles/${formData._id}`, formData, { headers: authHeader });
      }
      navigate('/admin/dashboard');
    } catch (error) {
      console.error("Transmission Error: Failed to save article", error);
    } finally {
      setIsSaving(false);
    }
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
        headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer admin123` }
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
 
      // Heading Detection
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
 
      // Quote Detection
      const quoteMatch = trimmed.match(/^>\s+(.*)/);
      if (quoteMatch) {
        if (currentList) { blocks.push({ type: 'list', items: currentList }); currentList = null; }
        blocks.push({ type: 'quote', text: quoteMatch[1] });
        return;
      }
 
      // List Detection
      const listMatch = trimmed.match(/^[*-]\s+(.*)/);
      if (listMatch) {
        if (!currentList) currentList = [];
        currentList.push(listMatch[1]);
        return;
      }
 
      // Image Detection
      const imageMatch = trimmed.match(/^!\[(.*)\]\((.*)\)/);
      if (imageMatch) {
        if (currentList) { blocks.push({ type: 'list', items: currentList }); currentList = null; }
        blocks.push({ type: 'image', alt: imageMatch[1], url: imageMatch[2] });
        return;
      }
 
      // Insight (Custom) Detection :::insight 
      const insightMatch = trimmed.match(/^:::insight\s+(.*)/);
      if (insightMatch) {
        if (currentList) { blocks.push({ type: 'list', items: currentList }); currentList = null; }
        blocks.push({ type: 'highlight', text: insightMatch[1] });
        return;
      }
 
      // Default Paragraph
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

  // --- BLOCK MANAGEMENT ---
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col overflow-hidden font-['Inter'] transition-colors duration-500">
      <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between z-30 transition-colors duration-500">
        <div className="flex items-center gap-6">
          <Link to="/admin/dashboard" className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-400 group no-underline">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-xl font-black font-['Outfit'] lowercase tracking-tighter uppercase">{isNew ? 'Building New Insight' : 'Optimizing Data Asset'}</h1>
            <p className="text-[9px] text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em] font-black mt-1">Resource ID: {id}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-100 dark:border-slate-700 mr-4">
             {['Write', 'Preview'].map(tab => (
               <button 
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all border-none cursor-pointer ${activeTab === tab ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'}`}
               >
                 {tab}
               </button>
             ))}
          </div>
          <Link
            to="/admin/write"
            className="flex items-center gap-3 px-6 py-3 rounded-2xl bg-orange-600/10 border border-orange-600/20 text-orange-500 text-xs font-black uppercase tracking-widest hover:bg-orange-600 hover:text-white transition-all no-underline"
          >
            <Zap className="w-4 h-4" /> AI Synthesis
          </Link>
          <button onClick={handleSubmit} disabled={isSaving} className="primary-btn flex items-center gap-3 px-8 py-3 rounded-2xl shadow-[0_10px_30px_rgba(249,115,22,0.2)] disabled:opacity-50">
            {isSaving ? <Sparkles className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} 
            {isNew ? 'Initialize Archive' : 'Sync Changes'}
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        <main className={`flex-1 overflow-y-auto p-12 transition-all duration-700 bg-white dark:bg-slate-950 ${activeTab === 'Preview' ? 'max-w-0 opacity-0 invisible overflow-hidden' : 'w-full'}`}>
          <div className="max-w-4xl mx-auto space-y-20 pb-60">
            
            {/* 1. Header Information */}
            <div className="space-y-12">
               <div className="space-y-6 text-left">
                  <label className="text-[10px] uppercase tracking-[0.4em] text-primary font-black ml-4">Primary Headline</label>
                  <input 
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-none text-6xl font-black font-['Outfit'] placeholder:text-slate-100 dark:placeholder:text-slate-900 outline-none p-4 dark:text-white"
                    placeholder="Article Title..."
                  />
                  <div className="flex items-center gap-4 px-4 text-xs font-bold text-slate-300 dark:text-slate-700">
                     <span>Resource Slug:</span>
                     <input name="slug" value={formData.slug} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-1 text-primary outline-none focus:border-primary/40 transition-all font-['Inter']" placeholder="article-slug" />
                  </div>
               </div>

               <div className="bg-slate-50 dark:bg-slate-900 p-10 rounded-[4rem] border border-slate-100 dark:border-slate-800 space-y-12 shadow-sm">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="space-y-4 text-left">
                        <label className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 font-black px-4">Segment Node</label>
                        <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer dark:text-white">
                          {['Intelligence', 'Tech', 'Business', 'Finance', 'Global-Market', 'Commodities'].map(cat => <option key={cat}>{cat}</option>)}
                        </select>
                     </div>
                     <div className="space-y-4 text-left">
                        <label className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 font-black px-4">Sync Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer dark:text-white">
                          <option value="published">Broadcast Live</option>
                          <option value="draft">Internal Buffer</option>
                        </select>
                     </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-200/50 dark:border-slate-800">
                     <EditorInput label="Contributor" name="author" value={formData.author} icon={<User className="w-4 h-4" />} onChange={handleInputChange} />
                     <EditorInput label="Read Delta (m)" name="readTime" value={formData.readTime} icon={<Clock className="w-4 h-4" />} onChange={handleInputChange} />
                  </div>
                  <EditorInput 
                    label="Hero Asset URI" 
                    name="image" 
                    value={formData.image} 
                    icon={<LucideImage className="w-4 h-4" />} 
                    onChange={handleInputChange} 
                    fullWidth 
                    showUpload
                    onFileUpload={handleFileUpload}
                  />
                  
                  <div className="space-y-4 text-left">
                    <label className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 font-black px-6">Transmission Abstract</label>
                    <textarea name="excerpt" value={formData.excerpt} onChange={handleInputChange} rows="3" className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 text-sm outline-none resize-none font-bold leading-relaxed text-slate-500 dark:text-slate-400" placeholder="Brief summary for indexing..." />
                  </div>
               </div>
            </div>

            {/* 2. Structured Block Editor */}
            <div className="space-y-12">
               <div className="flex items-center justify-between px-4">
                  <div className="flex items-center gap-4">
                    <div className="w-2 h-8 bg-primary rounded-full" />
                    <h2 className="text-3xl font-black font-['Outfit'] uppercase tracking-tight">Structured Content Engine</h2>
                  </div>
                  <div className="flex gap-2">
                    <BlockAction type="paragraph" icon={<Type className="w-4 h-4" />} label="Para" onClick={() => addBlock('paragraph')} />
                    <BlockAction type="heading" icon={<AlignLeft className="w-4 h-4" />} label="Head" onClick={() => addBlock('heading')} />
                    <BlockAction type="list" icon={<ListIcon className="w-4 h-4" />} label="List" onClick={() => addBlock('list')} />
                    <BlockAction type="quote" icon={<Quote className="w-4 h-4" />} label="Quote" onClick={() => addBlock('quote')} />
                    <BlockAction type="highlight" icon={<Sparkles className="w-4 h-4" />} label="Insight" onClick={() => addBlock('highlight')} />
                    <BlockAction type="image" icon={<LucideImage className="w-4 h-4" />} label="Asset" onClick={() => addBlock('image')} />
                    <div className="w-px h-10 bg-slate-100 dark:bg-slate-800 self-center mx-2" />
                    <label className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all group border-none bg-transparent cursor-pointer">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all">
                        <FileText className="w-4 h-4" />
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors mono">Import MD</span>
                      <input type="file" className="hidden" accept=".md" onChange={handleMarkdownUpload} />
                    </label>
                  </div>
               </div>

               <div className="space-y-8">
                  <AnimatePresence initial={false}>
                    {formData.content.map((block, idx) => (
                      <motion.div 
                        key={idx}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="group relative bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 shadow-sm hover:shadow-xl transition-all duration-500"
                      >
                        {/* Block Controls */}
                        <div className="absolute -left-16 top-1/2 -translate-y-1/2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                           <button onClick={() => moveBlock(idx, -1)} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-primary transition-all cursor-pointer"><ChevronUp className="w-4 h-4" /></button>
                           <button onClick={() => moveBlock(idx, 1)} className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-400 hover:text-primary transition-all cursor-pointer"><ChevronDown className="w-4 h-4" /></button>
                        </div>
                        <button onClick={() => removeBlock(idx)} className="absolute -right-6 top-6 p-4 rounded-2xl bg-white dark:bg-slate-800 border border-red-50 dark:border-red-900/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 hover:text-white cursor-pointer"><Trash2 className="w-4 h-4" /></button>

                        <div className="flex items-center gap-3 mb-8">
                           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700">{block.type}</span>
                           <div className="h-px flex-1 bg-slate-50 dark:bg-slate-800/50" />
                        </div>

                        {/* Block Specific Editors */}
                        <div className="text-left">
                          {block.type === 'paragraph' && (
                            <textarea 
                              value={block.text} 
                              onChange={(e) => updateBlock(idx, { text: e.target.value })} 
                              className="w-full bg-transparent border-none text-xl leading-relaxed text-slate-600 dark:text-slate-400 outline-none resize-none font-medium" 
                              placeholder="Describe the technical paradigm..." 
                              rows="4"
                            />
                          )}

                          {block.type === 'heading' && (
                            <div className="flex flex-col gap-6">
                               <div className="flex gap-4">
                                  {[2, 3].map(level => (
                                    <button 
                                      key={level}
                                      onClick={() => updateBlock(idx, { level })}
                                      className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${block.level === level ? 'bg-primary border-primary text-white shadow-lg shadow-orange-500/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}
                                    >
                                      H{level}
                                    </button>
                                  ))}
                               </div>
                               <input 
                                 value={block.text} 
                                 onChange={(e) => updateBlock(idx, { text: e.target.value })} 
                                 className="w-full bg-transparent border-none text-3xl font-black font-['Outfit'] text-slate-900 dark:text-white outline-none" 
                                 placeholder="Section Title..." 
                               />
                            </div>
                          )}

                          {block.type === 'list' && (
                            <div className="space-y-4">
                               {block.items.map((item, iIndex) => (
                                 <div key={iIndex} className="flex items-center gap-4 group/item">
                                    <div className="w-2 h-2 bg-primary rounded-full" />
                                    <input 
                                      value={item} 
                                      onChange={(e) => updateListItem(idx, iIndex, e.target.value)} 
                                      className="flex-1 bg-transparent border-none text-xl text-slate-600 dark:text-slate-400 outline-none font-medium" 
                                      placeholder="List parameter..." 
                                    />
                                    <button onClick={() => removeListItem(idx, iIndex)} className="p-2 text-slate-200 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-opacity border-none bg-transparent cursor-pointer"><Trash2 className="w-3 h-3" /></button>
                                 </div>
                               ))}
                               <button onClick={() => addListItem(idx)} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mt-6 group border-none bg-transparent cursor-pointer">
                                 <Plus className="w-4 h-4 p-1 rounded-full bg-primary/10 group-hover:scale-110 transition-transform" /> Add Component
                               </button>
                            </div>
                          )}

                          {block.type === 'quote' && (
                            <div className="flex gap-6 items-start">
                               <Quote className="w-10 h-10 text-primary opacity-20 shrink-0" />
                               <textarea 
                                 value={block.text} 
                                 onChange={(e) => updateBlock(idx, { text: e.target.value })} 
                                 className="w-full bg-transparent border-none text-2xl font-black italic font-['Outfit'] text-slate-700 dark:text-white outline-none resize-none" 
                                 placeholder="Strategic verbatim..." 
                                 rows="3"
                               />
                            </div>
                          )}

                          {block.type === 'highlight' && (
                            <div className="flex gap-6 items-start bg-primary/5 p-8 rounded-3xl border border-primary/10">
                               <Sparkles className="w-8 h-8 text-primary shrink-0" />
                               <textarea 
                                 value={block.text} 
                                 onChange={(e) => updateBlock(idx, { text: e.target.value })} 
                                 className="w-full bg-transparent border-none text-lg font-black text-slate-900 dark:text-white outline-none resize-none leading-relaxed" 
                                 placeholder="Mission-critical insight..." 
                                 rows="3"
                               />
                            </div>
                          )}

                          {block.type === 'image' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                               <div className="space-y-4">
                                  <label className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Asset URL</label>
                                  <input 
                                    value={block.url} 
                                    onChange={(e) => updateBlock(idx, { url: e.target.value })} 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-4 rounded-xl text-xs font-bold font-['Inter'] dark:text-white outline-none focus:ring-2 focus:ring-primary/20" 
                                    placeholder="https://images.unsplash.com/..." 
                                  />
                               </div>
                               <div className="space-y-4">
                                  <label className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-400">Meta/Alt Text</label>
                                  <input 
                                    value={block.alt} 
                                    onChange={(e) => updateBlock(idx, { alt: e.target.value })} 
                                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 p-4 rounded-xl text-xs font-bold font-['Inter'] dark:text-white outline-none focus:ring-2 focus:ring-primary/20" 
                                    placeholder="Asset description for SEO..." 
                                  />
                               </div>
                               {block.url && (
                                 <div className="md:col-span-2 rounded-2xl overflow-hidden h-40 bg-slate-100 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                                    <img src={block.url} className="w-full h-full object-cover opacity-50 contrast-125 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700" alt="Block Preview" />
                                 </div>
                               )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
               </div>

               {/* Add Block Footer */}
               <div className="pt-20 border-t border-slate-100 dark:border-slate-900 text-center">
                  <div className="inline-flex gap-4 p-4 rounded-3xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <BlockAction type="paragraph" icon={<Type className="w-4 h-4" />} label="Para" onClick={() => addBlock('paragraph')} />
                    <BlockAction type="heading" icon={<AlignLeft className="w-4 h-4" />} label="Head" onClick={() => addBlock('heading')} />
                    <BlockAction type="list" icon={<ListIcon className="w-4 h-4" />} label="List" onClick={() => addBlock('list')} />
                    <BlockAction type="quote" icon={<Quote className="w-4 h-4" />} label="Quote" onClick={() => addBlock('quote')} />
                    <BlockAction type="highlight" icon={<Sparkles className="w-4 h-4" />} label="Insight" onClick={() => addBlock('highlight')} />
                    <BlockAction type="image" icon={<LucideImage className="w-4 h-4" />} label="Asset" onClick={() => addBlock('image')} />
                  </div>
               </div>
            </div>
          </div>
        </main>

        {/* Preview Pane */}
        <section className={`flex-1 bg-white dark:bg-slate-950 overflow-y-auto p-16 transition-all duration-1000 border-l border-slate-100 dark:border-slate-900 ${activeTab === 'Write' ? 'max-w-0 opacity-0 invisible overflow-hidden lg:block lg:opacity-20 lg:blur-3xl' : 'opacity-100 visible translate-x-0 w-full'}`}>
          <div className="max-w-3xl mx-auto space-y-16 pb-40 text-left">
             <div className="flex items-center gap-6">
                <span className="bg-primary/10 text-primary px-6 py-2.5 rounded-full text-[10px] uppercase font-black tracking-[0.3em] border border-primary/20">{formData.category} Protocol</span>
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${formData.status === 'published' ? 'text-green-500' : 'text-orange-400'}`}>
                   <Zap className="w-3.5 h-3.5" /> {formData.status}
                </span>
             </div>
             <h2 className="text-8xl font-black font-['Outfit'] leading-[0.9] text-slate-950 dark:text-white -tracking-tighter uppercase">{formData.title || 'NULL DRAFT'}</h2>
             <div className="flex items-center gap-10 border-y border-slate-100 dark:border-slate-900 py-12 font-black text-[10px] uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700">
                <div className="flex items-center gap-3 text-slate-900 dark:text-white"><div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850 flex items-center justify-center">{formData.author?.[0]}</div>{formData.author}</div>
                <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-primary" />{new Date().toLocaleDateString()}</div>
                <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-primary" />{formData.readTime}M ARCHIVE</div>
             </div>
             <div className="relative group rounded-[4rem] overflow-hidden shadow-2xl dark:shadow-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                <img src={formData.image} className="w-full h-[650px] object-cover transition-transform duration-1000 group-hover:scale-105" />
             </div>
             <div className="prose-preview">
                <BlockRenderer blocks={formData.content} />
             </div>
          </div>
        </section>
      </div>
    </div>
  );
};

const EditorInput = ({ label, name, value, icon, onChange, fullWidth, showUpload, onFileUpload }) => (
  <div className={`space-y-4 ${fullWidth ? 'w-full' : ''} text-left`}>
    <label className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 font-black px-8">{label}</label>
    <div className="relative">
       <div className="absolute left-8 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700">{icon}</div>
       <input name={name} value={value} onChange={onChange} className="w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 pl-16 text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all font-['Inter']" />
       {showUpload && (
         <label className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all cursor-pointer">
           <Send className="w-4 h-4" />
           <input type="file" className="hidden" onChange={onFileUpload} accept="image/*" />
         </label>
       )}
    </div>
  </div>
);

const BlockAction = ({ icon, label, onClick, type }) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-2 p-3 rounded-2xl hover:bg-white dark:hover:bg-slate-800 transition-all group border-none bg-transparent cursor-pointer"
  >
    <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-all">
      {icon}
    </div>
    <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{label}</span>
  </button>
);

export default AdminEditor;
