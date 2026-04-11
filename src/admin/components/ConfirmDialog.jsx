import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", isDestructive = true }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden border border-slate-200 dark:border-slate-800 p-8"
        >
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3 tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">
            {message}
          </p>
          
          <div className="flex justify-end gap-3">
            <button 
              onClick={onClose} 
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm} 
              className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all shadow-sm
                ${isDestructive 
                  ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                  : 'bg-primary hover:bg-primary/90 shadow-primary/20'
                }
              `}
            >
              {confirmText}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDialog;
