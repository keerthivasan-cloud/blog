import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; 
import { Navbar, Footer } from "../components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, FileText, Link as LinkIcon, Tag, Layout, 
  CheckCircle2, AlertCircle, Loader2, Image as ImageIcon, 
  PenTool, Eye, FileEdit, Globe 
} from "lucide-react";

export default function Admin() {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    category: "",
    content: "",
    author: "Admin Staff", 
    image: "", 
    readTime: "5",
    status: "published"
  });

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: null, message: "" });

  const generateSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") 
      .replace(/\s+/g, "-")      
      .replace(/--+/g, "-")      
      .trim();

  useEffect(() => {
    if (form.title) {
      setForm(prev => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }, [form.title]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: "" });
    
    try {
      await axios.post("http://localhost:5000/api/articles", form);
      setStatus({ type: "success", message: `Article ${form.status === 'published' ? 'published' : 'saved as draft'} successfully!` });
      setForm({
        title: "",
        slug: "",
        category: "",
        content: "",
        author: "Admin Staff",
        image: "",
        readTime: "5",
        status: "published"
      });
    } catch (error) {
      console.error("Publish error:", error);
      setStatus({ type: "error", message: error.response?.data?.message || "Failed to sync with NewsForge terminal." });
    } finally {
      setLoading(false);
    }
  };

  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'clean'],
    ],
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-500">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-20">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-16 text-left">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-[2rem] bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm transition-all hover:rotate-12">
                <PenTool className="w-8 h-8 text-[#f97316]" />
              </div>
              <div>
                <h1 className="text-4xl md:text-5xl font-black font-['Outfit'] tracking-tight dark:text-white uppercase">Editorial Terminal</h1>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.4em] mt-2">Centralized Authoring Environment v2.0</p>
              </div>
            </div>
            
            <div className="flex bg-slate-50 dark:bg-slate-900 p-2 rounded-3xl border border-slate-100 dark:border-slate-800">
               <button 
                  onClick={() => setForm({...form, status: 'published'})}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none ${form.status === 'published' ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' : 'text-slate-400 bg-transparent'}`}
               >
                  <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Live Scope</div>
               </button>
               <button 
                  onClick={() => setForm({...form, status: 'draft'})}
                  className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none ${form.status === 'draft' ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm' : 'text-slate-400 bg-transparent'}`}
               >
                  <div className="flex items-center gap-2"><FileEdit className="w-3.5 h-3.5" /> Draft Buffer</div>
               </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
               <div className="glass p-10 md:p-14 rounded-[4rem] border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none space-y-10 bg-white dark:bg-slate-900/50">
                  <div className="space-y-4 text-left">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 ml-2">
                      <FileText className="w-4 h-4 text-primary" /> Transmission Headline
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="ENTER PINNACLE HEADLINE..."
                      className="w-full px-8 py-7 rounded-[2rem] border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-2xl font-black placeholder:text-slate-200 dark:placeholder:text-slate-800 uppercase tracking-tight dark:text-white"
                      value={form.title}
                      onChange={(e) => setForm({ ...form, title: e.target.value })}
                    />
                  </div>

                  <div className="space-y-4 text-left">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 ml-2">
                       <Layout className="w-4 h-4 text-primary" /> Logic Architecture
                    </label>
                    <div className="quill-premium rounded-[3rem] overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/30">
                       <ReactQuill 
                          theme="snow" 
                          value={form.content} 
                          onChange={(content) => setForm({...form, content})} 
                          modules={modules}
                          placeholder="INITIALIZE CONTENT SYNC..."
                          className="min-h-[600px] dark:text-white"
                       />
                    </div>
                  </div>
               </div>
            </div>

            <div className="lg:col-span-4 space-y-10">
               <div className="glass p-10 rounded-[3.5rem] border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none space-y-10 bg-white dark:bg-slate-900/50">
                  <h3 className="text-xl font-black font-['Outfit'] border-b border-slate-100 dark:border-slate-800 pb-6 mb-2 dark:text-white uppercase tracking-tight">System Parameters</h3>
                  
                  <div className="space-y-4 text-left">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 ml-2">
                      <Tag className="w-4 h-4 text-primary" /> Segment Map
                    </label>
                    <select
                      required
                      className="w-full px-8 py-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none focus:border-primary transition-all font-black text-[11px] uppercase tracking-widest appearance-none dark:text-white cursor-pointer"
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                    >
                      <option value="" disabled>SELECT CLUSTER</option>
                      <option value="Tech">Tech Index</option>
                      <option value="Business">Business Intel</option>
                      <option value="Finance">Financial Flow</option>
                      <option value="Markets">Market Metrics</option>
                      <option value="Commodities">Commodities</option>
                    </select>
                  </div>

                  <div className="space-y-4 text-left">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 ml-2">
                       <ImageIcon className="w-4 h-4 text-primary" /> Asset URL (16:9)
                    </label>
                    <input
                      type="url"
                      placeholder="HTTPS://UNSPLASH.COM/CORE-ASSET"
                      className="w-full px-8 py-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 focus:outline-none font-black text-[11px] uppercase tracking-widest placeholder:text-slate-200 dark:placeholder:text-slate-800 dark:text-white"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                    />
                    {form.image && (
                      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="mt-4 rounded-[2.5rem] overflow-hidden aspect-video border border-slate-100 dark:border-slate-800 shadow-sm relative group">
                        <img src={form.image} className="w-full h-full object-cover" alt="Preview" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <Eye className="w-8 h-8 text-white" />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="space-y-4 text-left">
                    <label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 flex items-center gap-3 ml-2">
                       <LinkIcon className="w-4 h-4 text-primary" /> Permanent Link
                    </label>
                    <div className="px-8 py-6 rounded-[2rem] bg-slate-50 dark:bg-slate-800/30 border border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 break-all leading-relaxed tracking-wider uppercase opacity-50">
                       /{form.category.toLowerCase() || '...'}/{form.slug || 'awaiting-broadcast'}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {status.type && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`flex items-center gap-4 p-6 rounded-[2rem] ${
                          status.type === 'success' 
                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                        } font-black text-[10px] uppercase tracking-[0.2em] leading-relaxed`}
                      >
                        {status.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
                        {status.message}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={loading}
                    className="primary-btn w-full py-7 text-[12px] uppercase tracking-[0.4em] font-black flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> SYNCING...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" /> BROADCAST INSIGHT
                      </>
                    )}
                  </button>
               </div>
            </div>
          </form>
        </motion.div>
      </main>

      <Footer />
      
      <style>{`
         .quill-premium .ql-toolbar.ql-snow {
            border: none;
            background: rgba(248, 250, 252, 0.5);
            border-bottom: 1px solid rgba(226, 232, 240, 0.5);
            padding: 24px 32px;
         }
         .dark .quill-premium .ql-toolbar.ql-snow {
            background: rgba(15, 23, 42, 0.5);
            border-bottom-color: rgba(30, 41, 59, 1);
         }
         .quill-premium .ql-container.ql-snow {
            border: none;
            font-family: 'Inter', sans-serif;
            font-size: 1.15rem;
            line-height: 1.8;
         }
         .quill-premium .ql-editor { padding: 50px; }
         .dark .quill-premium .ql-snow .ql-stroke { stroke: #475569; }
         .dark .quill-premium .ql-snow .ql-fill { fill: #475569; }
         .dark .quill-premium .ql-snow .ql-picker { color: #475569; }
         .dark .quill-premium .ql-editor.ql-blank::before { color: #1e293b; }
      `}</style>
    </div>
  );
}
