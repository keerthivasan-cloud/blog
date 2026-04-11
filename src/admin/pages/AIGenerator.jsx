import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Link as LinkIcon, CheckCircle, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../config';
import { useContent } from '../../context/ContentContext';
import AdminLayout from '../layout/AdminLayout';

const AIGenerator = () => {
  const [genTopic, setGenTopic] = useState("");
  const [genCategory, setGenCategory] = useState("Tech");
  const [genProvider, setGenProvider] = useState("auto");
  const [genDepth, setGenDepth] = useState("deep");
  const [generating, setGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState("");
  const [success, setSuccess] = useState(null);
  const { refreshArticles } = useContent();

  const handleGenerate = async () => {
    if (!genTopic || generating) return;
    setGenerating(true);
    setSuccess(null);
    setGenerationStatus("Initiating Orchestrator...");
    
    try {
      const response = await fetch(`${API_BASE_URL}/blogs/generate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer admin123` 
        },
        body: JSON.stringify({ topic: genTopic, category: genCategory, provider: genProvider, depth: genDepth })
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.status) setGenerationStatus(data.status);
              if (data.done) {
                setSuccess(data);
                setGenTopic("");
                refreshArticles();
                break;
              }
              if (data.error) throw new Error(data.error);
            } catch (e) {
               // Ignore partial JSON parse errors
            }
          }
        }
      }
    } catch (err) {
      alert(err.message || "Synthesis Failed");
      setGenerationStatus("");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">AI Generator</h1>
          <p className="text-sm text-slate-500">Deploy Multi-Provider intelligent synthesis models to rapidly draft articles.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8 space-y-6">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 space-y-6">
               <div className="space-y-2">
                 <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Target Topic or Prompt</label>
                 <textarea 
                   value={genTopic}
                   onChange={(e) => setGenTopic(e.target.value)}
                   placeholder="e.g. 'The future of quantum computing in the next decade' or 'Explain solid state batteries'..."
                   className="w-full min-h-[150px] p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all resize-none text-sm leading-relaxed"
                 />
               </div>

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Category</label>
                   <select 
                     value={genCategory} 
                     onChange={(e) => setGenCategory(e.target.value)} 
                     className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/20"
                   >
                     {["Tech", "Finance", "Business", "Markets", "Commodities"].map(c => <option key={c} value={c}>{c}</option>)}
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">AI Engine Engine</label>
                   <select 
                     value={genProvider} 
                     onChange={(e) => setGenProvider(e.target.value)} 
                     className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/20"
                   >
                     <option value="auto">Auto (Gemini + Groq Fallback)</option>
                     <option value="gemini">Gemini Protocol (Google)</option>
                     <option value="groq">Groq Protocol (Llama 3)</option>
                   </select>
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Synthesis Depth</label>
                   <select 
                     value={genDepth} 
                     onChange={(e) => setGenDepth(e.target.value)} 
                     className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-primary/20"
                   >
                     <option value="standard">Standard (~1000 words)</option>
                     <option value="deep">Deep Dive (~1500+ words)</option>
                   </select>
                 </div>
               </div>

               <button 
                 onClick={handleGenerate} 
                 disabled={generating || !genTopic} 
                 className="w-full py-3.5 bg-primary hover:bg-primary/90 text-white rounded-xl font-medium shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {generating ? (
                   <>
                     <Loader2 className="w-5 h-5 animate-spin" />
                     {generationStatus || "Synthesizing..."}
                   </>
                 ) : (
                   <>
                     <Sparkles className="w-5 h-5" /> Generate Article
                   </>
                 )}
               </button>
            </div>
          </div>

          <div className="md:col-span-4">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 sticky top-24">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">System Output</h3>
                
                <AnimatePresence mode="wait">
                  {!success ? (
                    <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-12 text-center flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center">
                         {generating ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <Zap className="w-5 h-5 text-slate-300 dark:text-slate-600" />}
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{generating ? 'Processing Data...' : 'Waiting for prompt'}</p>
                    </motion.div>
                  ) : (
                    <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                      <div className="p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-center">
                         <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                         <h4 className="text-sm font-bold text-green-700 dark:text-green-400">Synthesis Complete</h4>
                      </div>
                      <div className="space-y-1">
                         <p className="text-xs text-slate-500 dark:text-slate-400">Generated Title:</p>
                         <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">{success.title}</p>
                      </div>
                      <div className="pt-4 flex flex-col gap-2">
                         <Link 
                           to={`/admin/editor/${success.slug}`} 
                           className="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-medium text-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                         >
                           Open in Editor
                         </Link>
                         <Link 
                           to={`/${success.category?.toLowerCase() || 'tech'}/${success.slug}`} 
                           className="w-full py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-xs font-medium text-center hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                         >
                           View Live Post <LinkIcon className="w-3 h-3" />
                         </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AIGenerator;
