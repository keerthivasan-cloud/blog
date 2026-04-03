import React from 'react';
import { motion } from 'framer-motion';
import { Navbar, Footer, BlogCard } from '../components/Layout';

const News = () => {
  const newsItems = [
    {
      title: "Google AI Search: The Next Evolution of Information Retrieval",
      category: "News",
      author: "Emma Watson",
      date: "Mar 18, 2026",
      readTime: 6,
      image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=2070&auto=format&fit=crop",
      link: "/news/ai-update"
    },
    {
      title: "Global Tech Summit 2026: Key Takeaways",
      category: "News",
      author: "James Bond",
      date: "Mar 16, 2026",
      readTime: 10,
      image: "https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?q=80&w=2070&auto=format&fit=crop",
      link: "/news/market-news"
    }
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-7xl mx-auto px-8 pt-32 pb-40">
        <h1 className="text-5xl font-bold mb-12">Latest News</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {newsItems.map((item, idx) => (
            <BlogCard key={idx} {...item} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default News;
