import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/Layout';
import { FileText, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { updateSEOMetadata } from '../utils/seo';

const Terms = () => {
  useEffect(() => {
    updateSEOMetadata({
      title: 'Terms & Conditions — NewsForge',
      description: 'Read the terms and conditions governing use of the NewsForge platform and its content.',
    });
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: 'var(--bg-main)', color: 'var(--text-primary)' }}>
      <Navbar />
      <main className="max-w-4xl mx-auto px-5 md:px-8 pt-16 md:pt-24 pb-20 md:pb-32">
        <motion.div
           initial={{ opacity: 0, y: 30 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="text-left"
        >
          <Link to="/" className="flex items-center gap-2 mb-10 text-sm font-medium transition-colors w-fit no-underline" style={{ color: 'var(--text-muted)' }} onMouseEnter={e => e.target.style.color = 'var(--accent)'} onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
             <ArrowLeft className="w-4 h-4 cursor-pointer" /> Back to Home
          </Link>

          <div className="flex flex-col mb-16">
            <span className="section-label mb-4 flex items-center gap-2"><FileText className="w-3.5 h-3.5" /> Agreement</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Terms & Conditions</h1>
            <p className="text-sm border-b pb-12" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>Last Updated: April 11, 2026</p>
          </div>

          <div className="prose-system max-w-none">
             <h2>1. Acceptance of Terms</h2>
             <p>By accessing and using NewsForge, you agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our website.</p>
             
             <h2>2. Use of Content</h2>
             <p>All content provided on NewsForge is for informational purposes only. You may not reproduce, distribute, or use our material for commercial purposes without prior written consent.</p>

             <h2>3. User Conduct</h2>
             <p>Users agree to use the website only for lawful purposes. Any attempt to disrupt the website's functionality or access unauthorized data is strictly prohibited.</p>

             <h2>4. Disclaimer of Liability</h2>
             <p>NewsForge provides information "as is" and is not liable for any inaccuracies or for any damages resulting from the use of our site.</p>

             <h2>5. Contact Information</h2>
             <p>If you have any questions about these Terms, please contact us at: <a href="mailto:support@newsforge.in" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>support@newsforge.in</a>.</p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Terms;
