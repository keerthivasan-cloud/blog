import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, CheckCircle2, Users } from 'lucide-react';

const Poll = ({ question, options, pollId }) => {
  const [selected, setSelected] = useState(null);
  const [voted, setVoted] = useState(false);
  const [results, setResults] = useState(options.map(o => ({ label: o, count: Math.floor(Math.random() * 50) + 10 })));

  useEffect(() => {
    const savedVote = localStorage.getItem(`poll_vote_${pollId}`);
    if (savedVote) {
      setSelected(savedVote);
      setVoted(true);
    }
  }, [pollId]);

  const handleVote = (option) => {
    if (voted) return;
    
    setSelected(option);
    setVoted(true);
    localStorage.setItem(`poll_vote_${pollId}`, option);

    setResults(prev => prev.map(r => 
      r.label === option ? { ...r, count: r.count + 1 } : r
    ));
  };

  const totalVotes = results.reduce((acc, curr) => acc + curr.count, 0);

  return (
    <div className="my-16 p-8 md:p-12 rounded-[3.5rem] bg-slate-900 border border-white/10 shadow-2xl relative overflow-hidden group">
      {/* Decorative backdrop */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -z-10 group-hover:bg-primary/20 transition-all duration-1000" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/20">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Interactive Intelligence Node</span>
        </div>

        <h3 className="text-2xl md:text-3xl font-black font-lora text-white mb-10 leading-tight uppercase -tracking-tight">
          {question}
        </h3>

        <div className="space-y-4">
          {results.map((opt, idx) => {
            const percentage = Math.round((opt.count / totalVotes) * 100);
            const isSelected = selected === opt.label;

            return (
              <button
                key={idx}
                disabled={voted}
                onClick={() => handleVote(opt.label)}
                className={`w-full relative p-6 rounded-2xl border transition-all duration-500 flex flex-col items-start overflow-hidden group/opt cursor-pointer ${
                  voted 
                  ? (isSelected ? 'border-primary bg-primary/10' : 'border-white/5 bg-white/2') 
                  : 'border-white/10 bg-white/5 hover:border-primary/40 hover:bg-white/10'
                }`}
              >
                {/* Result Bar */}
                {voted && (
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "circOut" }}
                    className="absolute inset-0 bg-primary/10 -z-10"
                  />
                )}

                <div className="w-full flex items-center justify-between relative z-10">
                  <div className="flex items-center gap-4">
                    {voted && isSelected && <CheckCircle2 className="w-5 h-5 text-primary" />}
                    <span className={`text-sm font-bold uppercase tracking-wide transition-colors ${voted && !isSelected ? 'text-slate-500' : 'text-white'}`}>
                      {opt.label}
                    </span>
                  </div>
                  {voted && (
                    <span className="text-xs font-black text-primary font-['Outfit']">{percentage}%</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 pt-8 border-t border-white/5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
           <div className="flex items-center gap-2">
             <Users className="w-3.5 h-3.5" />
             {totalVotes.toLocaleString()} Participating Architects
           </div>
           <div>{voted ? 'Verification Logged' : 'Awaiting Input'}</div>
        </div>
      </div>
    </div>
  );
};

export default Poll;
