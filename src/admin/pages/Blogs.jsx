import React, { useState } from 'react';
import { useContent } from '../../context/ContentContext';
import { Link } from 'react-router-dom';
import AdminLayout from '../layout/AdminLayout';
import ConfirmDialog from '../components/ConfirmDialog';
import { Search, Plus, Edit2, Trash2, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Blogs = () => {
  const { articles, deleteArticle } = useContent();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [confirmDelete, setConfirmDelete] = useState({ open: false, id: null });

  const handleDelete = async () => {
    if (!confirmDelete.id) return;
    try {
      await deleteArticle(confirmDelete.id);
      toast.success("Article deleted successfully");
    } catch (err) {
      toast.error("Failed to delete article");
    }
    setConfirmDelete({ open: false, id: null });
  };

  const filteredArticles = articles.filter(a => {
    const matchesSearch = a.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || (a.status || 'published') === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-1">Blogs</h1>
          <p className="text-sm text-slate-500">Manage your publication content.</p>
        </div>
        <Link to="/admin/editor/new" className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
           <Plus size={16} /> Compose Post
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
         {/* Filters */}
         <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-4">
            <div className="relative flex-1 w-full max-w-sm">
               <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
               <input 
                 type="text" 
                 placeholder="Search posts..." 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
                 className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-shadow text-slate-900 dark:text-white"
               />
            </div>
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-sm text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-primary/20 outline-none w-full sm:w-auto cursor-pointer"
            >
               <option value="All">All Status</option>
               <option value="Published">Published</option>
               <option value="Draft">Drafts</option>
            </select>
         </div>

         {/* Table */}
         <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
               <thead>
                 <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 font-medium tracking-wide text-xs uppercase">
                    <th className="px-3 sm:px-4 md:px-6 py-4">Title</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4">Status</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 hidden md:table-cell">Category</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 hidden sm:table-cell">Published</th>
                    <th className="px-3 sm:px-4 md:px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {filteredArticles.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-3 sm:px-4 md:px-6 py-12 text-center text-slate-500">
                        <span className="block mb-2">No blogs found.</span>
                        <button onClick={() => {setSearchTerm(''); setStatusFilter('All');}} className="text-primary hover:underline font-medium">Clear filters</button>
                      </td>
                    </tr>
                  ) : (
                    filteredArticles.map(article => (
                      <tr key={article._id || article.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                        <td className="px-3 sm:px-4 md:px-6 py-4">
                          <Link to={`/admin/editor/${article.slug}`} className="font-semibold text-slate-900 dark:text-white hover:text-primary transition-colors line-clamp-1 block max-w-sm">
                            {article.title}
                          </Link>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border
                            ${(article.status || 'published') === 'published' 
                              ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-500/10 dark:text-green-400 dark:border-green-500/20' 
                              : 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-500/10 dark:text-yellow-400 dark:border-yellow-500/20'}`
                          }>
                            {(article.status || 'published') === 'published' ? <CheckCircle size={12} /> : <Clock size={12} />}
                            <span className="capitalize">{article.status || 'published'}</span>
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 text-slate-500 dark:text-slate-400 hidden md:table-cell capitalize">
                           {article.category || 'Uncategorized'}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 text-slate-500 dark:text-slate-400 hidden sm:table-cell">
                           {new Date(article.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-3 sm:px-4 md:px-6 py-4 text-right">
                           <div className="flex items-center justify-end gap-2 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <Link 
                                to={`/admin/editor/${article.slug}`}
                                className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                              >
                                 <Edit2 size={16} />
                              </Link>
                              <button
                                onClick={() => setConfirmDelete({ open: true, id: article._id || article.id })}
                                className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors"
                              >
                                 <Trash2 size={16} />
                              </button>
                           </div>
                        </td>
                     </tr>
                   ))
                 )}
               </tbody>
            </table>
         </div>
      </div>

      <ConfirmDialog 
        isOpen={confirmDelete.open}
        onClose={() => setConfirmDelete({ open: false, id: null })}
        onConfirm={handleDelete}
        title="Delete Blog Post"
        message="Are you sure you want to delete this blog post? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </AdminLayout>
  );
};

export default Blogs;
