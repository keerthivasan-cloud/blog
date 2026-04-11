import React, { useState } from 'react';
import AdminLayout from '../layout/AdminLayout';
import { Tag, Plus, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

const Categories = () => {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Tech', count: 12 },
    { id: 2, name: 'Finance', count: 8 },
    { id: 3, name: 'Business', count: 5 },
    { id: 4, name: 'Markets', count: 15 },
    { id: 5, name: 'Commodities', count: 3 }
  ]);
  const [newCat, setNewCat] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newCat.trim()) return;
    setCategories([...categories, { id: Date.now(), name: newCat, count: 0 }]);
    setNewCat('');
    toast.success("Category created successfully");
  };

  const handleDelete = (id) => {
    setCategories(categories.filter(c => c.id !== id));
    toast.success("Category deleted");
  };

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-1">Categories</h1>
            <p className="text-sm text-slate-500">Organize your content into topics.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="md:col-span-1">
             <form onSubmit={handleAdd} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">Add New Category</h2>
                <div className="space-y-2">
                   <label className="text-xs font-medium text-slate-500">Name</label>
                   <input 
                     type="text" 
                     value={newCat}
                     onChange={e => setNewCat(e.target.value)}
                     placeholder="e.g. Artificial Intelligence"
                     className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border-none rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
                   />
                </div>
                <button type="submit" disabled={!newCat.trim()} className="w-full py-2.5 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                   <Plus size={16} /> Create
                </button>
             </form>
          </div>

          <div className="md:col-span-2">
             <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                   <thead>
                     <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 font-medium tracking-wide text-xs uppercase">
                       <th className="px-6 py-4">Category Name</th>
                       <th className="px-6 py-4 text-center">Articles</th>
                       <th className="px-6 py-4 text-right">Actions</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                     {categories.map((cat) => (
                       <tr key={cat.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                         <td className="px-6 py-4">
                           <div className="flex items-center gap-3">
                             <Tag size={16} className="text-slate-400" />
                             <span className="font-medium text-slate-900 dark:text-white">{cat.name}</span>
                           </div>
                         </td>
                         <td className="px-6 py-4 text-center text-slate-500 dark:text-slate-400 font-medium">
                            {cat.count}
                         </td>
                         <td className="px-6 py-4 text-right">
                            <button
                               onClick={() => handleDelete(cat.id)}
                               className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                               <Trash2 size={16} />
                            </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Categories;
