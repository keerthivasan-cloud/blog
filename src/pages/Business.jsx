import React from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer, BlogCard } from '../components/Layout';

const Business = () => {
  const businessItems = [
    {
      title: "Sustainable Business Models in the Age of Automation",
      category: "Business",
      author: "Jane Smith",
      date: "Mar 20, 2026",
      readTime: 15,
      image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2426&auto=format&fit=crop",
      link: "/news/market-news"
    },
    {
      title: "How to Scale Your Startup From 0 to 1 Million Users",
      category: "Business",
      author: "David Lee",
      date: "Mar 18, 2026",
      readTime: 12,
      image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop",
      link: "/news/market-news"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-8 pt-32 pb-40">
        <h1 className="text-5xl font-bold mb-12">Business Insights</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {businessItems.map((item, idx) => (
            <BlogCard key={idx} {...item} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Business;
