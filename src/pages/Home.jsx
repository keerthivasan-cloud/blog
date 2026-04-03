import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, ArrowRight } from 'lucide-react';
import { Navbar, Footer, BlogCard } from '../components/Layout';

const Home = () => {
  const blogs = [
    {
      title: "Mastering Distributed Systems: A Deep Dive into Event-Driven Architecture",
      category: "Engineering",
      author: "Alex Rivera",
      date: "Mar 15, 2026",
      readTime: 12,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop",
      link: "/news/ai-update"
    },
    {
      title: "The Future of AI-First Development Environments: Next Gen IDEs",
      category: "Intelligence",
      author: "Sarah Chen",
      date: "Mar 12, 2026",
      readTime: 8,
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop",
      link: "/news/ai-update"
    },
    {
      title: "Optimizing Web Vitals: Beyond the Core Lighthouse Score",
      category: "Performance",
      author: "Marcus Thorne",
      date: "Mar 10, 2026",
      readTime: 15,
      image: "https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=2070&auto=format&fit=crop",
      link: "/news/market-news"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <section className="relative pt-32 pb-20 px-8 overflow-hidden">
        <div className="hero-glow" style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', height: '600px', background: 'radial-gradient(circle at 50% 0%, hsla(263, 70%, 50%, 0.15) 0%, transparent 70%)', pointerEvents: 'none', zIndex: -1 }} />
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-[#a855f7] mb-6">
              <TrendingUp style={{ width: '0.75rem', height: '0.75rem' }} />
              <span>Trending in Architecture</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold mb-8 leading-tight">
              Where <span className="gradient-text">Genius</span> Meets <br />
              Modern <span className="gradient-text">Creation</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Explore the finest articles on high-scale architecture, modern web development, and the future of AI in coding.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button className="primary-btn flex items-center gap-2 px-8 py-4">
                Start Reading <ArrowRight style={{ width: '1rem', height: '1rem' }} />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-8 pb-40">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold">Latest Articles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, idx) => (
            <BlogCard key={idx} {...blog} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Home;
