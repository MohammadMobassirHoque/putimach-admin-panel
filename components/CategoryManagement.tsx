import React, { useState, useEffect } from 'react';
import { Category } from '../types';
import { fetchCategories, createCategory, deleteCategory, updateCategory } from '../services/supabaseService';
import { Plus, Trash2, Edit2, Save, X, Tag, Loader2, AlertCircle } from 'lucide-react';

export const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to load categories. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) return;
    
    // Duplicate check locally
    if (categories.some(c => c.name.toLowerCase() === newCategory.trim().toLowerCase())) {
        setError("Category already exists.");
        return;
    }

    setActionLoading(true);
    setError(null);
    try {
      await createCategory(newCategory.trim());
      await loadCategories();
      setNewCategory('');
    } catch (err: any) {
      setError(err.message || "Failed to create category");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure? This will remove the category from the list, but existing products with this category string will remain unchanged.")) return;
    
    setActionLoading(true);
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
    } finally {
      setActionLoading(false);
    }
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditValue(cat.name);
    setError(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setError(null);
  };

  const handleUpdate = async (id: number) => {
    if (!editValue.trim()) return;
    
    // Duplicate check
    if (categories.some(c => c.id !== id && c.name.toLowerCase() === editValue.trim().toLowerCase())) {
        setError("Category name already exists.");
        return;
    }

    setActionLoading(true);
    try {
      await updateCategory(id, editValue.trim());
      await loadCategories();
      setEditingId(null);
    } catch (err: any) {
      setError(err.message || "Failed to update category");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="glass-panel rounded-2xl p-8">
        <div className="flex items-center gap-4 mb-8">
           <div className="p-3 bg-pink-500/10 rounded-xl border border-pink-500/20 shadow-sm backdrop-blur-sm">
             <Tag className="w-8 h-8 text-pink-600" />
           </div>
           <div>
             <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Category Management</h2>
             <p className="text-slate-500 text-sm font-medium">Manage product categories dynamically</p>
           </div>
        </div>

        {error && (
            <div className="mb-6 p-4 bg-red-500/10 text-red-700 rounded-xl flex items-center gap-3 text-sm border border-red-500/20 backdrop-blur-sm">
                <AlertCircle className="w-5 h-5" />
                {error}
            </div>
        )}

        {/* Add Form */}
        <form onSubmit={handleCreate} className="flex gap-4 mb-8 bg-white/40 p-2 pl-4 rounded-xl border border-white/60 shadow-sm backdrop-blur-md">
          <input 
            type="text" 
            value={newCategory} 
            onChange={e => { setNewCategory(e.target.value); setError(null); }}
            className="flex-1 bg-transparent py-2 outline-none text-slate-800 placeholder:text-slate-400 font-medium"
            placeholder="Enter new category name..."
            disabled={actionLoading}
          />
          <button 
            type="submit" 
            disabled={!newCategory.trim() || actionLoading}
            className="px-6 py-2.5 bg-pink-600 text-white font-medium rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-lg shadow-pink-600/30"
          >
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Add Category
          </button>
        </form>

        {/* List */}
        <div className="border border-white/50 rounded-xl overflow-hidden bg-white/20 backdrop-blur-sm">
          {loading ? (
             <div className="p-12 text-center text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-pink-500" />
                Loading categories...
             </div>
          ) : categories.length === 0 ? (
             <div className="p-12 text-center text-slate-500">
                No categories found. Create one above!
             </div>
          ) : (
            <table className="w-full text-left">
                <thead className="bg-white/30 border-b border-white/40">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase">Category Name</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/40">
                    {categories.map(cat => (
                        <tr key={cat.id} className="hover:bg-white/30 group transition-colors">
                            <td className="px-6 py-4">
                                {editingId === cat.id ? (
                                    <input 
                                        type="text" 
                                        value={editValue}
                                        onChange={e => setEditValue(e.target.value)}
                                        className="w-full max-w-sm px-3 py-1.5 border border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white/80"
                                        autoFocus
                                    />
                                ) : (
                                    <span className="font-semibold text-slate-800">{cat.name}</span>
                                )}
                            </td>
                            <td className="px-6 py-4 text-right">
                                {editingId === cat.id ? (
                                    <div className="flex justify-end gap-2">
                                        <button 
                                            onClick={() => handleUpdate(cat.id)}
                                            disabled={actionLoading}
                                            className="p-1.5 text-green-600 hover:bg-green-500/20 rounded-lg transition-colors"
                                        >
                                            <Save className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={cancelEdit}
                                            className="p-1.5 text-slate-400 hover:bg-slate-500/20 rounded-lg transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button 
                                            onClick={() => startEdit(cat)}
                                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-500/10 rounded-lg transition-colors"
                                            title="Edit"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(cat.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-500/10 rounded-lg transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};