import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useContent } from '../context/ContentContext';
import { 
  ChevronLeft, Save, Eye, Layout, Type, Image as LucideImage, 
  FileText, Calendar, User, Clock, CheckCircle, FileWarning, 
  Layers, Tag, AlignLeft, Send, Sparkles, Zap
} from 'lucide-react';

const AdminEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { articles, addArticle, editArticle, user, darkMode } = useContent();

  const isNew = id === 'new';
  const existingArticle = articles.find(a => a.id === id);

  const [formData, setFormData] = useState({
    id: Date.now().toString(),
    title: '',
    slug: '',
    category: 'Tech',
    author: 'Admin',
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: '2026' }),
    readTime: 5,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop',
    content: '',
    status: 'published',
    excerpt: ''
  });

  const [activeTab, setActiveTab] = useState('Write');

  useEffect(() => {
    if (!user) navigate('/admin/login');
    if (!isNew && existingArticle) setFormData(existingArticle);
  }, [id, isNew, existingArticle, user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isNew) addArticle({ ...formData, id: Date.now().toString() });
    else editArticle(formData);
    navigate('/admin/dashboard');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex flex-col overflow-hidden font-['Inter'] transition-colors duration-500">
      <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border-b border-slate-200 dark:border-slate-800 p-6 flex items-center justify-between z-30 transition-colors duration-500">
        <div className="flex items-center gap-6">
          <Link to="/admin/dashboard" className="p-3 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-slate-400 group no-underline">
            <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          </Link>
          <div>
            <h1 className="text-xl font-black font-['Outfit'] lowercase tracking-tighter uppercase">{isNew ? 'Drafting New Story' : 'Editing Article Asset'}</h1>
            <p className="text-[9px] text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em] font-black mt-1">Archive ID: {formData.id}</p>
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
          <button onClick={handleSubmit} className="primary-btn flex items-center gap-3 px-8 py-3 rounded-2xl shadow-[0_10px_30px_rgba(249,115,22,0.2)]">
            <Save className="w-4 h-4" /> Finalize Changes
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        <main className={`flex-1 overflow-y-auto p-12 transition-all duration-700 bg-white dark:bg-slate-950 ${activeTab === 'Preview' ? 'max-w-0 opacity-0 invisible overflow-hidden' : 'max-w-4xl'}`}>
          <div className="space-y-12">
            <div className="space-y-6 text-left">
               <label className="text-[10px] uppercase tracking-[0.4em] text-primary font-black ml-4">Master Headline</label>
               <input 
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full bg-transparent border-none text-6xl font-black font-['Outfit'] placeholder:text-slate-100 dark:placeholder:text-slate-900 outline-none p-4 dark:text-white"
                placeholder="Story Title..."
               />
               <div className="flex items-center gap-4 px-4 text-xs font-bold text-slate-300 dark:text-slate-700">
                  <span>Resource Slug:</span>
                  <input name="slug" value={formData.slug} onChange={handleInputChange} className="bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-lg px-3 py-1 text-primary outline-none focus:border-primary/40 transition-all font-['Inter']" />
               </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[4rem] border border-slate-100 dark:border-slate-800 space-y-12">
               <div className="grid grid-cols-2 gap-10">
                  <div className="space-y-4 text-left">
                    <label className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 font-black px-4">Segment Index</label>
                    <select name="category" value={formData.category} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer dark:text-white">
                      {['Tech', 'Business', 'Finance', 'Market', 'Commodities'].map(cat => <option key={cat}>{cat}</option>)}
                    </select>
                  </div>
                  <div className="space-y-4 text-left">
                    <label className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 font-black px-4">Visibility Logic</label>
                    <select name="status" value={formData.status} onChange={handleInputChange} className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 text-[11px] font-black uppercase tracking-widest outline-none appearance-none cursor-pointer dark:text-white">
                      <option value="published">Official Broadcast</option>
                      <option value="draft">Internal Buffer</option>
                    </select>
                  </div>
               </div>
               <div className="grid grid-cols-3 gap-8 pt-10 border-t border-slate-200/50 dark:border-slate-800">
                  <EditorInput label="Contributor" name="author" value={formData.author} icon={<User className="w-4 h-4" />} onChange={handleInputChange} />
                  <EditorInput label="System Date" name="date" value={formData.date} icon={<Calendar className="w-4 h-4" />} onChange={handleInputChange} />
                  <EditorInput label="Read Delta (m)" name="readTime" value={formData.readTime} icon={<Clock className="w-4 h-4" />} onChange={handleInputChange} />
               </div>
               <EditorInput label="Primary Asset URL" name="image" value={formData.image} icon={<LucideImage className="w-4 h-4" />} onChange={handleInputChange} fullWidth />
            </div>

            <div className="space-y-4 text-left">
              <label className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 font-black ml-4">Opening Transmission</label>
              <textarea name="excerpt" value={formData.excerpt} onChange={handleInputChange} rows="3" className="w-full bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-[3rem] p-10 text-sm outline-none resize-none italic leading-relaxed text-slate-500 dark:text-slate-400" placeholder="Brief summary for indexing..." />
            </div>

            <div className="space-y-6 pb-60 text-left">
              <label className="text-[10px] uppercase tracking-[0.4em] text-primary font-black ml-4">Full Archetype Narration</label>
              <textarea name="content" value={formData.content} onChange={handleInputChange} className="w-full min-h-[900px] bg-transparent border-none text-2xl leading-[1.8] text-slate-700 dark:text-slate-200 outline-none p-6 font-medium resize-none placeholder:text-slate-100 dark:placeholder:text-slate-900" placeholder="Begin the story archive..." />
            </div>
          </div>
        </main>

        {/* Preview Pane - Light/Dark Previewed */}
        <section className={`flex-1 bg-white dark:bg-slate-950 overflow-y-auto p-16 transition-all duration-1000 border-l border-slate-100 dark:border-slate-900 ${activeTab === 'Write' ? 'opacity-20 blur-2xl invisible translate-x-40' : 'opacity-100 visible translate-x-0'}`}>
          <div className="max-w-3xl mx-auto space-y-16 pb-40 text-left">
             <div className="flex items-center gap-6">
                <span className="bg-primary/10 text-primary px-6 py-2.5 rounded-full text-[10px] uppercase font-black tracking-[0.3em] border border-primary/20">{formData.category} Protocol</span>
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${formData.status === 'published' ? 'text-green-500' : 'text-orange-400'}`}>
                   <Zap className="w-3.5 h-3.5" /> {formData.status}
                </span>
             </div>
             <h2 className="text-8xl font-black font-['Outfit'] leading-[0.9] text-slate-950 dark:text-white -tracking-tighter uppercase">{formData.title || 'NULL DRAFT'}</h2>
             <div className="flex items-center gap-10 border-y border-slate-100 dark:border-slate-900 py-12 font-black text-[10px] uppercase tracking-[0.4em] text-slate-300 dark:text-slate-700">
                <div className="flex items-center gap-3 text-slate-900 dark:text-white"><div className="w-10 h-10 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-850" />{formData.author}</div>
                <div className="flex items-center gap-3"><Calendar className="w-5 h-5 text-primary" />{formData.date}</div>
                <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-primary" />{formData.readTime}M ARCHIVE</div>
             </div>
             <div className="relative group rounded-[4rem] overflow-hidden shadow-2xl dark:shadow-none">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20" />
                <img src={formData.image} className="w-full h-[650px] object-cover transition-transform duration-1000 group-hover:scale-105" />
             </div>
             <div className="prose prose-slate dark:prose-invert max-w-none text-slate-500 dark:text-slate-400 text-2xl leading-[2] font-medium whitespace-pre-wrap">{formData.content || 'REAL-TIME BROADCAST PREVIEW...'}</div>
          </div>
        </section>
      </div>
    </div>
  );
};

const EditorInput = ({ label, name, value, icon, onChange, fullWidth }) => (
  <div className={`space-y-4 ${fullWidth ? 'w-full' : ''} text-left`}>
    <label className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 font-black px-6">{label}</label>
    <div className="relative">
       <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 dark:text-slate-700">{icon}</div>
       <input name={name} value={value} onChange={onChange} className="w-full bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 pl-16 text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-primary/10 transition-all" />
    </div>
  </div>
);

export default AdminEditor;
