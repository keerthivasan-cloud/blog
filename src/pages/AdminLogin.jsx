import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '../context/ContentContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, AlertCircle, ArrowRight, Eye, EyeOff, PenTool } from 'lucide-react';

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
        setError('The credentials provided are invalid.');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center font-['Inter'] transition-colors duration-500" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      
      <div className="max-w-md w-full relative z-10 px-6">
        <div className="text-center mb-10">
           <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-slate-900 dark:bg-white rounded-xl mb-6 shadow-md transition-transform hover:scale-105">
             <PenTool className="w-6 h-6 text-white dark:text-slate-900" />
           </Link>
           <h1 className="text-3xl font-bold tracking-tight mb-2">NewsForge Admin</h1>
           <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Sign in to manage editorial content.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="p-8 sm:p-10 rounded-2xl shadow-xl"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="mb-6 p-4 rounded-lg flex items-center gap-3 text-sm font-medium" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--red)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {error}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2 text-left">
              <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                <input 
                  type="text" 
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full input pl-12 py-3 text-sm transition-all focus:ring-2"
                  required
                />
              </div>
            </div>

            <div className="space-y-2 text-left">
              <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" />
                <input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full input pl-12 py-3 text-sm transition-all focus:ring-2"
                  required
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors border-none bg-transparent cursor-pointer opacity-40 hover:opacity-100"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button 
               type="submit" 
               disabled={isLoading}
               className="btn-primary w-full py-3 mt-4 text-sm justify-center rounded-lg shadow-md transition-transform hover:scale-[1.02] active:scale-95 flex items-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </motion.div>
        
        <div className="mt-8 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
           &copy; {new Date().getFullYear()} NewsForge Editorial Console.
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
