import { useState, useRef, useCallback } from 'react';
import DOMPurify from 'dompurify';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, ArrowLeft, CheckCircle, Loader2, Save,
  Image as LucideImage, Upload, Eye, EyeOff,
  Tag, X, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../layout/AdminLayout';
import { Link } from 'react-router-dom';
import API_BASE_URL, { ADMIN_SECRET } from '../../config';
import { useContent } from '../../context/ContentContext';

const CATEGORIES = ['General News', 'Tech', 'Business', 'Finance', 'Markets', 'Commodities', 'Intelligence'];

/* ─── Markdown file parser ──────────────────────── */
const parseMdFile = (text) => {
  const clean = text.replace(/^---[\s\S]*?---\n?/, '').trim();
  const titleMatch = clean.match(/^#\s+(.+)$/m);
  const title = titleMatch ? titleMatch[1].replace(/\*/g, '').trim() : '';
  const images = [];
  const imgRe = /!\[([^\]]*)\]\(([^)"\s]+)[^)]*\)/g;
  let m;
  while ((m = imgRe.exec(clean)) !== null) {
    const url = m[2];
    if (url.startsWith('http') || url.startsWith('/')) images.push({ alt: m[1] || '', url });
  }
  const content = clean.replace(/^#\s+.+$/m, '').replace(/\n{3,}/g, '\n\n').trim();
  const STOP = new Set(['the','and','for','that','this','with','are','from','they','have','been','will','more','than','your','into','when','but','not','its','was','has','had','can','who','what','how','which','their','there','about','would','could','should','also','some','these','those','other','each','such','well','just','here','does','did','over','after','since','where','while','then','them']);
  const wordFreq = {};
  (clean.toLowerCase().match(/\b[a-z]{5,}\b/g) || []).forEach(w => {
    if (!STOP.has(w)) wordFreq[w] = (wordFreq[w] || 0) + 1;
  });
  const tags = Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);
  const stripped = content.replace(/^#{1,6}\s+.+$/gm, '').replace(/!\[.*?\]\(.*?\)/g, '').replace(/\*\*/g, '').replace(/`/g, '').trim();
  const firstPara = stripped.split('\n\n').find(p => p.trim().length > 30) || '';
  const excerpt = firstPara.replace(/\n/g, ' ').substring(0, 220);
  return { title, content, images, featuredImage: images[0]?.url || '', tags, excerpt };
};

/* ─── Markdown → HTML preview ───────────────────── */
const renderMarkdownPreview = (md) => {
  if (!md) return '';
  return md
    .replace(/^---[\s\S]*?---\n*/m, '')
    .replace(/^#{1}\s+(.+)$/gm, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>')
    .replace(/^#{2}\s+(.+)$/gm, '<h2 class="text-2xl font-bold mt-8 mb-3">$1</h2>')
    .replace(/^#{3}\s+(.+)$/gm, '<h3 class="text-xl font-semibold mt-6 mb-2">$1</h3>')
    .replace(/^\>\s+(.+)$/gm, '<blockquote class="border-l-4 border-orange-500 pl-4 italic my-4 text-slate-400">$1</blockquote>')
    .replace(/\*\*(.+?)\*\*/g,  '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g,      '<em>$1</em>')
    .replace(/`(.+?)`/g,        '<code class="bg-slate-100 dark:bg-slate-800 px-1 rounded text-sm font-mono">$1</code>')
    .replace(/^[-*]\s+(.+)$/gm, '<li class="ml-4 list-disc">$1</li>')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" class="rounded-lg my-4 max-w-full" />')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g,  '<a href="$2" class="text-orange-500 underline">$1</a>')
    .replace(/\n\n/g, '</p><p class="mb-4">')
    .replace(/^(?!<[hbui])/gm, '')
    .replace(/^([^<\n].+)$/gm, l => l.startsWith('<') ? l : `<p class="mb-4">${l}</p>`);
};

/* ─── TagInput ──────────────────────────────────── */
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
    <div className="flex flex-wrap gap-2 p-3 rounded-lg border min-h-[44px] items-center bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      {tags.map(t => (
        <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400">
          {t}
          <button onClick={() => remove(t)} className="cursor-pointer hover:opacity-70 border-none bg-transparent p-0"><X className="w-3 h-3" /></button>
        </span>
      ))}
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={add}
        placeholder={tags.length ? 'Add tag…' : 'Type tag and press Enter'}
        className="bg-transparent border-none outline-none text-sm flex-1 min-w-[80px] text-slate-900 dark:text-white placeholder:text-slate-400"
      />
    </div>
  );
};

const MarkdownUpload = () => {
  const { refreshArticles } = useContent();
  const [success,     setSuccess]     = useState(null);
  const [stage,       setStage]       = useState('upload'); // upload | edit
  const [isDragging,  setIsDragging]  = useState(false);
  const [isParsing,   setIsParsing]   = useState(false);
  const [mdError,     setMdError]     = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [article, setArticle] = useState({
    title: '', content: '', category: 'General News', image: '', tags: [],
    excerpt: '', seo: { metaTitle: '', metaDescription: '' },
    images: [], status: 'draft',
  });

  const processFile = useCallback((file) => {
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
        setArticle(prev => ({
          ...prev,
          title:   parsed.title   || '',
          content: parsed.content || '',
          image:   parsed.featuredImage || '',
          images:  parsed.images  || [],
          tags:    parsed.tags    || [],
          excerpt: parsed.excerpt || '',
          seo:     { metaTitle: parsed.title || '', metaDescription: parsed.excerpt || '' },
        }));
        setStage('edit');
      } catch {
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
    processFile(e.dataTransfer.files[0]);
  }, [processFile]);

  const handleImageUpload = async (file, onSuccess) => {
    if (!file) return;
    setIsUploading(true);
    const form = new FormData();
    form.append('image', file);
    try {
      const res = await axios.post(`${API_BASE_URL}/upload`, form, {
        headers: { Authorization: `Bearer ${ADMIN_SECRET}`, 'Content-Type': 'multipart/form-data' },
      });
      onSuccess(res.data.url || res.data.fileUrl || '');
    } catch {
      alert('Image upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (status = 'published') => {
    if (!article.title) return alert('Title is required');
    if (!article.content) return alert('Content cannot be empty');
    setIsSaving(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/articles`, {
        title: article.title, category: article.category,
        content: article.content, excerpt: article.excerpt,
        image: article.image, tags: article.tags,
        seo: article.seo, status, readTime: 5,
      }, { headers: { Authorization: `Bearer ${ADMIN_SECRET}` } });
      setSuccess({ ...res.data, status });
      refreshArticles();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const inputCls = "w-full px-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-400 transition-colors";

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-sm mb-5 no-underline text-slate-500 hover:text-orange-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Markdown Upload</h1>
          <p className="text-sm mt-1 text-slate-500">Upload a .md file to create an article. Tags and excerpt are auto-extracted.</p>
        </div>

        {/* Success */}
        <AnimatePresence>
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-5 rounded-xl border border-green-200 dark:border-green-500/20 bg-green-50 dark:bg-green-500/10"
            >
              <CheckCircle className="w-5 h-5 mb-2 text-green-500" />
              <p className="text-sm font-bold text-green-600 dark:text-green-400">
                {success.status === 'draft' ? 'Saved as Draft' : 'Published!'}
              </p>
              <p className="text-xs text-slate-500 mt-1">"{success.title || 'Article'}" has been saved.</p>
              {success.slug && (
                <Link
                  to={`/${(success.category || 'general-news').toLowerCase().replace(/\s+/g, '-')}/${success.slug}`}
                  className="text-xs font-semibold no-underline text-orange-500 mt-2 inline-block"
                >
                  View article →
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stage: upload */}
        {stage === 'upload' && (
          <div className="space-y-5">
            <div
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl p-16 text-center cursor-pointer transition-all border-2 border-dashed select-none ${
                isDragging
                  ? 'border-orange-500 bg-orange-50 dark:bg-orange-500/10'
                  : 'border-slate-200 dark:border-slate-700 hover:border-orange-300 bg-slate-50 dark:bg-slate-900/50'
              }`}
            >
              {isParsing
                ? <><Loader2 className="w-10 h-10 mx-auto mb-4 animate-spin text-orange-500" /><p className="text-sm font-medium text-slate-500">Parsing file…</p></>
                : <>
                    <Upload className={`w-10 h-10 mx-auto mb-4 ${isDragging ? 'text-orange-500' : 'text-slate-400'}`} />
                    <p className="text-base font-semibold mb-1 text-slate-900 dark:text-white">Drop a Markdown file here</p>
                    <p className="text-sm text-slate-500">or click to browse · .md files only · max 2 MB</p>
                  </>
              }
            </div>
            <input ref={fileInputRef} type="file" accept=".md" className="hidden" onChange={e => processFile(e.target.files[0])} />

            {mdError && (
              <div className="flex items-start gap-2 p-3 rounded-lg border border-red-200 dark:border-red-500/20 bg-red-50 dark:bg-red-500/10">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400">{mdError}</p>
              </div>
            )}

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-slate-400">Expected .md Format</h4>
              <pre className="text-xs leading-relaxed overflow-x-auto text-slate-500 font-mono">{`# Your Article Title\n\n## Introduction\nYour intro paragraph here...\n\n## Main Section\nContent with **bold** and *italic* text.\n\n![Image alt](https://example.com/image.jpg)\n\n## Conclusion\nFinal thoughts...`}</pre>
            </div>
          </div>
        )}

        {/* Stage: edit */}
        {stage === 'edit' && (
          <div className="space-y-5">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setStage('upload')}
                className="flex items-center gap-1.5 text-sm border-none bg-transparent cursor-pointer text-slate-500 hover:text-orange-500 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Upload different file
              </button>
              <button
                onClick={() => setShowPreview(v => !v)}
                className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border cursor-pointer transition-colors ${
                  showPreview
                    ? 'border-orange-400 text-orange-500 bg-orange-50 dark:bg-orange-500/10'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 bg-transparent hover:border-orange-300'
                }`}
              >
                {showPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPreview ? 'Hide Preview' : 'Show Preview'}
              </button>
            </div>

            {/* Preview */}
            <AnimatePresence>
              {showPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.25 }}
                  className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
                >
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center gap-2">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-500">Preview</span>
                  </div>
                  <div
                    className="p-6 prose-article max-h-[500px] overflow-y-auto bg-white dark:bg-slate-900"
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(renderMarkdownPreview(`# ${article.title}\n\n${article.content}`)) }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Article details */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Article Details</h3>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Title *</label>
                <input value={article.title} onChange={e => setArticle(p => ({ ...p, title: e.target.value }))}
                  className={inputCls + ' font-semibold'} placeholder="Article title…" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Category</label>
                  <select value={article.category} onChange={e => setArticle(p => ({ ...p, category: e.target.value }))}
                    className={inputCls + ' cursor-pointer'}>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Status</label>
                  <select value={article.status} onChange={e => setArticle(p => ({ ...p, status: e.target.value }))}
                    className={inputCls + ' cursor-pointer'}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Featured Image</label>
                <div className="flex gap-2">
                  <input value={article.image} onChange={e => setArticle(p => ({ ...p, image: e.target.value }))}
                    className={inputCls + ' flex-1'} placeholder="Image URL…" />
                  <label className="cursor-pointer flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors bg-slate-50 dark:bg-slate-800">
                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" /> : <LucideImage className="w-4 h-4 text-slate-400" />}
                    <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files[0], url => setArticle(p => ({ ...p, image: url })))} disabled={isUploading} />
                  </label>
                </div>
                {article.image && <img src={article.image} alt="featured" className="mt-2 h-24 rounded-xl object-cover" />}
                {article.images.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs mb-2 text-slate-500">{article.images.length} image(s) found in file — click to set as featured:</p>
                    <div className="flex flex-wrap gap-2">
                      {article.images.map((img, i) => (
                        <div key={i} className="relative group">
                          <img src={img.url} alt={img.alt} className="w-16 h-16 rounded-lg object-cover" onError={e => e.target.style.display = 'none'} />
                          <button
                            onClick={() => setArticle(p => ({ ...p, image: img.url }))}
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
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Excerpt</label>
                <textarea value={article.excerpt} onChange={e => setArticle(p => ({ ...p, excerpt: e.target.value }))}
                  className={inputCls + ' resize-none'} rows={2} placeholder="Short description…" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" /> Tags <span className="normal-case font-normal text-slate-400">(auto-extracted)</span>
                </label>
                <TagInput tags={article.tags} onChange={tags => setArticle(p => ({ ...p, tags }))} />
              </div>
            </div>

            {/* Content editor */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Content (Markdown)</label>
              <textarea
                value={article.content}
                onChange={e => setArticle(p => ({ ...p, content: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-orange-400 transition-colors font-mono leading-relaxed resize-y"
                style={{ minHeight: '320px' }}
                placeholder="Article content in Markdown…"
              />
            </div>

            {/* SEO */}
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">SEO Settings</h3>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Meta Title</label>
                <input value={article.seo.metaTitle} onChange={e => setArticle(p => ({ ...p, seo: { ...p.seo, metaTitle: e.target.value } }))}
                  className={inputCls} placeholder="SEO title (60 chars)…" maxLength={80} />
                <p className="text-xs mt-1 text-slate-400">{article.seo.metaTitle.length}/80</p>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Meta Description</label>
                <textarea value={article.seo.metaDescription} onChange={e => setArticle(p => ({ ...p, seo: { ...p.seo, metaDescription: e.target.value } }))}
                  className={inputCls + ' resize-none'} rows={2} placeholder="SEO description (160 chars)…" maxLength={200} />
                <p className="text-xs mt-1 text-slate-400">{article.seo.metaDescription.length}/200</p>
              </div>
            </div>

            {/* Save row */}
            <div className="flex gap-3">
              <button
                onClick={() => handleSave('draft')}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-orange-400 hover:text-orange-500 transition-colors bg-transparent disabled:opacity-50 cursor-pointer"
              >
                <Save className="w-4 h-4" /> Save Draft
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white transition-colors disabled:opacity-50 cursor-pointer border-none"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Zap className="w-4 h-4" /> Publish</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default MarkdownUpload;
