import { Quote, List, Type, Image as LucideImage, Sparkles, ChevronRight, BarChart2 } from 'lucide-react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Poll from './Poll';
import AdPlacement from './AdPlacement';
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
  if (!content || !Array.isArray(content)) return null;
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
      <div className="flex items-center gap-3 mb-8 h-marker">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white">Inside This Brief</h3>
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

  const midIndex = Math.floor(blocks.length / 2);

  return (
    <div className="article-content-flow space-y-10">
      {blocks.map((block, idx) => {
        const renderBlock = () => {
          switch (block.type) {
          case 'paragraph':
            return (
              <p key={idx} className="text-xl text-slate-700 dark:text-slate-300 leading-[1.8] font-lora font-normal">
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
                className={`font-black text-foreground tracking-tighter uppercase ${
                  block.level === 3 ? 'text-2xl mt-10 mb-4 h-marker' : 'text-3xl md:text-4xl mt-14 mb-8 border-l-4 border-primary pl-6 h-gradient'
                }`}
              >
                {block.text}
              </HeadingTag>
            );

          case 'list':
            return (
              <ul key={idx} className="space-y-4 my-8 pl-4">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-xl text-slate-700 dark:text-slate-300 font-lora font-normal">
                    <div className="w-2 h-2 bg-primary rounded-full mt-3.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            );

          case 'quote':
            return (
              <blockquote key={idx} className="relative my-12 p-8 md:p-12 bg-muted/30 rounded-2xl border-l-[6px] border-primary/40">
                <Quote className="absolute top-4 left-4 w-10 h-10 text-primary/10 -rotate-12" />
                <p className="relative z-10 text-xl md:text-2xl font-black italic text-foreground leading-tight tracking-tight">
                  "{block.text}"
                </p>
              </blockquote>
            );

          case 'highlight':
            return (
              <div key={idx} className="my-12 p-8 md:p-10 bg-orange-50/30 dark:bg-orange-500/5 border border-orange-100 dark:border-orange-500/20 rounded-[2.5rem] relative overflow-hidden group">
                <Sparkles className="absolute top-[-10%] right-[-5%] w-32 h-32 text-primary/5 group-hover:scale-110 transition-transform duration-1000" />
                <div className="flex items-center gap-3 mb-4 h-marker">
                  <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">Core Insight</span>
                </div>
                <p className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-200 leading-relaxed relative z-10 font-lora">
                  {block.text}
                </p>
              </div>
            );

          case 'image':
            return (
              <figure key={idx} className="my-16 space-y-4">
                <div className="rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-100 dark:border-slate-800">
                  <img src={block.url} alt={block.alt} className="w-full object-cover max-h-[600px] hover:scale-105 transition-transform duration-[2s]" />
                </div>
                {block.alt && (
                  <figcaption className="text-center text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 dark:text-slate-600 px-10">
                    // Access Node: {block.alt}
                  </figcaption>
                )}
              </figure>
            );
 
          case 'poll':
            return (
              <Poll 
                key={idx}
                pollId={`${block.question}-${idx}`}
                question={block.question}
                options={block.options}
              />
            );

          default:
            return null;
        }
        };
        
        return (
          <div key={idx}>
            {renderBlock()}
            {idx === midIndex && <AdPlacement slotId="middle-article-banner" />}
          </div>
        );
      })}
    </div>
  );
};
