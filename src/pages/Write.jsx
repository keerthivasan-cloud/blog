import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Sparkles, ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import { Navbar, Footer } from '../components/Layout';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../config';

const Write = () => {
  const [genTopic, setGenTopic] = useState("");
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!genTopic) return;
    setGenerating(true);
    setSuccess(null);
    try {
      const res = await axios.post(`${API_BASE_URL}/blogs/generate`, { topic: genTopic });
      setSuccess(res.data);
      setGenTopic("");
      // Success state will show link to new node
    } catch (err) {
      alert(err.response?.data?.message || "Synthesis Failed");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />
      
      <main className="max-w-4xl mx-auto px-6 py-24 md:py-40">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-left mb-20"
        >
          <Link to="/" className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] mb-12 no-underline hover:text-[var(--accent)] transition-colors" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft className="w-5 h-5" /> System Index
          </Link>
          
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-[0.4em] mb-8" style={{ background: 'var(--accent-soft)', borderColor: 'var(--accent-soft)', color: 'var(--accent)' }}>
            <Zap className="w-3.5 h-3.5 fill-current" /> NewsForge Protocol v4.2
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black -tracking-tighter uppercase leading-[0.9] title mb-8">
            Intelligence <br /><span className="gradient-text">Synthesis</span>.
          </h1>
          <p className="text-xl font-medium leading-relaxed max-w-2xl subtitle" style={{ color: 'var(--text-secondary)' }}>
            Initialize a high-density technical analysis node. Our AI catalyst will author a 700-1200 word brief credited to the NewsForge editorial system.
          </p>
        </motion.div>

        <section className="card p-12 md:p-20 rounded-[4rem] relative overflow-hidden border-white/5">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none"><Sparkles className="w-60 h-60" /></div>
          
          <div className="relative z-10 space-y-12">
            <div className="space-y-4">
               <label className="text-[10px] font-black uppercase tracking-[0.5em] ml-2 opacity-40">Synthesis Target Topic</label>
               <textarea 
                 value={genTopic}
                 onChange={(e) => setGenTopic(e.target.value)}
                 placeholder="e.g. The strategic evolution of L2 scaling architectures and the future of Ethereum liquidity..."
                 className="w-full bg-white/5 border border-white/10 rounded-[2.5rem] px-10 py-10 text-lg font-bold placeholder:opacity-20 focus:border-[var(--accent)] transition-all outline-none resize-none h-48"
               />
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <button 
                onClick={handleGenerate}
                disabled={generating || !genTopic}
                className={`w-full md:w-auto px-16 py-8 rounded-3xl font-black uppercase text-xs tracking-[0.4em] transition-all flex items-center justify-center gap-4 cursor-pointer border-0 shadow-2xl ${generating ? 'opacity-50 cursor-wait bg-orange-600/50' : 'bg-orange-600 hover:bg-orange-500 scale-100 hover:scale-105 active:scale-95'}`}
                style={{ color: 'white' }}
              >
                {generating ? (
                  <>In-Progress <Loader2 className="w-5 h-5 animate-spin" /></>
                ) : (
                  <>Initiate Synthesis <Zap className="w-5 h-5 fill-white" /></>
                )}
              </button>
              
              <div className="flex items-center gap-6">
                <div className="flex -space-x-3">
                   {[1,2,3].map(i => <div key={i} className="w-10 h-10 rounded-full border-4 border-[#0A0D1A] bg-slate-800" />)}
                </div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">4k+ Analysts Synced</p>
              </div>
            </div>

            <AnimatePresence>
              {success && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="pt-12 mt-12 border-t border-white/5"
                >
                  <div className="flex items-start gap-6 p-8 rounded-[2rem] bg-green-500/5 border border-green-500/20">
                    <div className="w-12 h-12 rounded-2xl bg-green-500 flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20"><CheckCircle className="w-6 h-6 text-white" /></div>
                    <div>
                       <h4 className="text-xl font-black uppercase tracking-tight text-green-400 mb-2">Protocol Successful</h4>
                       <p className="text-sm font-medium text-slate-400 mb-6 leading-relaxed">Intelligence node published as: <span className="text-white font-bold">"{success.title}"</span>. The indexer has been refreshed.</p>
                       <Link to={`/intelligence/${success.slug}`} className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all inline-block no-underline text-white">Access Node</Link>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>

        <section className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
           {[
             { title: "Human Tone", desc: "Mix sentence lengths for journalistic flow." },
             { title: "High-Density", desc: "700-1200 words of technical depth." },
             { title: "Zero AI-isms", desc: "No generic robotic phrasing or filler." }
           ].map((feat, i) => (
             <div key={i} className="p-8 rounded-3xl border border-white/5 flex flex-col gap-4 bg-white/[0.02]">
                <div className="text-[9px] font-black uppercase tracking-[0.4em] text-orange-500">Constraint {i+1}</div>
                <h4 className="text-sm font-bold uppercase tracking-tight">{feat.title}</h4>
                <p className="text-xs font-medium text-slate-500 leading-relaxed">{feat.desc}</p>
             </div>
           ))}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Write;
