import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Navbar, Footer } from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, FileText, Link as LinkIcon, Tag, Layout, 
  CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, 
  PenTool, Eye, FileEdit, Globe, Plus, Trash2, 
  ChevronUp, ChevronDown, Type, AlignLeft, List as ListIcon, 
  Quote, Sparkles, Zap, Calendar, Clock, User, BookOpen, HelpCircle
} from "lucide-react";
import { BlockRenderer } from '../components/ArticlePageComponents';

export default function Admin() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "Tech",
    content: [],
    keyInsight: "",
    bullets: ["", "", ""],
    eli5: "",
    author: "vynexsol Intelligence", 
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop", 
    readTime: "5",
    status: "published",
    excerpt: ""
  });

  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState({ type: null, message: "" });
  const [activeTab, setActiveTab] = useState('Write');

  const generateSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") 
      .replace(/\s+/g, "-")      
      .replace(/--+/g, "-")      
      .trim();

  useEffect(() => {
    if (form.title && !form.slug) {
      setForm(prev => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }, [form.title]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("image", file);
    
    setUploading(true);
    try {
      const res = await axios.post("http://localhost:5001/api/upload", formData);
      setForm(prev => ({ ...prev, image: res.data.url }));
    } catch (err) {
      setStatus({ type: "error", message: "IMAGE UPLOAD FAILED" });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.content.length === 0) {
      setStatus({ type: "error", message: "RESOURCE ERROR: TERMINAL REQUIRES CONTENT BLOCKS." });
      return;
    }

    setLoading(true);
    setStatus({ type: null, message: "" });
    
    try {
      await axios.post("http://localhost:5001/api/articles", form);
      setStatus({ type: "success", message: `ARTICLE BROADCAST SUCCESSFUL: NODE SYNCHRONIZED.` });
      setForm({
        title: "",
        slug: "",
        category: "Tech",
        content: [],
        keyInsight: "",
        bullets: ["", "", ""],
        eli5: "",
        author: "vynexsol Intelligence",
        image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
        readTime: "5",
        status: "published",
        excerpt: ""
      });
    } catch (error) {
      console.error("Publish error:", error);
      setStatus({ type: "error", message: error.response?.data?.message || "TRANSMISSION FAILURE: NODE REJECTED SYNC." });
    } finally {
      setLoading(false);
    }
  };

  const addBlock = (type) => {
    const newBlock = { type };
    if (type === 'paragraph' || type === 'quote' || type === 'highlight') newBlock.text = '';
    if (type === 'heading') { newBlock.text = ''; newBlock.level = 2; }
    if (type === 'list') newBlock.items = [''];
    if (type === 'image') { newBlock.url = ''; newBlock.alt = ''; }
    
    setForm(prev => ({
      ...prev,
      content: [...prev.content, newBlock]
    }));
  };

  const removeBlock = (index) => {
    setForm(prev => ({
      ...prev,
      content: prev.content.filter((_, i) => i !== index)
    }));
  };

  const moveBlock = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= form.content.length) return;
    const newContent = [...form.content];
    [newContent[index], newContent[newIndex]] = [newContent[newIndex], newContent[index]];
    setForm(prev => ({ ...prev, content: newContent }));
  };

  const updateBlock = (index, data) => {
    setForm(prev => {
      const newContent = [...prev.content];
      newContent[index] = { ...newContent[index], ...data };
      return { ...prev, content: newContent };
    });
  };

  const updateListItem = (blockIndex, itemIndex, value) => {
    setForm(prev => {
      const newContent = [...prev.content];
      const newItems = [...newContent[blockIndex].items];
      newItems[itemIndex] = value;
      newContent[blockIndex].items = newItems;
      return { ...prev, content: newContent };
    });
  };

  const QuickBlock = ({ icon, onClick }) => (
    <button type="button" onClick={onClick} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all border-none cursor-pointer">{icon}</button>
  );

  const ActionButton = ({ icon, label, onClick }) => (
    <button type="button" onClick={onClick} className="px-8 py-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:border-primary transition-all cursor-pointer">
      {icon} {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-500 font-['Inter']">
      <Navbar />
      
      <main className="max-w-[1600px] mx-auto px-6 py-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          
          <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 mb-16 text-left">
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-xl shadow-orange-500/5 transition-all hover:rotate-12 group">
                <PenTool className="w-10 h-10 text-[#f97316] group-hover:scale-110 transition-transform" />
              </div>
              <div>
                <h1 className="text-5xl md:text-6xl font-black font-['Outfit'] tracking-tighter dark:text-white uppercase leading-none">Editorial Terminal</h1>
                <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.5em] mt-4 flex items-center gap-3">
                  <Zap className="w-3 h-3 text-primary" /> Integrated Block Engine v4.0.1
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex bg-white dark:bg-slate-900 p-2 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
                {['Write', 'Preview'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-none cursor-pointer ${activeTab === tab ? 'bg-primary text-white shadow-lg shadow-orange-500/20 translate-y-[-1px]' : 'text-slate-400 hover:text-slate-900 dark:hover:text-white bg-transparent'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              <div className="w-px h-10 bg-slate-200 dark:bg-slate-800" />
              <div className="flex bg-slate-100 dark:bg-slate-900 p-2 rounded-3xl border border-slate-100 dark:border-slate-800">
                <button onClick={() => setForm({...form, status: 'published'})} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none flex items-center gap-2 ${form.status === 'published' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 bg-transparent'}`}><Globe className="w-3.5 h-3.5" /> Live</button>
                <button onClick={() => setForm({...form, status: 'draft'})} className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none flex items-center gap-2 ${form.status === 'draft' ? 'bg-white dark:bg-slate-800 text-slate-400 shadow-sm' : 'text-slate-400 bg-transparent'}`}><FileEdit className="w-3.5 h-3.5" /> Buffer</button>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            <div className={`lg:col-span-8 space-y-12 transition-all duration-700 ${activeTab === 'Preview' ? 'opacity-30 blur-sm pointer-events-none grayscale' : ''}`}>
               
               <div className="bg-white dark:bg-slate-900 p-12 md:p-16 rounded-[4rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none space-y-12 transition-colors duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-left">
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-3 ml-4">
                        <FileText className="w-4 h-4" /> Insight Identifier (Headline)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="ENTER PINNACLE HEADLINE..."
                        className="w-full bg-slate-50 dark:bg-slate-800/30 border-none rounded-[2rem] p-10 text-3xl font-black font-['Outfit'] placeholder:text-slate-100 dark:placeholder:text-slate-800 outline-none focus:ring-8 focus:ring-primary/5 transition-all dark:text-white uppercase tracking-tight"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                      />
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-black tracking-widest text-slate-400">Hero Intelligence Asset (Image URL or Local Upload)</label>
                        <div className="flex gap-4">
                          <input
                            type="text"
                            className="flex-1 bg-slate-100 dark:bg-slate-800 border-none rounded-2xl p-5 text-sm font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 transition-all font-['Inter']"
                            placeholder="https://images.unsplash.com/..."
                            value={form.image}
                            onChange={(e) => setForm({ ...form, image: e.target.value })}
                          />
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleImageUpload} 
                          />
                          <button 
                            type="button"
                            disabled={uploading}
                            onClick={() => fileInputRef.current.click()}
                            className="px-8 bg-slate-100 dark:bg-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-all border-none cursor-pointer flex items-center gap-3 whitespace-nowrap"
                          >
                            {uploading ? "Uploading..." : "Upload Asset"}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-primary flex items-center gap-3 ml-4">
                        <LinkIcon className="w-4 h-4" /> Resource Slug (Meta Route)
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="MAPPING-IDENTIFIER-V1"
                        className="w-full bg-slate-50 dark:bg-slate-800/30 border-none rounded-[2rem] p-10 text-xl font-black font-['Outfit'] placeholder:text-slate-100 dark:placeholder:text-slate-800 outline-none focus:ring-8 focus:ring-primary/5 transition-all text-slate-400 uppercase tracking-widest lowercase"
                        value={form.slug}
                        onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                      />
                      <p className="pl-4 text-[9px] font-bold text-slate-300 dark:text-slate-700 uppercase tracking-widest">
                        Permanent URI: /{form.category.toLowerCase()}/<span className="text-primary">{form.slug || 'node-name'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-12 pt-12 border-t-4 border-slate-100 dark:border-slate-900 grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <Zap className="w-5 h-5 text-primary fill-primary" />
                         <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Strategic Insight (USP)</label>
                      </div>
                      <textarea 
                        value={form.keyInsight}
                        onChange={(e) => setForm({ ...form, keyInsight: e.target.value })}
                        placeholder="What is the one sharp insight the reader must take away?"
                        className="w-full bg-slate-100 dark:bg-slate-800 p-8 rounded-[3rem] border-none text-xl font-bold font-lora text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 min-h-[200px] leading-relaxed italic"
                      />
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center gap-3">
                         <BookOpen className="w-5 h-5 text-primary" />
                         <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">30s Summary Mode (Bullets)</label>
                      </div>
                      <div className="space-y-4">
                        {form.bullets.map((bullet, idx) => (
                          <div key={idx} className="flex gap-4 items-center group">
                             <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 group-focus-within:bg-primary group-focus-within:text-white transition-all">0{idx+1}</div>
                             <input 
                               type="text"
                               value={bullet}
                               onChange={(e) => {
                                 const newBullets = [...form.bullets];
                                 newBullets[idx] = e.target.value;
                                 setForm({ ...form, bullets: newBullets });
                               }}
                               placeholder={`Bullet point ${idx+1}`}
                               className="flex-1 bg-slate-100 dark:bg-slate-800 p-5 rounded-2xl border-none font-bold text-sm text-slate-900 dark:text-white outline-none focus:bg-white dark:focus:bg-slate-700 transition-all font-lora"
                             />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-12 space-y-6">
                      <div className="flex items-center gap-3">
                         <HelpCircle className="w-5 h-5 text-primary" />
                         <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">ELI5 Explanation (Explain Like I'm 15)</label>
                      </div>
                      <textarea 
                        value={form.eli5}
                        onChange={(e) => setForm({ ...form, eli5: e.target.value })}
                        placeholder="How would you explain this concept to a teenager? Keep it simple, vivid, and conceptual."
                        className="w-full bg-slate-100 dark:bg-slate-800 p-8 rounded-[3rem] border-none text-lg font-bold font-lora text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700 min-h-[150px] leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Block Editor Area */}
                  <div className="space-y-10 pt-10 border-t border-slate-100 dark:border-slate-800">
                     <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-black font-['Outfit'] dark:text-white uppercase tracking-tight flex items-center gap-3">
                           <Layout className="w-5 h-5 text-primary" /> Content Architecture
                        </h3>
                        <div className="flex gap-2">
                           <QuickBlock icon={<Type className="w-4 h-4"/>} onClick={() => addBlock('paragraph')} />
                           <QuickBlock icon={<AlignLeft className="w-4 h-4"/>} onClick={() => addBlock('heading')} />
                           <QuickBlock icon={<ListIcon className="w-4 h-4"/>} onClick={() => addBlock('list')} />
                           <QuickBlock icon={<Sparkles className="w-4 h-4"/>} onClick={() => addBlock('highlight')} />
                        </div>
                     </div>

                     <div className="space-y-6 min-h-[400px]">
                        {form.content.length === 0 && (
                          <div className="h-[400px] rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700 gap-6">
                             <Plus className="w-12 h-12 opacity-20" />
                             <p className="font-black uppercase text-[10px] tracking-[0.3em] opacity-40">Initialize blocks to begin data sync</p>
                          </div>
                        )}
                        <AnimatePresence>
                        {form.content.map((block, idx) => (
                          <motion.div 
                            key={idx} 
                            initial={{ opacity: 0, x: -20 }} 
                            animate={{ opacity: 1, x: 0 }} 
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 group relative transition-all hover:bg-white dark:hover:bg-slate-800"
                          >
                             {/* Controls */}
                             <div className="absolute -right-4 -top-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                                <button onClick={() => moveBlock(idx, -1)} type="button" className="p-3 rounded-xl bg-white dark:bg-slate-700 shadow-lg border-none text-slate-400 hover:text-primary cursor-pointer"><ChevronUp className="w-4 h-4" /></button>
                                <button onClick={() => removeBlock(idx)} type="button" className="p-3 rounded-xl bg-white dark:bg-slate-700 shadow-lg border-none text-slate-400 hover:text-red-500 cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                             </div>

                             <div className="flex items-center gap-3 mb-6 text-[8px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-600">
                                <div className="w-2 h-2 rounded-full bg-primary/30" /> {block.type} BLOCK
                             </div>

                             {block.type === 'paragraph' && (
                               <textarea 
                                 value={block.text} 
                                 onChange={(e) => updateBlock(idx, { text: e.target.value })} 
                                 className="w-full bg-transparent border-none text-lg text-slate-600 dark:text-slate-400 outline-none resize-none font-medium leading-relaxed" 
                                 placeholder="Synthesize block content..." 
                                 rows="3"
                               />
                             )}
                             {block.type === 'heading' && (
                               <input 
                                 value={block.text} 
                                 onChange={(e) => updateBlock(idx, { text: e.target.value })} 
                                 className="w-full bg-transparent border-none text-2xl font-black font-['Outfit'] text-slate-900 dark:text-white outline-none" 
                                 placeholder="Primary sub-section identifier..." 
                               />
                             )}
                             {block.type === 'list' && (
                               <div className="space-y-3">
                                  {block.items.map((item, iIdx) => (
                                    <input 
                                      key={iIdx}
                                      value={item} 
                                      onChange={(e) => updateListItem(idx, iIdx, e.target.value)} 
                                      className="w-full bg-transparent border-none text-lg text-slate-600 dark:text-slate-400 outline-none font-medium flex items-center gap-4" 
                                      placeholder="List parameter..." 
                                    />
                                  ))}
                                  <button onClick={() => updateBlock(idx, { items: [...block.items, ''] })} type="button" className="text-[9px] font-black uppercase tracking-widest text-primary border-none bg-transparent cursor-pointer mt-4">+ ADD INDEX</button>
                               </div>
                             )}
                             {block.type === 'quote' && (
                               <textarea 
                                 value={block.text} 
                                 onChange={(e) => updateBlock(idx, { text: e.target.value })} 
                                 className="w-full bg-white dark:bg-slate-900 p-8 rounded-3xl border-2 border-primary/20 text-xl font-black italic text-slate-900 dark:text-white outline-none resize-none" 
                                 placeholder="MISSION-CRITICAL INSIGHT..." 
                                 rows="3"
                               />
                             )}
                             {block.type === 'highlight' && (
                               <textarea 
                                 value={block.text} 
                                 onChange={(e) => updateBlock(idx, { text: e.target.value })} 
                                 className="w-full bg-primary/5 p-6 rounded-2xl border border-primary/10 text-lg font-black text-slate-900 dark:text-white outline-none resize-none" 
                                 placeholder="CORE EMPHASIS CONTENT..." 
                                 rows="3"
                               />
                             )}
                          </motion.div>
                        ))}
                        </AnimatePresence>
                     </div>

                     <div className="pt-10 flex flex-wrap gap-4 justify-center">
                        <ActionButton icon={<Type />} label="Paragraph" onClick={() => addBlock('paragraph')} />
                        <ActionButton icon={<AlignLeft />} label="Headline" onClick={() => addBlock('heading')} />
                        <ActionButton icon={<ListIcon />} label="List Area" onClick={() => addBlock('list')} />
                        <ActionButton icon={<Quote />} label="Insight" onClick={() => addBlock('quote')} />
                        <ActionButton icon={<Sparkles />} label="Highlight" onClick={() => addBlock('highlight')} />
                        <ActionButton icon={<ImageIcon />} label="Asset" onClick={() => addBlock('image')} />
                     </div>
                  </div>
               </div>
            </div>

            {/* Sidebar Controls */}
            <div className="lg:col-span-4 space-y-12">
               {/* 2. System Settings Box */}
               <div className="bg-white dark:bg-slate-900 p-12 rounded-[3.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none space-y-10 transition-colors duration-500 text-left">
                  <h3 className="text-xl font-black font-['Outfit'] border-b border-slate-100 dark:border-slate-800 pb-8 mb-4 dark:text-white uppercase tracking-tight">Deployment Parameters</h3>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 ml-2">
                      <Tag className="w-4 h-4 text-primary" /> Sector Allocation
                    </label>
                    <select
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer dark:text-white focus:ring-4 focus:ring-primary/5 transition-all"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="Tech">Tech Index</option>
                      <option value="Business">Business Intel</option>
                      <option value="Finance">Financial Flow</option>
                      <option value="Markets">Market Metrics</option>
                      <option value="Commodities">Commodities Focus</option>
                    </select>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 ml-2">
                       <ImageIcon className="w-4 h-4 text-primary" /> Asset Node URL
                    </label>
                    <input
                      type="url"
                      placeholder="HTTPS://UNSPLASH.COM/CORE-ASSET"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 text-[11px] font-black uppercase tracking-widest placeholder:text-slate-100 dark:placeholder:text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-primary/5 transition-all"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                    />
                    <div className="mt-6 rounded-[2.5rem] overflow-hidden aspect-video border border-slate-100 dark:border-slate-800 shadow-sm relative group bg-slate-50 dark:bg-slate-800/50">
                       <img src={form.image} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Metadata Asset" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 ml-2">
                       <Zap className="w-4 h-4 text-primary" /> Abstract Synopsis
                    </label>
                    <textarea 
                      value={form.excerpt} 
                      onChange={(e) => setForm({...form, excerpt: e.target.value})}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 text-xs font-bold text-slate-500 dark:text-slate-400 leading-relaxed outline-none resize-none" 
                      rows="4" 
                      placeholder="Summarize for global index..." 
                    />
                  </div>

                  <AnimatePresence mode="wait">
                    {status.type && (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className={`flex items-center gap-5 p-8 rounded-[2.5rem] border ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'} font-black text-[10px] uppercase tracking-[0.3em] leading-relaxed shadow-sm`}
                      >
                        {status.type === 'success' ? <CheckCircle2 className="w-7 h-7 shrink-0" /> : <AlertCircle className="w-7 h-7 shrink-0" />}
                        {status.message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="primary-btn w-full py-8 text-[12px] uppercase tracking-[0.5em] font-black flex items-center justify-center gap-5 active:scale-[0.98] disabled:opacity-50 shadow-2xl shadow-orange-500/30 group grow-btn"
                  >
                    {loading ? (
                      <Loader2 className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-6 h-6 transition-transform group-hover:translate-x-2 group-hover:-translate-y-2" /> 
                        BROADCAST INSIGHT
                      </>
                    )}
                  </button>
               </div>
            </div>
          </form>
        </motion.div>
      </main>

      {/* Floating Preview Layer (If Active) */}
      <AnimatePresence>
        {activeTab === 'Preview' && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed inset-x-0 bottom-0 top-32 z-50 bg-white dark:bg-slate-950 overflow-y-auto p-12 transition-colors duration-500"
          >
            <div className="max-w-4xl mx-auto space-y-16 pb-40 text-left">
              <button 
                onClick={() => setActiveTab('Write')}
                className="fixed top-40 right-12 p-5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-2xl hover:scale-110 transition-transform cursor-pointer border-none z-50 font-black uppercase text-[10px] tracking-widest px-8"
              >
                Close Preview
              </button>

              <div className="space-y-12">
                 <div className="flex items-center gap-6">
                    <span className="bg-primary/10 text-primary px-6 py-2.5 rounded-full text-[10px] uppercase font-black tracking-[0.3em] border border-primary/20">{form.category} Core</span>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5" /> Synchronizing...
                    </span>
                 </div>
                 <h2 className="text-8xl font-black font-['Outfit'] leading-[0.9] text-slate-950 dark:text-white -tracking-tighter uppercase">{form.title || 'NULL DATA'}</h2>
                 <div className="flex items-center gap-10 border-y border-slate-100 dark:border-slate-900 py-12 font-black text-[10px] uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700">
                    <div className="flex items-center gap-3 text-slate-900 dark:text-white"><User className="w-5 h-5 text-primary" />{form.author}</div>
                    <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-primary" />{new Date().toLocaleDateString()}</div>
                    <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-primary" />{form.readTime}M ARCHIVE</div>
                 </div>
                 <div className="rounded-[4rem] overflow-hidden shadow-2xl border border-slate-100 dark:border-slate-800">
                    <img src={form.image} className="w-full h-[600px] object-cover" alt="Preview Hero" />
                 </div>
                 <div className="prose-preview pt-10">
                    <BlockRenderer blocks={form.content} />
                 </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

const ActionButton = ({ icon, label, onClick }) => (
  <button 
    onClick={onClick} 
    type="button"
    className="flex items-center gap-3 px-8 py-5 rounded-[2rem] bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white transition-all text-[11px] font-black uppercase tracking-widest text-slate-400 group border-none cursor-pointer"
  >
    <span className="group-hover:scale-110 transition-transform">{icon}</span> {label}
  </button>
);

const QuickBlock = ({ icon, onClick }) => (
  <button 
    onClick={onClick} 
    type="button"
    className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all border-none cursor-pointer"
  >
    {icon}
  </button>
);

