import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Sparkles, ArrowLeft, CheckCircle, Loader2, Save, Plus, 
  Trash2, ChevronUp, ChevronDown, Type, AlignLeft, List as ListIcon, 
  Quote, Image as LucideImage, Send, Eye, FileText 
} from 'lucide-react';
import axios from 'axios';
import { Navbar, Footer } from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';
import { useContent } from '../context/ContentContext';

const Write = () => {
  const [activeMode, setActiveMode] = useState("Catalyst"); // Catalyst (AI) or Architecture (Manual)
  const [genTopic, setGenTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const { user, refreshArticles } = useContent();

  // Architecture Mode State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Tech',
    readTime: 5,
    excerpt: '',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000',
    content: [{ type: 'paragraph', text: '' }]
  });
  const [isSaving, setIsSaving] = useState(false);

  // --- SYNTHESIS LOGIC ---
  const handleGenerate = async () => {
    if (!genTopic) return;
    setGenerating(true);
    setSuccess(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/blogs/generate`, { topic: genTopic }, {
        headers: { Authorization: `Bearer admin123` }
      });
      setSuccess(res.data);
      setGenTopic("");
      refreshArticles(); // live refresh global article list
    } catch (err) {
      alert(err.response?.data?.message || "Synthesis Failed");
    } finally {
      setGenerating(false);
    }
  };

  // --- ARCHITECTURE LOGIC ---
  const handleManualSave = async () => {
    if (!formData.title) return alert("Title required for publication");
    setIsSaving(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/articles`, formData, {
        headers: { Authorization: `Bearer admin123` }
      });
      setSuccess(res.data);
      refreshArticles(); // live refresh global article list
    } catch (err) {
      alert("Manual Publication Failure");
    } finally {
      setIsSaving(false);
    }
  };

  const updateBlock = (idx, data) => {
    setFormData(prev => {
      const newContent = [...prev.content];
      newContent[idx] = { ...newContent[idx], ...data };
      return { ...prev, content: newContent };
    });
  };

  const addBlock = (type) => {
    const newBlock = { type, text: '' };
    if (type === 'list') newBlock.items = [''];
    if (type === 'heading') newBlock.level = 2;
    setFormData(prev => ({ ...prev, content: [...prev.content, newBlock] }));
  };

  return (
    <div className="min-h-screen transition-colors duration-700" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-24 md:py-40">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-left mb-20">
          <Link to="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] mb-12 no-underline hover:text-[var(--accent)] transition-colors text-muted-foreground">
            <ArrowLeft className="w-5 h-5" /> System Index
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-12">
             <div>
                <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.4em] mb-8 bg-orange-600/10 border-orange-600/20 text-orange-600">
                  <Zap className="w-3.5 h-3.5 fill-current" /> Intelligence Terminal v5.0
                </div>
                <h1 className="text-6xl md:text-8xl font-black -tracking-tighter uppercase leading-[0.9] title mb-8">
                  Editorial <br /><span className="gradient-text">Command</span>.
                </h1>
             </div>

             <div className="flex bg-white/5 p-1.5 rounded-[2rem] border border-white/5">
                {[
                  { name: "Catalyst", icon: Sparkles, desc: "AI Synthesis" },
                  { name: "Architecture", icon: FileText, desc: "Manual Authoring" }
                ].map(mode => (
                  <button 
                    key={mode.name}
                    onClick={() => { setActiveMode(mode.name); setSuccess(null); }}
                    className={`flex items-center gap-4 px-10 py-5 rounded-[1.8rem] text-[10px] font-black uppercase tracking-widest transition-all cursor-pointer border-none ${activeMode === mode.name ? 'bg-orange-600 text-white shadow-2xl' : 'text-slate-500 hover:text-white bg-transparent'}`}
                  >
                    <mode.icon className="w-4 h-4" /> {mode.desc}
                  </button>
                ))}
             </div>
          </div>
        </motion.div>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
           
           {/* Primary Workspace */}
           <div className="lg:col-span-8 space-y-12">
              <AnimatePresence mode="wait">
                 {activeMode === "Catalyst" ? (
                    <motion.div key="cat" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="card p-12 md:p-20 rounded-[4rem] relative overflow-hidden bg-white/[0.01]">
                       <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Sparkles className="w-60 h-60" /></div>
                       <div className="relative z-10 space-y-12">
                          <div className="space-y-4">
                             <label className="text-[10px] font-black uppercase tracking-[0.5em] ml-2 opacity-40">Synthesis Target Topic</label>
                             <textarea 
                               value={genTopic}
                               onChange={(e) => setGenTopic(e.target.value)}
                               placeholder="Input technical parameter for AI synthesis..."
                               className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-10 text-lg font-bold placeholder:opacity-20 focus:border-orange-500 transition-all outline-none resize-none h-60"
                             />
                          </div>
                          <button onClick={handleGenerate} disabled={generating || !genTopic} className={`w-full py-8 rounded-3xl font-black uppercase text-xs tracking-[0.4em] transition-all flex items-center justify-center gap-4 cursor-pointer border-0 shadow-2xl ${generating ? 'opacity-50 bg-orange-600/50' : 'bg-orange-600 hover:bg-orange-500'}`} style={{ color: 'white' }}>
                             {generating ? <>Synthesis In-Progress <Loader2 className="w-5 h-5 animate-spin" /></> : <>Initiate Protocol <Zap className="w-5 h-5 fill-white" /></>}
                          </button>
                       </div>
                    </motion.div>
                 ) : (
                    <motion.div key="arch" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-12">
                       {/* Manual Header Form */}
                       <div className="card p-12 rounded-[3.5rem] bg-white/[0.01] space-y-10">
                          <input 
                            value={formData.title} 
                            onChange={(e) => setFormData({...formData, title: e.target.value})} 
                            className="w-full bg-transparent border-none text-5xl font-black uppercase tracking-tighter outline-none p-0 placeholder:opacity-10" 
                            placeholder="ARTICLE HEADLINE..." 
                          />
                          <div className="grid grid-cols-2 gap-8">
                             <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">Segment</label>
                                <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[10px] font-black uppercase outline-none appearance-none cursor-pointer">
                                   {["Intelligence", "Tech", "Finance", "Business", "Markets", "Commodities"].map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                             </div>
                             <div className="space-y-3">
                                <label className="text-[9px] font-black uppercase tracking-widest opacity-40 ml-4">Read Est (M)</label>
                                <input type="number" value={formData.readTime} onChange={(e) => setFormData({...formData, readTime: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-[10px] font-black outline-none" />
                             </div>
                          </div>
                       </div>

                       {/* Block Editor */}
                       <div className="space-y-8 pb-40 text-left">
                          {formData.content.map((block, idx) => (
                             <div key={idx} className="group relative bg-white/[0.01] border border-white/5 rounded-[3rem] p-10 hover:border-orange-500/20 transition-all">
                                <div className="flex items-center justify-between mb-8">
                                   <span className="text-[9px] font-black uppercase tracking-[0.4em] text-orange-500/40">{block.type} component</span>
                                   <button onClick={() => setFormData({...formData, content: formData.content.filter((_, i) => i !== idx)})} className="p-3 rounded-xl hover:bg-red-500/10 text-red-500 opacity-0 group-hover:opacity-100 transition-all border-none bg-transparent cursor-pointer"><Trash2 className="w-4 h-4" /></button>
                                </div>
                                {block.type === 'paragraph' && <textarea value={block.text} onChange={(e) => updateBlock(idx, {text: e.target.value})} className="w-full bg-transparent border-none text-lg font-medium leading-relaxed outline-none resize-none placeholder:opacity-10 text-white" placeholder="Editorial content..." rows="4" />}
                                {block.type === 'heading' && <input value={block.text} onChange={(e) => updateBlock(idx, {text: e.target.value})} className="w-full bg-transparent border-none text-2xl font-black uppercase outline-none placeholder:opacity-10 text-white" placeholder="SECTION SUBTITLE..." />}
                                {block.type === 'list' && (
                                   <div className="space-y-4">
                                      {block.items.map((it, i) => <input key={i} value={it} onChange={(e) => {
                                         const newItems = [...block.items]; newItems[i] = e.target.value; updateBlock(idx, {items: newItems});
                                      }} className="w-full bg-transparent border-none text-lg font-medium outline-none text-white" placeholder="• List parameter..." />)}
                                      <button onClick={() => updateBlock(idx, {items: [...block.items, '']})} className="text-[9px] font-black uppercase tracking-widest text-orange-500 border-none bg-transparent cursor-pointer flex items-center gap-2"><Plus className="w-4 h-4" /> Add Parameter</button>
                                   </div>
                                )}
                                {block.type === 'quote' && <textarea value={block.text} onChange={(e) => updateBlock(idx, {text: e.target.value})} className="w-full bg-transparent border-none text-2xl font-black italic outline-none resize-none placeholder:opacity-10 text-white" placeholder="Strategic quote..." rows="3" />}
                                {block.type === 'highlight' && <textarea value={block.text} onChange={(e) => updateBlock(idx, {text: e.target.value})} className="w-full bg-transparent border-none text-lg font-black text-orange-500 outline-none resize-none placeholder:opacity-10" placeholder="Technical insight..." rows="3" />}
                                {block.type === 'image' && <div className="space-y-6">
                                   <input value={block.url} onChange={(e) => updateBlock(idx, {url: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-black outline-none" placeholder="IMAGE URL..." />
                                   <input value={block.alt} onChange={(e) => updateBlock(idx, {alt: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[10px] font-black outline-none" placeholder="ALT TEXT..." />
                                </div>}
                             </div>
                          ))}
                          
                          {/* Block Actions */}
                          <div className="flex flex-wrap gap-3 justify-center pt-10">
                             {[
                               { type: 'paragraph', icon: Type, label: 'Para' },
                               { type: 'heading', icon: AlignLeft, label: 'Head' },
                               { type: 'list', icon: ListIcon, label: 'List' },
                               { type: 'quote', icon: Quote, label: 'Quote' },
                               { type: 'highlight', icon: Sparkles, label: 'Insight' },
                               { type: 'image', icon: LucideImage, label: 'Asset' }
                             ].map(btn => (
                               <button 
                                 key={btn.type}
                                 onClick={() => addBlock(btn.type)}
                                 className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-white/5 hover:bg-orange-600 transition-all group border-none cursor-pointer"
                               >
                                  <btn.icon className="w-4 h-4 text-slate-500 group-hover:text-white" />
                                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white">{btn.label}</span>
                               </button>
                             ))}
                          </div>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </div>

           {/* Control & Feedback Panel */}
           <div className="lg:col-span-4 sticky top-40 space-y-12">
              {activeMode === "Architecture" && (
                <button onClick={handleManualSave} disabled={isSaving} className="w-full py-8 rounded-3xl bg-white text-black font-black uppercase text-xs tracking-[0.4em] shadow-2xl hover:bg-orange-600 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-4 border-none cursor-pointer">
                   {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} Publish Node
                </button>
              )}

              <div className="card p-10 rounded-[3rem] bg-white/[0.01] border-white/5">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-slate-500">System Feedback</h4>
                 <AnimatePresence>
                   {!success ? (
                     <div className="py-12 text-center space-y-6 opacity-30">
                        <div className="w-16 h-16 rounded-full border-4 border-dashed border-white/20 mx-auto animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Command Input...</p>
                     </div>
                   ) : (
                     <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="p-8 rounded-3xl bg-green-500/10 border border-green-500/30 text-left">
                           <CheckCircle className="w-8 h-8 text-green-500 mb-6" />
                           <h5 className="text-sm font-black uppercase text-green-500 mb-3 tracking-tight">Deployment Successful</h5>
                           <p className="text-xs font-medium text-slate-400 mb-8 leading-relaxed">Intelligence node synthesized as: <span className="text-white">"{success.title}"</span>. The global archive has been calibrated.</p>
                           <Link to={`/${success.category?.toLowerCase() || 'intelligence'}/${success.slug}`} className="w-full block py-4 text-center rounded-xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-widest no-underline text-white hover:bg-white/10 transition-all">Access Live Node</Link>
                        </div>
                     </motion.div>
                   )}
                 </AnimatePresence>
              </div>

              <div className="p-10 space-y-8 text-left">
                 <div className="flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-orange-600 glow-orange" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Global Protocol Active</span>
                 </div>
                 <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-wider">
                    All technical nodes must adhere to the NewsForge editorial standard. AI synthesis is limited to 1200 words. Manual architecture is uncapped.
                 </p>
              </div>
           </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Write;
