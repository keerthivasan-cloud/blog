import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { Quote, List, Type, Image as LucideImage, Sparkles, ChevronRight } from 'lucide-react';

// 1. Reading Progress Bar
export const ReadingProgressBar = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-1.5 bg-primary origin-left z-[100] shadow-[0_4px_12px_rgba(249,115,22,0.3)]"
      style={{ scaleX }}
    />
  );
};

// 2. Table of Contents
export const TableOfContents = ({ content }) => {
  const headings = content.filter(block => block.type === 'heading');

  const scrollToHeading = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const top = element.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  if (headings.length === 0) return null;

  return (
    <nav className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-1.5 h-6 bg-primary rounded-full" />
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white font-['Outfit']">Inside This Brief</h3>
      </div>
      <div className="space-y-4">
        {headings.map((heading, idx) => {
          const id = `heading-${idx}`;
          return (
            <button
              key={id}
              onClick={() => scrollToHeading(id)}
              className={`block w-full text-left group transition-all border-none bg-transparent cursor-pointer ${
                heading.level === 3 ? 'pl-6' : 'pl-0'
              }`}
            >
              <div className="flex items-start gap-3">
                <ChevronRight className="w-3 h-3 mt-1.5 text-slate-300 dark:text-slate-700 transition-colors group-hover:text-primary" />
                <span className="text-sm font-bold text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors leading-relaxed">
                  {heading.text}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

// 3. Block Renderer Component
export const BlockRenderer = ({ blocks }) => {
  if (!blocks || !Array.isArray(blocks)) return null;

  return (
    <div className="article-content-flow space-y-12">
      {blocks.map((block, idx) => {
        switch (block.type) {
          case 'paragraph':
            return (
              <p key={idx} className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 leading-[1.9] font-medium font-['Inter']">
                {block.text}
              </p>
            );

          case 'heading':
            const HeadingTag = block.level === 3 ? 'h3' : 'h2';
            const id = `heading-${blocks.filter((b, i) => b.type === 'heading' && i < idx).length}`;
            return (
              <HeadingTag
                key={idx}
                id={id}
                className={`font-black font-['Outfit'] text-slate-900 dark:text-white tracking-tight ${
                  block.level === 3 ? 'text-3xl mt-16 mb-6' : 'text-4xl md:text-5xl mt-24 mb-10'
                }`}
              >
                {block.text}
              </HeadingTag>
            );

          case 'list':
            return (
              <ul key={idx} className="space-y-6 my-12">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-xl md:text-2xl text-slate-600 dark:text-slate-400 font-medium">
                    <div className="w-2.5 h-2.5 bg-primary/20 border-2 border-primary rounded-full mt-3 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );

          case 'quote':
            return (
              <blockquote key={idx} className="relative my-20 p-12 md:p-16 bg-slate-50 dark:bg-slate-900/40 rounded-[3rem] border-l-[12px] border-primary">
                <Quote className="absolute top-8 left-8 w-16 h-16 text-primary/10 -rotate-12" />
                <p className="relative z-10 text-3xl md:text-4xl font-black font-['Outfit'] italic text-slate-800 dark:text-white leading-tight">
                  "{block.text}"
                </p>
              </blockquote>
            );

          case 'highlight':
            return (
              <div key={idx} className="my-16 p-10 md:p-14 bg-orange-50/50 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 rounded-[3.5rem] relative overflow-hidden group">
                <Sparkles className="absolute top-[-10%] right-[-5%] w-40 h-40 text-primary/5 group-hover:scale-110 transition-transform duration-1000" />
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-orange-500/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-[0.4em] text-primary">Technical Insight</span>
                </div>
                <p className="text-xl md:text-2xl font-bold text-slate-800 dark:text-slate-200 leading-relaxed relative z-10">
                  {block.text}
                </p>
              </div>
            );

          case 'image':
            return (
              <figure key={idx} className="my-20 space-y-4">
                <div className="rounded-[4rem] overflow-hidden shadow-2xl">
                  <img src={block.url} alt={block.alt} className="w-full object-cover max-h-[700px] hover:scale-105 transition-transform duration-[2s]" />
                </div>
                {block.alt && (
                  <figcaption className="text-center text-sm font-black uppercase tracking-widest text-slate-400 dark:text-slate-600 px-10">
                    {block.alt}
                  </figcaption>
                )}
              </figure>
            );

          default:
            return null;
        }
      })}
    </div>
  );
};
