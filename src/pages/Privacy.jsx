import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer } from '../components/Layout';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { updateSEOMetadata } from '../utils/seo';

const Privacy = () => {
  useEffect(() => {
    updateSEOMetadata({
      title: 'Privacy Policy — NewsForge',
      description: 'Learn how NewsForge collects, uses, and protects your personal information.',
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
            <span className="section-label mb-4 flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5" /> Privacy & Protection</span>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ letterSpacing: '-0.025em', color: 'var(--text-primary)' }}>Privacy Policy</h1>
            <p className="text-sm border-b pb-12" style={{ color: 'var(--text-muted)', borderColor: 'var(--border)' }}>Effective Date: April 11, 2026</p>
          </div>

          <div className="prose-system max-w-none">
             <h2>01. Introduction</h2>
             <p>At NewsForge, we respect your privacy and are committed to protecting it. This policy describes the types of information we may collect when you visit our website.</p>
             
             <h2>02. Information We Collect</h2>
             <p>We collect several types of data including information by which you may be identified, such as your name, location, and email address.</p>

             <h2>03. How We Use Information</h2>
             <p>The information we collect is used to display our website and its contents to you; to provide information, products, or services that you request; and to fulfill any other purpose for which it was shared.</p>

             <h2>04. Data Security</h2>
             <p>We have implemented measures designed to secure your personal information from unauthorized access, loss, or disclosure. However, absolute security cannot be guaranteed.</p>

             <h2>05. Contact Us</h2>
             <p>For any questions regarding this policy, please contact us at: <a href="mailto:privacy@newsforge.in" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>privacy@newsforge.in</a>.</p>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
