import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/Layout';
import { Mail, MapPin, Send, Zap } from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../config';
import { updateSEOMetadata } from '../utils/seo';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | loading | success | error

  useEffect(() => {
    updateSEOMetadata({
      title: 'Contact NewsForge — Get in Touch',
      description: 'Reach out to the NewsForge team for news tips, partnership inquiries, or general questions.',
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await axios.post(`${API_BASE_URL}/contact`, form);
      setStatus('success');
      setForm({ name: '', email: '', message: '' });
      setTimeout(() => setStatus('idle'), 4000);
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 4000);
    }
  };

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="max-w-7xl mx-auto px-5 md:px-8 pt-40 pb-60">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-20">
          
          <motion.div
             initial={{ opacity: 0, x: -30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
             className="lg:col-span-5"
          >
            <div className="flex flex-col mb-12">
               <span className="section-label mb-4 flex items-center gap-2"><Zap className="w-3.5 h-3.5 fill-current" /> Our Desk</span>
               <h1 className="text-4xl md:text-6xl font-bold mb-6" style={{ letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Contact Us</h1>
               <p className="text-xl leading-relaxed" style={{ color: 'var(--text-muted)' }}>Get in touch with our team for news tips, general inquiries, or partnerships.</p>
            </div>

            <div className="space-y-8 mt-12">
               <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                     <Mail className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                     <div className="section-label mb-1">Email</div>
                     <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>contact@newsforge.in</div>
                  </div>
               </div>
               <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                     <MapPin className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div>
                     <div className="section-label mb-1">Location</div>
                     <div className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>London, UK</div>
                  </div>
               </div>
            </div>
          </motion.div>

          <motion.div
             initial={{ opacity: 0, x: 30 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.8 }}
             className="lg:col-span-7"
          >
            <div className="p-5 md:p-12 rounded-3xl border shadow-sm" style={{ background: 'var(--bg-card)', borderColor: 'var(--border)' }}>
               <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Your Name</label>
                        <input type="text" placeholder="John Doe" className="input" required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
                     </div>
                     <div className="space-y-2">
                        <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Email address</label>
                        <input type="email" placeholder="john@example.com" className="input" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <label className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>How can we help?</label>
                     <textarea rows="5" placeholder="Write your message..." className="input resize-none py-3" required value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
                  </div>
                  {status === 'error' && (
                    <p className="text-sm font-medium" style={{ color: 'var(--red)' }}>Failed to send — please email us directly at contact@newsforge.in</p>
                  )}
                  <button type="submit" disabled={status === 'loading' || status === 'success'} className="btn-primary w-full justify-center py-3.5 mt-4 disabled:opacity-75">
                    {status === 'success' ? 'Message Sent ✓' : status === 'loading' ? 'Sending…' : 'Send Message'} {status === 'idle' && <Send className="w-4 h-4 ml-1" />}
                  </button>
               </form>
            </div>
          </motion.div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
