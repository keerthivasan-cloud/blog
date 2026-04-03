import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight, Eye, EyeOff, ShieldCheck, Zap } from 'lucide-react';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useContent();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      if (login(username, password)) {
        navigate('/admin/dashboard');
      } else {
        setError('THE KEY PROVIDED IS INVALID FOR THIS TERMINAL.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 font-['Inter'] relative overflow-hidden transition-colors duration-500">
      {/* Dynamic Background Elements */}
      <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] shrink-0" />
      <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-slate-200/20 dark:bg-slate-800/10 rounded-full blur-[120px] shrink-0" />
      
      <div className="max-w-md w-full relative z-10 px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="bg-white dark:bg-slate-900/50 backdrop-blur-3xl p-12 md:p-16 rounded-[4.5rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/20 dark:shadow-none"
        >
          <div className="text-center mb-16">
            <div className="w-24 h-24 bg-gradient-to-tr from-[#f97316] to-[#fb923c] rounded-[2.5rem] flex items-center justify-center mx-auto mb-10 shadow-[0_20px_40px_rgba(249,115,22,0.3)] group transition-transform hover:rotate-[15deg]">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-black font-['Outfit'] text-slate-900 dark:text-white mb-2 uppercase tracking-tighter">NewsForge</h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.4em] mt-3">Structural Control Layer</p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-10 p-6 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center gap-5 text-rose-500 text-[10px] font-black uppercase tracking-widest leading-relaxed"
              >
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-10">
            <div className="space-y-4 text-left">
              <label className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-700 font-black px-6">Identity Nexus</label>
              <div className="relative">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-700" />
                <input 
                  type="text" 
                  placeholder="USERNAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 pl-16 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-800 font-black text-[11px] uppercase tracking-widest"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 text-left">
              <label className="text-[10px] uppercase tracking-[0.4em] text-slate-400 dark:text-slate-700 font-black px-6">Terminal key</label>
              <div className="relative">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 dark:text-slate-700" />
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 pl-16 text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-primary focus:ring-8 focus:ring-primary/5 outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-800 font-black text-[11px] uppercase tracking-widest"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 hover:text-primary transition-colors border-none bg-transparent cursor-pointer p-2"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
               type="submit" 
               disabled={isLoading}
               className="primary-btn w-full py-7 text-[12px] uppercase tracking-[0.4em] font-black flex items-center justify-center gap-4 active:scale-95 shadow-2xl shadow-orange-500/30 grow-btn"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Synchronize Terminal <ArrowRight className="w-5 h-5" /></>
              )}
            </button>
          </form>
        </motion.div>
        
        <div className="flex flex-col items-center gap-6 mt-16 mt-20 opacity-30">
           <Zap className="w-5 h-5 text-primary fill-primary" />
           <p className="text-center text-[10px] text-slate-400 font-black uppercase tracking-[0.5em]">
              Authorized Infrastructure Access Only / RSA-4096
           </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
