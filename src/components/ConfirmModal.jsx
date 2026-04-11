import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Trash2, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, type = 'danger' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] p-10 shadow-2xl border border-slate-200 dark:border-slate-800"
          >
            <div className="flex flex-col items-center text-center">
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-6 ${
                type === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-primary/10 text-primary'
              }`}>
                {type === 'danger' ? <Trash2 className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
              </div>
              
              <h3 className="text-2xl font-black font-['Outfit'] uppercase tracking-tight mb-4">{title}</h3>
              <p className="text-sm font-bold text-slate-500 dark:text-slate-400 leading-relaxed mb-10">
                {message}
              </p>
              
              <div className="flex w-full gap-4">
                <button 
                  onClick={onCancel}
                  className="flex-1 py-5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-750 transition-all border-none cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => { onConfirm(); onCancel(); }}
                  className={`flex-1 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white shadow-xl transition-all border-none cursor-pointer hover:scale-105 active:scale-95 ${
                    type === 'danger' ? 'bg-red-600 shadow-red-600/20' : 'bg-primary shadow-primary/20'
                  }`}
                >
                  Confirm Action
                </button>
              </div>
            </div>
            
            <button 
              onClick={onCancel}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-all border-none bg-transparent cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;
