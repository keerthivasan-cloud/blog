import React, { useState } from 'react';
import { 
  X, RotateCcw, Clock, CheckCircle2, 
  FileText, Calendar, Eye, AlertCircle, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockRenderer } from './ArticlePageComponents';

const VersionModal = ({ versions, currentId, onRestore, onClose }) => {
  const [selectedVersion, setSelectedVersion] = useState(null);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
      {/* OVERLAY */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
      />

      {/* MODAL CONTAINER */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-7xl h-full bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-10 py-8 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                <Clock className="w-6 h-6" />
             </div>
             <div>
                <h3 className="text-2xl font-black font-['Outfit'] uppercase tracking-tight">Intelligence Time Machine</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                  Accessing {versions.length} historical backup nodes
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-4 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all border-none bg-transparent cursor-pointer">
             <X className="w-6 h-6 text-slate-400" />
          </button>
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* VERSION LIST (SIDEBAR) */}
          <div className="w-[350px] border-r border-slate-100 dark:border-slate-800 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-850/50">
            {versions.map((v, idx) => (
              <div 
                key={v.id} 
                onClick={() => setSelectedVersion(v)}
                className={`
                  p-6 rounded-[2rem] border transition-all cursor-pointer group
                  ${selectedVersion?.id === v.id 
                    ? 'bg-white dark:bg-slate-900 border-primary shadow-xl ring-4 ring-primary/5' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-primary/30'}
                `}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    Backup node 0{versions.length - idx}
                  </span>
                  <div className="flex items-center gap-2">
                    {idx === 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-[8px] font-black text-green-500 uppercase tracking-widest">latest</span>
                    )}
                  </div>
                </div>
                <h4 className="text-sm font-black text-slate-700 dark:text-white line-clamp-1 mb-2 font-['Outfit']">{v.title}</h4>
                <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest mono">
                  <Calendar className="w-3 h-3" />
                  {new Date(v.created_at).toLocaleDateString()} at {new Date(v.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>

          {/* PREVIEW AREA */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900 p-12 relative custom-scrollbar">
            <AnimatePresence mode="wait">
              {selectedVersion ? (
                <motion.div 
                  key={selectedVersion.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-3xl mx-auto space-y-10"
                >
                  <div className="space-y-4 text-center">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Historical Node Analysis</span>
                    <h1 className="text-4xl font-black font-['Outfit'] leading-tight">{selectedVersion.title}</h1>
                    <div className="w-20 h-1.5 bg-primary/20 mx-auto rounded-full" />
                  </div>

                  {selectedVersion.image && (
                    <img src={selectedVersion.image} alt="Cover" className="w-full h-80 object-cover rounded-[3rem] shadow-2xl" />
                  )}

                  <div className="prose-system !max-w-none">
                     {Array.isArray(selectedVersion.content) ? (
                        selectedVersion.content.map((block, i) => (
                           <BlockRenderer key={i} block={block} />
                        ))
                     ) : (
                        <p className="italic text-slate-400">Structural content data corrupted or missing for this node.</p>
                     )}
                  </div>

                  {/* RESTORE BUTTON FLOATING */}
                  <div className="sticky bottom-0 pb-10 flex justify-center pt-10">
                    <button 
                      onClick={() => onRestore(selectedVersion.id)}
                      className="px-12 py-6 rounded-[2rem] bg-primary text-white text-[12px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-primary/40 hover:scale-105 transition-all flex items-center gap-4 cursor-pointer"
                    >
                      <RotateCcw className="w-5 h-5" /> Initiate Network Restoration
                    </button>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-300 gap-6 opacity-30">
                   <Eye className="w-20 h-20" />
                   <p className="text-[12px] font-black uppercase tracking-[0.4em]">Select a node from history for visual analysis</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default VersionModal;
