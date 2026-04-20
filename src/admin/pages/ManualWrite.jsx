import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap, ArrowLeft, CheckCircle, Loader2, Save,
  Plus, Trash2, Type, AlignLeft, List as ListIcon, Quote,
  Image as LucideImage, Tag, X
} from 'lucide-react';
import axios from 'axios';
import AdminLayout from '../layout/AdminLayout';
import { Link } from 'react-router-dom';
import API_BASE_URL, { ADMIN_SECRET } from '../../config';
import { useContent } from '../../context/ContentContext';

const CATEGORIES = ['General News', 'Tech', 'Business', 'Finance', 'Markets', 'Commodities', 'Intelligence'];

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

const ManualWrite = () => {
  const { refreshArticles } = useContent();
  const [success, setSuccess] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const [article, setArticle] = useState({
    title: '', category: 'General News', readTime: 5, excerpt: '',
    image: '', tags: [],
    seo: { metaTitle: '', metaDescription: '' },
    content: [{ type: 'paragraph', text: '' }],
    status: 'draft',
  });

  const updateBlock = (idx, data) =>
    setArticle(p => { const c = [...p.content]; c[idx] = { ...c[idx], ...data }; return { ...p, content: c }; });
  const removeBlock = (idx) =>
    setArticle(p => ({ ...p, content: p.content.filter((_, i) => i !== idx) }));
  const addBlock = (type) => {
    const b = { type, text: '' };
    if (type === 'list') b.items = [''];
    if (type === 'heading') b.level = 2;
    setArticle(p => ({ ...p, content: [...p.content, b] }));
  };

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
    if (!article.content.length) return alert('Add at least one content block');
    setIsSaving(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/articles`, {
        ...article, status,
        excerpt: article.excerpt || '',
        seo: article.seo,
        tags: article.tags,
      }, { headers: { Authorization: `Bearer ${ADMIN_SECRET}` } });
      setSuccess({ ...res.data, status });
      refreshArticles();
    } catch (err) {
      alert(err.response?.data?.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/admin/dashboard" className="inline-flex items-center gap-1.5 text-sm mb-5 no-underline text-slate-500 hover:text-orange-500 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to dashboard
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Manual Write</h1>
          <p className="text-sm mt-1 text-slate-500">Compose an article using the block editor.</p>
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

        <div className="space-y-5">
          {/* Article info */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Title *</label>
              <input
                value={article.title}
                onChange={e => setArticle(p => ({ ...p, title: e.target.value }))}
                placeholder="Enter article title…"
                className="w-full px-4 py-3 rounded-xl border text-base font-semibold bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-400 transition-colors"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Category</label>
                <select
                  value={article.category}
                  onChange={e => setArticle(p => ({ ...p, category: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-orange-400 transition-colors cursor-pointer"
                >
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Read Time (min)</label>
                <input
                  type="number" min="1" max="60"
                  value={article.readTime}
                  onChange={e => setArticle(p => ({ ...p, readTime: +e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:border-orange-400 transition-colors"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Featured Image</label>
              <div className="flex gap-2">
                <input
                  value={article.image}
                  onChange={e => setArticle(p => ({ ...p, image: e.target.value }))}
                  placeholder="https://… or upload →"
                  className="flex-1 px-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-400 transition-colors"
                />
                <label className="cursor-pointer flex items-center justify-center w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-orange-400 transition-colors bg-slate-50 dark:bg-slate-800">
                  {isUploading
                    ? <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                    : <LucideImage className="w-4 h-4 text-slate-400" />}
                  <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files[0], url => setArticle(p => ({ ...p, image: url })))} disabled={isUploading} />
                </label>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Excerpt</label>
              <textarea
                value={article.excerpt}
                onChange={e => setArticle(p => ({ ...p, excerpt: e.target.value }))}
                placeholder="Short description shown in article listings…"
                rows={2}
                className="w-full px-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-400 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500 flex items-center gap-1.5"><Tag className="w-3.5 h-3.5" /> Tags</label>
              <TagInput tags={article.tags} onChange={tags => setArticle(p => ({ ...p, tags }))} />
            </div>
          </div>

          {/* SEO */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">SEO Settings</h3>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Meta Title</label>
              <input
                value={article.seo.metaTitle}
                onChange={e => setArticle(p => ({ ...p, seo: { ...p.seo, metaTitle: e.target.value } }))}
                placeholder="SEO title (60 chars recommended)"
                maxLength={80}
                className="w-full px-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-400 transition-colors"
              />
              <p className="text-xs mt-1 text-slate-400">{article.seo.metaTitle.length}/80</p>
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2 text-slate-500">Meta Description</label>
              <textarea
                value={article.seo.metaDescription}
                onChange={e => setArticle(p => ({ ...p, seo: { ...p.seo, metaDescription: e.target.value } }))}
                placeholder="SEO description (160 chars recommended)"
                maxLength={200}
                rows={2}
                className="w-full px-4 py-3 rounded-xl border text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none focus:border-orange-400 transition-colors resize-none"
              />
              <p className="text-xs mt-1 text-slate-400">{article.seo.metaDescription.length}/200</p>
            </div>
          </div>

          {/* Block editor */}
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold mb-4 text-slate-900 dark:text-white">Content Blocks</h3>
            <div className="space-y-3 mb-5">
              {article.content.map((block, idx) => (
                <div key={idx} className="group relative p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{block.type}</span>
                    <button
                      onClick={() => removeBlock(idx)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded cursor-pointer border-none bg-transparent text-red-500 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {block.type === 'paragraph' && (
                    <textarea value={block.text} onChange={e => updateBlock(idx, { text: e.target.value })}
                      className="w-full bg-transparent border-none outline-none text-sm leading-relaxed resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
                      placeholder="Paragraph text…" rows={3} />
                  )}
                  {block.type === 'heading' && (
                    <input value={block.text} onChange={e => updateBlock(idx, { text: e.target.value })}
                      className="w-full bg-transparent border-none outline-none text-base font-bold text-slate-900 dark:text-white placeholder:text-slate-400"
                      placeholder="Section heading…" />
                  )}
                  {block.type === 'list' && (
                    <div className="space-y-2">
                      {block.items.map((it, i) => (
                        <input key={i} value={it}
                          onChange={e => { const items = [...block.items]; items[i] = e.target.value; updateBlock(idx, { items }); }}
                          className="w-full bg-transparent border-none outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400"
                          placeholder="List item…" />
                      ))}
                      <button onClick={() => updateBlock(idx, { items: [...block.items, ''] })}
                        className="text-xs border-none bg-transparent cursor-pointer text-orange-500 hover:text-orange-600">
                        + Add item
                      </button>
                    </div>
                  )}
                  {block.type === 'quote' && (
                    <textarea value={block.text} onChange={e => updateBlock(idx, { text: e.target.value })}
                      className="w-full bg-transparent border-none outline-none text-sm italic resize-none text-slate-900 dark:text-white placeholder:text-slate-400"
                      placeholder="Quote text…" rows={2} />
                  )}
                  {block.type === 'image' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input value={block.url || ''} onChange={e => updateBlock(idx, { url: e.target.value })}
                          className="flex-1 px-3 py-2 rounded-lg border text-sm bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white outline-none"
                          placeholder="Image URL…" />
                        <label className="cursor-pointer flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-600">
                          {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5 text-slate-400" />}
                          <input type="file" className="hidden" accept="image/*" onChange={e => handleImageUpload(e.target.files[0], url => updateBlock(idx, { url }))} />
                        </label>
                      </div>
                      <input value={block.alt || ''} onChange={e => updateBlock(idx, { alt: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border text-xs bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white outline-none"
                        placeholder="Alt text…" />
                      {block.url && <img src={block.url} alt={block.alt} className="rounded-lg max-h-32 object-cover" />}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add block */}
            <div className="flex flex-wrap gap-2">
              {[
                { type: 'paragraph', icon: AlignLeft, label: 'Para' },
                { type: 'heading',   icon: Type,      label: 'Heading' },
                { type: 'list',      icon: ListIcon,  label: 'List' },
                { type: 'quote',     icon: Quote,     label: 'Quote' },
                { type: 'image',     icon: LucideImage, label: 'Image' },
              ].map(b => (
                <button key={b.type} onClick={() => addBlock(b.type)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-orange-400 hover:text-orange-500 transition-colors bg-transparent"
                >
                  <b.icon className="w-3.5 h-3.5" /> {b.label}
                </button>
              ))}
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
      </div>
    </AdminLayout>
  );
};

export default ManualWrite;
