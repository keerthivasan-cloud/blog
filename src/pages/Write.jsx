import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, Sparkles, ArrowLeft, CheckCircle, Loader2, Save,
  Plus, Trash2, Type, AlignLeft, List as ListIcon, Quote,
  Image as LucideImage, FileText, Upload, Eye, EyeOff,
  Tag, X, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../components/AdminLayout';
import { Link } from 'react-router-dom';
import API_BASE_URL from '../config';
import { useContent } from '../context/ContentContext';

/* ─── Markdown parser (client-side) ─────────────── */
const parseMdFile = (text) => {
  // Strip YAML frontmatter
  const clean = text.replace(/^---[\s\S]*?---\n?/, '').trim();

  // H1 → title
  const titleMatch = clean.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].replace(/\*/g, '').trim() : '';

  // Extract images
  const images = [];
  const imgRe = /!\[([^\]]*)\]\(([^)"\s]+)[^)]*\)/g;
  let m;
  while ((m = imgRe.exec(clean)) !== null) {
    const url = m[2];
    if (url.startsWith('http') || url.startsWith('/')) images.push({ alt: m[1] || '', url });
  }

  // Body: remove H1, normalize spacing
  const content = clean
    .replace(/^#\s+.+$/m, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  // Auto-extract tags
  const STOP = new Set([
    'the','and','for','that','this','with','are','from','they','have','been','will',
    'more','than','your','into','when','but','not','its','was','has','had','can',
    'who','what','how','which','their','there','about','would','could','should',
    'also','some','these','those','other','each','such','well','just','here',
    'does','did','over','after','since','where','while','been','then','them',
  ]);
  const wordFreq = {};
  (clean.toLowerCase().match(/\b[a-z]{5,}\b/g) || []).forEach(w => {
    if (!STOP.has(w)) wordFreq[w] = (wordFreq[w] || 0) + 1;
  });
  const tags = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);

  // Excerpt: first substantial paragraph
  const stripped = content
    .replace(/^#{1,6}\s+.+$/gm, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\*\*/g, '')
    .replace(/`/g, '')
    .trim();
  const firstPara = stripped.split('\n\n').find(p => p.trim().length > 30) || '';
  const excerpt = firstPara.replace(/\n/g, ' ').substring(0, 220);

  return { title, content, images, featuredImage: images[0]?.url || '', tags, excerpt };
};

/* ─── Simple markdown → HTML for preview ────────── */
const renderMarkdownPreview = (md) => {
  if (!md) return '';
  return md
    .replace(/^---[\s\S]*?---\n*/m, '')
    .replace(/^#{1}\s+(.+)$/gm, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>')
    .replace(/^#{2}\s+(.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^#{3}\s+(.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^\>\s+(.+)$/gm, '<blockquote class="border-l-4 border-orange-500 pl-4 italic my-4 text-gray-400">$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g,  '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,      '<em>$1</em>')
    .replace(/^[-*]\s+(.+)$/gm, '<li class="ml-6 list-disc mb-1">$1</li>')
    .replace(/(<li[\s\S]*?<\/li>\n?)+/g, s => `<ul class="my-3">${s}</ul>`)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-4 max-w-full" />')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!<[hbui])/gm, '')
    .replace(/^([^<\n].+)$/gm, l => l.startsWith('<') ? l : `<p class="mb-4">${l}</p>`);
};

/* ─── TagInput ───────────────────────────────────── */
const TagInput = ({ tags, onChange }) => {
  const [input, setInput] = useState('');
  const add = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.trim()) {
      e.preventDefault();
      const val = input.trim().toLowerCase().replace(/,/g, '');
      if (val && !tags.includes(val)) onChange([...tags, val]);
      setInput('');
    }
  };
  const remove = (tag) => onChange(tags.filter(t => t !== tag));
  return (
    <div className="flex flex-wrap gap-2 p-3 rounded-lg border min-h-[44px] items-center" style={{ background: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
          {t}
          <button onClick={() => remove(t)} className="cursor-pointer hover:opacity-70 border-none bg-transparent p-0"><X className="w-3 h-3" /></button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={add}
        placeholder={tags.length ? 'Add tag…' : 'Type tag and press Enter'}
        className="bg-transparent border-none outline-none text-sm flex-1 min-w-[120px]"
        style={{ color: 'var(--text-primary)' }}
      />
    </div>
  );
};

/* ─── MODES ──────────────────────────────────────── */
const MODES = [
  { id: 'ai',       icon: Sparkles, label: 'AI Synthesis'   },
  { id: 'manual',   icon: Type,     label: 'Manual Editor'  },
  { id: 'markdown', icon: FileText, label: 'Markdown Upload' },
];

const CATEGORIES = ['Intelligence', 'Tech', 'Finance', 'Business', 'Markets', 'Commodities', 'General News'];

/* ─── Write ──────────────────────────────────────── */
const Write = () => {
  const { refreshArticles } = useContent();
  const [mode,    setMode]    = useState('ai');
  const [success, setSuccess] = useState(null);

  /* ── AI state ── */
  const [genTopic,          setGenTopic]          = useState('');
  const [genCategory,       setGenCategory]       = useState('Intelligence');
  const [genProvider,       setGenProvider]       = useState('auto');
  const [generating,        setGenerating]        = useState(false);
  const [generationStatus,  setGenerationStatus]  = useState('');

  /* ── Manual state ── */
  const [manual, setManual] = useState({
    title: '', category: 'Tech', readTime: 5, excerpt: '',
    image: '', tags: [],
    seo: { metaTitle: '', metaDescription: '' },
    content: [{ type: 'paragraph', text: '' }],
    status: 'published',
  });
  const [isSaving,    setIsSaving]    = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  /* ── Markdown state ── */
  const [mdStage,   setMdStage]   = useState('upload'); // upload | edit | preview
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing,  setIsParsing]  = useState(false);
  const [mdError,    setMdError]    = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [md, setMd] = useState({
    title: '', content: '', category: 'Tech', image: '', tags: [],
    excerpt: '', seo: { metaTitle: '', metaDescription: '' },
    images: [], status: 'published',
  });
  const [mdIsSaving, setMdIsSaving] = useState(false);
  const fileInputRef = useRef(null);

  /* ── AI generate (SSE) ── */
  const handleGenerate = async () => {
    if (!genTopic || generating) return;
    setGenerating(true);
    setSuccess(null);
    setGenerationStatus('Connecting to AI engine…');
    try {
      const res = await fetch(`${API_BASE_URL}/blogs/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer admin123' },
        body: JSON.stringify({ topic: genTopic, category: genCategory, provider: genProvider }),
      });
      if (!res.ok) throw new Error(`Server error ${res.status}`);
      const reader  = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        for (const line of decoder.decode(value, { stream: true }).split('\n')) {
          if (!line.startsWith('data: ')) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.status) setGenerationStatus(data.status);
            if (data.done)   { setSuccess(data); setGenTopic(''); refreshArticles(); }
            if (data.error)  throw new Error(data.error);
          } catch {}
        }
      }
    } catch (err) {
      alert(err.message || 'AI synthesis failed');
      setGenerationStatus('');
    } finally {
      setGenerating(false);
    }
  };

  /* ── Manual save ── */
  const handleManualSave = async (status = 'published') => {
    if (!manual.title) return alert('Title is required');
    if (!manual.content.length) return alert('Add at least one content block');
    setIsSaving(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/articles`, {
        ...manual, status,
        excerpt: manual.excerpt || '',
        seo: manual.seo,
        tags: manual.tags,
      }, { headers: { Authorization: 'Bearer admin123' } });
      setSuccess({ ...res.data, status });
      refreshArticles();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  /* ── File upload (images) ── */
  const handleImageUpload = async (file, onSuccess) => {
    if (!file) return;
    setIsUploading(true);
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await axios.post(`${API_BASE_URL}/upload`, form, {
        headers: { Authorization: 'Bearer admin123', 'Content-Type': 'multipart/form-data' },
      });
      onSuccess(res.data.url || res.data.fileUrl || '');
    } catch {
      alert('Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  /* ── Block helpers ── */
  const updateBlock = (idx, data) =>
    setManual(p => { const c = [...p.content]; c[idx] = { ...c[idx], ...data }; return { ...p, content: c }; });
  const removeBlock = (idx) =>
    setManual(p => ({ ...p, content: p.content.filter((_, i) => i !== idx) }));
  const addBlock = (type) => {
    const b = { type, text: '' };
    if (type === 'list') b.items = [''];
    if (type === 'heading') b.level = 2;
    setManual(p => ({ ...p, content: [...p.content, b] }));
  };

  /* ── MD file processing ── */
  const processMdFile = useCallback((file) => {
    setMdError('');
    if (!file) return;
    if (!file.name.endsWith('.md')) { setMdError('Only .md files are accepted.'); return; }
    if (file.size > 2 * 1024 * 1024) { setMdError('File exceeds 2 MB limit.'); return; }
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        if (!text || text.trim().length < 10) throw new Error('File appears empty.');
        const parsed = parseMdFile(text);
        setMd(prev => ({
          ...prev,
          title:   parsed.title   || '',
          content: parsed.content || '',
          image:   parsed.featuredImage || '',
          images:  parsed.images  || [],
          tags:    parsed.tags    || [],
          excerpt: parsed.excerpt || '',
          seo:     { metaTitle: parsed.title || '', metaDescription: parsed.excerpt || '' },
        }));
        setMdStage('edit');
      } catch (err) {
        setMdError('Invalid markdown file. Please check the format.');
      } finally {
        setIsParsing(false);
      }
    };
    reader.onerror = () => { setMdError('Failed to read file.'); setIsParsing(false); };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    processMdFile(e.dataTransfer.files[0]);
  }, [processMdFile]);

  /* ── Markdown save ── */
  const handleMdSave = async (status = 'published') => {
    if (!md.title) return alert('Title is required');
    if (!md.content) return alert('Content cannot be empty');
    setMdIsSaving(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/articles`, {
        title:    md.title,
        category: md.category,
        content:  md.content,
        excerpt:  md.excerpt,
        image:    md.image,
        tags:     md.tags,
        seo:      md.seo,
        status,
        readTime: 5,
      }, { headers: { Authorization: 'Bearer admin123' } });
      setSuccess({ ...res.data, status });
      refreshArticles();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setMdIsSaving(false);
    }
  };

  /* ── Shared sidebar ── */
  const Sidebar = () => (
    <div className="space-y-6">
      {/* Success panel */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-xl border"
            style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.2)' }}
          >
            <CheckCircle className="w-6 h-6 mb-3" style={{ color: '#22C55E' }} />
            <p className="text-sm font-bold mb-1" style={{ color: '#22C55E' }}>
              {success.status === 'draft' ? 'Saved as Draft' : 'Published!'}
            </p>
            <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
              "{success.title || 'Article'}" is live.
            </p>
            {success.slug && (
              <Link
                to={`/${(success.category || 'intelligence').toLowerCase().replace(/\s+/g, '-')}/${success.slug}`}
                className="text-xs font-semibold no-underline"
                style={{ color: 'var(--accent)' }}
              >
                View article →
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tips */}
      <div className="p-5 rounded-xl" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
        <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Tips</h4>
        <ul className="text-xs space-y-2" style={{ color: 'var(--text-muted)' }}>
          {mode === 'ai'       && <><li>• Be specific with your topic for better results</li><li>• Choose Gemini for long-form, Groq for speed</li></>}
          {mode === 'manual'   && <><li>• Use H2 blocks for section headings</li><li>• SEO fields improve search visibility</li><li>• Save as Draft first, then review</li></>}
          {mode === 'markdown' && <><li>• First # heading becomes the title</li><li>• ## headings create sections</li><li>• Images are auto-extracted</li><li>• Tags are auto-generated from content</li></>}
        </ul>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-10">

        {/* Header */}
        <div className="mb-8">
          <Link
            to="/admin/dashboard"
            className="inline-flex items-center gap-1.5 text-sm mb-5 no-underline transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold" style={{ letterSpacing: '-0.03em' }}>Create Article</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                Write manually, upload Markdown, or generate with AI.
              </p>
            </div>
            {/* Mode tabs */}
            <div className="flex gap-1 p-1 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
              {MODES.map(({ id, icon: Icon, label }) => (
                <button
                  key={id}
                  onClick={() => { setMode(id); setSuccess(null); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium cursor-pointer border-none transition-all"
                  style={{
                    background: mode === id ? 'var(--bg-card)' : 'transparent',
                    color:      mode === id ? 'var(--text-primary)' : 'var(--text-muted)',
                    boxShadow:  mode === id ? 'var(--shadow-sm)' : 'none',
                  }}
                >
                  <Icon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* ── AI MODE ─────────────────────── */}
              {mode === 'ai' && (
                <motion.div key="ai"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  <div className="p-6 rounded-xl space-y-5" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Topic</label>
                      <textarea
                        value={genTopic}
                        onChange={e => setGenTopic(e.target.value)}
                        placeholder="e.g. How AI is replacing software engineers in 2025"
                        className="input resize-none h-28 text-sm leading-relaxed"
                        onKeyDown={e => { if (e.key === 'Enter' && e.metaKey) handleGenerate(); }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Category</label>
                        <select value={genCategory} onChange={e => setGenCategory(e.target.value)}
                          className="input text-sm appearance-none cursor-pointer">
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>AI Engine</label>
                        <select value={genProvider} onChange={e => setGenProvider(e.target.value)}
                          className="input text-sm appearance-none cursor-pointer">
                          <option value="auto">Auto (Fallback)</option>
                          <option value="gemini">Gemini</option>
                          <option value="groq">Groq</option>
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={handleGenerate}
                      disabled={generating || !genTopic.trim()}
                      className="btn-primary w-full justify-center py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {generating
                        ? <><Loader2 className="w-4 h-4 animate-spin" /> {generationStatus || 'Generating…'}</>
                        : <><Zap className="w-4 h-4" /> Generate Article</>
                      }
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── MANUAL MODE ─────────────────── */}
              {mode === 'manual' && (
                <motion.div key="manual"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Header info */}
                  <div className="p-6 rounded-xl space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Title *</label>
                      <input
                        value={manual.title}
                        onChange={e => setManual(p => ({ ...p, title: e.target.value }))}
                        placeholder="Enter article title…"
                        className="input text-base font-semibold"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Category</label>
                        <select value={manual.category} onChange={e => setManual(p => ({ ...p, category: e.target.value }))}
                          className="input text-sm appearance-none cursor-pointer">
                          {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Read Time (min)</label>
                        <input type="number" min="1" max="60" value={manual.readTime}
                          onChange={e => setManual(p => ({ ...p, readTime: +e.target.value }))}
                          className="input text-sm" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Featured Image</label>
                      <div className="flex gap-2">
                        <input
                          value={manual.image}
                          onChange={e => setManual(p => ({ ...p, image: e.target.value }))}
                          placeholder="https://… or upload →"
                          className="input flex-1 text-sm"
                        />
                        <label className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg border transition-colors hover:bg-[var(--bg-soft)]" style={{ borderColor: 'var(--border)' }}>
                          {isUploading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)' }} /> : <LucideImage className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files[0], url => setManual(p => ({ ...p, image: url })))} disabled={isUploading} />
                        </label>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Excerpt</label>
                      <textarea
                        value={manual.excerpt}
                        onChange={e => setManual(p => ({ ...p, excerpt: e.target.value }))}
                        placeholder="Short description shown in article listings…"
                        className="input resize-none h-16 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Tags</label>
                      <TagInput tags={manual.tags} onChange={tags => setManual(p => ({ ...p, tags }))} />
                    </div>
                  </div>

                  {/* SEO */}
                  <div className="p-6 rounded-xl space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <h3 className="text-sm font-bold">SEO Settings</h3>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Meta Title</label>
                      <input
                        value={manual.seo.metaTitle}
                        onChange={e => setManual(p => ({ ...p, seo: { ...p.seo, metaTitle: e.target.value } }))}
                        placeholder="SEO title (60 chars recommended)"
                        className="input text-sm"
                        maxLength={80}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{manual.seo.metaTitle.length}/80</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Meta Description</label>
                      <textarea
                        value={manual.seo.metaDescription}
                        onChange={e => setManual(p => ({ ...p, seo: { ...p.seo, metaDescription: e.target.value } }))}
                        placeholder="SEO description (160 chars recommended)"
                        className="input resize-none h-16 text-sm"
                        maxLength={200}
                      />
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{manual.seo.metaDescription.length}/200</p>
                    </div>
                  </div>

                  {/* Block editor */}
                  <div className="p-6 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                    <h3 className="text-sm font-bold mb-4">Content Blocks</h3>
                    <div className="space-y-3 mb-5">
                      {manual.content.map((block, idx) => (
                        <div key={idx} className="group relative p-4 rounded-lg" style={{ background: 'var(--bg-soft)', border: '1px solid var(--border)' }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{block.type}</span>
                            <button onClick={() => removeBlock(idx)} className="opacity-0 group-hover:opacity-100 p-1 rounded cursor-pointer border-none bg-transparent transition-opacity" style={{ color: 'var(--red)' }}><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                          {block.type === 'paragraph' && (
                            <textarea value={block.text} onChange={e => updateBlock(idx, { text: e.target.value })}
                              className="w-full bg-transparent border-none outline-none text-sm leading-relaxed resize-none"
                              style={{ color: 'var(--text-primary)' }} placeholder="Paragraph text…" rows={3} />
                          )}
                          {block.type === 'heading' && (
                            <input value={block.text} onChange={e => updateBlock(idx, { text: e.target.value })}
                              className="w-full bg-transparent border-none outline-none text-base font-bold"
                              style={{ color: 'var(--text-primary)' }} placeholder="Section heading…" />
                          )}
                          {block.type === 'list' && (
                            <div className="space-y-2">
                              {block.items.map((it, i) => (
                                <input key={i} value={it}
                                  onChange={e => { const items = [...block.items]; items[i] = e.target.value; updateBlock(idx, { items }); }}
                                  className="w-full bg-transparent border-none outline-none text-sm"
                                  style={{ color: 'var(--text-primary)' }} placeholder="List item…" />
                              ))}
                              <button onClick={() => updateBlock(idx, { items: [...block.items, ''] })}
                                className="text-xs border-none bg-transparent cursor-pointer" style={{ color: 'var(--accent)' }}>
                                + Add item
                              </button>
                            </div>
                          )}
                          {block.type === 'quote' && (
                            <textarea value={block.text} onChange={e => updateBlock(idx, { text: e.target.value })}
                              className="w-full bg-transparent border-none outline-none text-sm italic resize-none"
                              style={{ color: 'var(--text-primary)' }} placeholder="Quote text…" rows={2} />
                          )}
                          {block.type === 'image' && (
                            <div className="space-y-2">
                              <div className="flex gap-2">
                                <input value={block.url || ''} onChange={e => updateBlock(idx, { url: e.target.value })}
                                  className="flex-1 input text-sm" placeholder="Image URL…" />
                                <label className="cursor-pointer flex items-center justify-center w-9 h-9 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />}
                                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files[0], url => updateBlock(idx, { url }))} />
                                </label>
                              </div>
                              <input value={block.alt || ''} onChange={e => updateBlock(idx, { alt: e.target.value })}
                                className="input text-xs" placeholder="Alt text…" />
                              {block.url && <img src={block.url} alt={block.alt} className="rounded-lg max-h-32 object-cover" />}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    {/* Add block buttons */}
                    <div className="flex flex-wrap gap-2">
                      {[
                        { type: 'paragraph', icon: AlignLeft, label: 'Para' },
                        { type: 'heading',   icon: Type,      label: 'Heading' },
                        { type: 'list',      icon: ListIcon,  label: 'List' },
                        { type: 'quote',     icon: Quote,     label: 'Quote' },
                        { type: 'image',     icon: LucideImage, label: 'Image' },
                      ].map(b => (
                        <button key={b.type} onClick={() => addBlock(b.type)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer border transition-colors"
                          style={{ background: 'var(--bg-soft)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                        >
                          <b.icon className="w-3.5 h-3.5" /> {b.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Publish row */}
                  <div className="flex gap-3">
                    <button onClick={() => handleManualSave('draft')} disabled={isSaving}
                      className="btn-ghost flex-1 justify-center py-2.5 disabled:opacity-50">
                      <Save className="w-4 h-4" /> Save Draft
                    </button>
                    <button onClick={() => handleManualSave('published')} disabled={isSaving}
                      className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-50">
                      {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" /> Publish</>}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── MARKDOWN MODE ────────────────── */}
              {mode === 'markdown' && (
                <motion.div key="markdown"
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* Stage: upload */}
                  {mdStage === 'upload' && (
                    <div>
                      {/* Drop zone */}
                      <div
                        onDrop={handleDrop}
                        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl p-16 text-center cursor-pointer transition-all select-none"
                        style={{
                          border: `2px dashed ${isDragging ? 'var(--accent)' : 'var(--border)'}`,
                          background: isDragging ? 'var(--accent-soft)' : 'var(--bg-soft)',
                        }}
                      >
                        {isParsing
                          ? <><Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin" style={{ color: 'var(--accent)' }} /><p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>Parsing file…</p></>
                          : <><Upload className="w-10 h-10 mx-auto mb-4" style={{ color: isDragging ? 'var(--accent)' : 'var(--text-muted)' }} /><p className="text-base font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Drop a Markdown file here</p><p className="text-sm" style={{ color: 'var(--text-muted)' }}>or click to browse · .md files only · max 2 MB</p></>
                        }
                      </div>
                      <input ref={fileInputRef} type="file" accept=".md" className="hidden" onChange={e => processMdFile(e.target.files[0])} />

                      {mdError && (
                        <div className="mt-3 flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)' }}>
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--red)' }} />
                          <p className="text-sm" style={{ color: 'var(--red)' }}>{mdError}</p>
                        </div>
                      )}

                      {/* Format guide */}
                      <div className="mt-6 p-5 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <h4 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>Expected .md Format</h4>
                        <pre className="text-xs leading-relaxed overflow-x-auto" style={{ color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
{`# Your Article Title

## Introduction
Your intro paragraph here...

## Main Section
Content with **bold** and *italic* text.

![Image alt text](https://example.com/image.jpg)

## Conclusion
Final thoughts...`}
                        </pre>
                      </div>
                    </div>
                  )}

                  {/* Stage: edit / preview */}
                  {mdStage === 'edit' && (
                    <div className="space-y-5">
                      {/* Toolbar */}
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => setMdStage('upload')}
                          className="flex items-center gap-1.5 text-sm border-none bg-transparent cursor-pointer transition-colors"
                          style={{ color: 'var(--text-muted)' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                        >
                          <ArrowLeft className="w-4 h-4" /> Upload different file
                        </button>
                        <button
                          onClick={() => setShowPreview(v => !v)}
                          className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md border cursor-pointer transition-colors"
                          style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', background: showPreview ? 'var(--accent-soft)' : 'transparent' }}
                        >
                          {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          {showPreview ? 'Hide Preview' : 'Show Preview'}
                        </button>
                      </div>

                      {/* Preview panel */}
                      <AnimatePresence>
                        {showPreview && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                            className="rounded-xl overflow-hidden"
                            style={{ border: '1px solid var(--border)' }}
                          >
                            <div className="px-2 py-1.5 border-b flex items-center gap-2" style={{ background: 'var(--bg-soft)', borderColor: 'var(--border)' }}>
                              <Eye className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                              <span className="text-xs font-medium" style={{ color: 'var(--text-muted)' }}>Preview</span>
                            </div>
                            <div
                              className="p-6 prose-article max-h-[500px] overflow-y-auto"
                              style={{ background: 'var(--bg-card)' }}
                              dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(`# ${md.title}\n\n${md.content}`) }}
                            />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Parsed form */}
                      <div className="p-6 rounded-xl space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <h3 className="text-sm font-bold">Article Details</h3>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Title *</label>
                          <input value={md.title} onChange={e => setMd(p => ({ ...p, title: e.target.value }))} className="input text-base font-semibold" placeholder="Article title…" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Category</label>
                            <select value={md.category} onChange={e => setMd(p => ({ ...p, category: e.target.value }))} className="input text-sm appearance-none cursor-pointer">
                              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Status</label>
                            <select value={md.status} onChange={e => setMd(p => ({ ...p, status: e.target.value }))} className="input text-sm appearance-none cursor-pointer">
                              <option value="published">Published</option>
                              <option value="draft">Draft</option>
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Featured Image</label>
                          <div className="flex gap-2">
                            <input value={md.image} onChange={e => setMd(p => ({ ...p, image: e.target.value }))} className="input flex-1 text-sm" placeholder="Image URL…" />
                            <label className="cursor-pointer flex items-center justify-center w-10 h-10 rounded-lg border" style={{ borderColor: 'var(--border)' }}>
                              {isUploading ? <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'var(--text-muted)' }} /> : <LucideImage className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />}
                              <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files[0], url => setMd(p => ({ ...p, image: url })))} disabled={isUploading} />
                            </label>
                          </div>
                          {md.image && <img src={md.image} alt="featured" className="mt-2 h-24 rounded-lg object-cover" />}
                          {/* Images extracted from MD */}
                          {md.images.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{md.images.length} image(s) found in file:</p>
                              <div className="flex flex-wrap gap-2">
                                {md.images.map((img, i) => (
                                  <div key={i} className="relative group">
                                    <img src={img.url} alt={img.alt} className="w-16 h-16 rounded-lg object-cover" onError={e => e.target.style.display = 'none'} />
                                    <button
                                      onClick={() => setMd(p => ({ ...p, image: img.url }))}
                                      className="absolute inset-0 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-bold text-white"
                                      style={{ background: 'rgba(0,0,0,0.6)' }}
                                    >Set Featured</button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Excerpt</label>
                          <textarea value={md.excerpt} onChange={e => setMd(p => ({ ...p, excerpt: e.target.value }))} className="input resize-none h-16 text-sm" placeholder="Short description…" />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Tags <span className="normal-case font-normal" style={{ color: 'var(--text-muted)' }}>(auto-extracted)</span></label>
                          <TagInput tags={md.tags} onChange={tags => setMd(p => ({ ...p, tags }))} />
                        </div>
                      </div>

                      {/* Content editor */}
                      <div className="p-6 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Content (Markdown)</label>
                        <textarea
                          value={md.content}
                          onChange={e => setMd(p => ({ ...p, content: e.target.value }))}
                          className="input resize-y font-mono text-sm leading-relaxed"
                          style={{ minHeight: '320px', fontFamily: 'monospace' }}
                          placeholder="Article content in Markdown…"
                        />
                      </div>

                      {/* SEO */}
                      <div className="p-6 rounded-xl space-y-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
                        <h3 className="text-sm font-bold">SEO Settings</h3>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Meta Title</label>
                          <input value={md.seo.metaTitle} onChange={e => setMd(p => ({ ...p, seo: { ...p.seo, metaTitle: e.target.value } }))} className="input text-sm" placeholder="SEO title (60 chars)…" maxLength={80} />
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{md.seo.metaTitle.length}/80</p>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>Meta Description</label>
                          <textarea value={md.seo.metaDescription} onChange={e => setMd(p => ({ ...p, seo: { ...p.seo, metaDescription: e.target.value } }))} className="input resize-none h-16 text-sm" placeholder="SEO description (160 chars)…" maxLength={200} />
                          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{md.seo.metaDescription.length}/200</p>
                        </div>
                      </div>

                      {/* Publish row */}
                      <div className="flex gap-3">
                        <button onClick={() => handleMdSave('draft')} disabled={mdIsSaving}
                          className="btn-ghost flex-1 justify-center py-2.5 disabled:opacity-50">
                          <Save className="w-4 h-4" /> Save Draft
                        </button>
                        <button onClick={() => handleMdSave('published')} disabled={mdIsSaving}
                          className="btn-primary flex-1 justify-center py-2.5 disabled:opacity-50">
                          {mdIsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" /> Publish</>}
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Sidebar */}
          <div className="lg:sticky lg:top-20 self-start">
            <Sidebar />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Write;
