import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, PenTool, TrendingUp, Search, Github, Twitter, Linkedin, ArrowRight, Clock } from 'lucide-react';

const Navbar = () => (
  <nav className="glass sticky top-0 z-50 w-full px-8 py-4 flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center border border-primary/20">
        <PenTool className="w-5 h-5 text-[#a855f7]" />
      </div>
      <span className="text-xl font-bold font-['Outfit']">BlogScale</span>
    </div>
    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
      <a href="#" className="hover:text-foreground transition-colors">Home</a>
      <a href="#" className="hover:text-foreground transition-colors">Articles</a>
      <a href="#" className="hover:text-foreground transition-colors">Categories</a>
      <a href="#" className="hover:text-foreground transition-colors">About</a>
    </div>
    <div className="flex items-center gap-4">
      <button className="p-2 hover:bg-secondary rounded-full transition-colors">
        <Search className="w-5 h-5" />
      </button>
      <button className="primary-btn">Write</button>
    </div>
  </nav>
);

const Hero = () => (
  <section className="relative pt-32 pb-20 px-8 overflow-hidden">
    <div className="hero-glow" />
    <div className="max-w-4xl mx-auto text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-[#a855f7] mb-6">
          <TrendingUp className="w-3 h-3" />
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
            Start Reading <ArrowRight className="w-4 h-4" />
          </button>
          <button className="px-8 py-4 rounded-xl border border-border hover:bg-secondary transition-colors font-semibold">
            Browse Archives
          </button>
        </div>
      </motion.div>
    </div>
  </section>
);

const BlogCard = ({ title, category, author, date, readTime, image }) => (
  <motion.div
    whileHover={{ y: -8 }}
    className="glass rounded-3xl overflow-hidden card-hover border-border/40 group"
  >
    <div className="aspect-video w-full overflow-hidden relative">
      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent z-10" />
      <img src={image} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute top-4 left-4 z-20 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-medium">
        {category}
      </div>
    </div>
    <div className="p-6">
      <div className="flex items-center gap-3 text-xs text-muted-foreground mb-4">
        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {readTime} min read</span>
        <span>•</span>
        <span>{date}</span>
      </div>
      <h3 className="text-xl font-bold mb-4 line-clamp-2 leading-snug group-hover:text-[#a855f7] transition-colors">{title}</h3>
      <div className="flex items-center justify-between mt-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-secondary border border-border overflow-hidden" />
          <span className="text-sm font-medium">{author}</span>
        </div>
        <button className="p-2 rounded-full hover:bg-primary/20 text-muted-foreground hover:text-primary transition-all">
          <BookOpen className="w-4 h-4" />
        </button>
      </div>
    </div>
  </motion.div>
);

const Footer = () => (
  <footer className="border-t border-border mt-32 py-16 px-8 bg-secondary/30">
    <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
      <div className="flex items-center gap-2">
        <PenTool className="w-6 h-6 text-[#a855f7]" />
        <span className="text-2xl font-bold font-['Outfit']">BlogScale</span>
      </div>
      <div className="flex gap-8 text-sm text-muted-foreground">
        <a href="#" className="hover:text-foreground">Privacy</a>
        <a href="#" className="hover:text-foreground">Terms</a>
        <a href="#" className="hover:text-foreground">Contact</a>
      </div>
      <div className="flex gap-4">
        <Twitter className="w-5 h-5 text-muted-foreground hover:text-white cursor-pointer" />
        <Github className="w-5 h-5 text-muted-foreground hover:text-white cursor-pointer" />
        <Linkedin className="w-5 h-5 text-muted-foreground hover:text-white cursor-pointer" />
      </div>
    </div>
    <div className="text-center mt-12 text-sm text-muted-foreground/60">
      © 2026 BlogScale. Built with speed and precision.
    </div>
  </footer>
);

function App() {
  const blogs = [
    {
      title: "Mastering Distributed Systems: A Deep Dive into Event-Driven Architecture",
      category: "Engineering",
      author: "Alex Rivera",
      date: "Mar 15, 2026",
      readTime: 12,
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
    },
    {
      title: "The Future of AI-First Development Environments: Next Gen IDEs",
      category: "Intelligence",
      author: "Sarah Chen",
      date: "Mar 12, 2026",
      readTime: 8,
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=2070&auto=format&fit=crop"
    },
    {
      title: "Optimizing Web Vitals: Beyond the Core Lighthouse Score",
      category: "Performance",
      author: "Marcus Thorne",
      date: "Mar 10, 2026",
      readTime: 15,
      image: "https://images.unsplash.com/photo-1551288049-bbbda536339a?q=80&w=2070&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <main className="max-w-7xl mx-auto px-8 pb-40">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold font-['Outfit']">Latest Articles</h2>
          <button className="text-sm font-medium text-primary hover:underline flex items-center gap-1">
            View all articles <ArrowRight className="w-3 h-3" />
          </button>
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
}

export default App;
