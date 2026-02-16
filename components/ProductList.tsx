import React, { useState } from 'react';
import { Product, User } from '../types';
import { exportProductsToCSV } from '../services/exportService';
import { 
  Edit, 
  Trash2, 
  Package, 
  Search, 
  Loader2, 
  Filter, 
  CheckSquare, 
  Square, 
  X, 
  Check, 
  AlertTriangle, 
  Eye, 
  EyeOff, 
  FileSpreadsheet,
  Download
} from 'lucide-react';

interface ProductListProps {
  products: Product[];
  currentUser: User;
  onEdit: (product: Product) => void;
  onDelete: (id: string | number) => Promise<void>;
  onBulkDelete: (ids: (string | number)[]) => Promise<void>;
  onBulkStatusUpdate: (ids: (string | number)[], inStock: boolean) => Promise<void>;
}

export const ProductList: React.FC<ProductListProps> = ({ 
  products, 
  currentUser, 
  onEdit, 
  onDelete, 
  onBulkDelete, 
  onBulkStatusUpdate 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.category.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredProducts.length && filteredProducts.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredProducts.map(p => p.id));
    }
  };

  const toggleSelect = (id: string | number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      await onBulkDelete(selectedIds);
      setSelectedIds([]);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleBulkStatus = async (inStock: boolean) => {
    if (selectedIds.length === 0) return;
    setBulkLoading(true);
    try {
      await onBulkStatusUpdate(selectedIds, inStock);
      setSelectedIds([]);
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExport = () => {
    // Export either selected or all filtered products
    const itemsToExport = selectedIds.length > 0 
      ? products.filter(p => selectedIds.includes(p.id)) 
      : filteredProducts;
    
    exportProductsToCSV(itemsToExport);
  };

  const handleDeleteClick = async (id: string | number) => {
    if (deletingId) return;
    setDeletingId(id);
    try {
      await onDelete(id);
    } catch (error: any) {
      console.error("Delete failed", error);
      alert(error.message || "Failed to delete product. Check console for details.");
    } finally {
      setDeletingId(null);
    }
  };

  const getPriceRange = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants.map(v => v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      return min === max ? min.toFixed(2) : `${min.toFixed(2)} - ${max.toFixed(2)}`;
    }
    return (product.price || 0).toFixed(2);
  };

  const getTotalStock = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      return product.variants.reduce((acc, v) => acc + v.stock, 0);
    }
    return product.stock || 0;
  };

  return (
    <div className="space-y-6 relative">
      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 md:left-[calc(50%+144px)] z-50 animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-blue-900/40 border border-white/10 flex items-center gap-6 backdrop-blur-xl">
             <div className="flex items-center gap-3 pr-6 border-r border-white/10">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-sm">
                  {selectedIds.length}
                </div>
                <span className="text-sm font-semibold whitespace-nowrap">Selected</span>
             </div>
             <div className="flex items-center gap-3">
                <button 
                  disabled={bulkLoading}
                  onClick={() => handleBulkStatus(true)}
                  className="p-2.5 bg-white/5 hover:bg-green-500/20 text-green-400 rounded-xl transition-all border border-white/5 flex items-center gap-2 text-sm font-medium"
                  title="Mark as In Stock"
                >
                  <Eye className="w-4 h-4" /> <span className="hidden sm:inline">In Stock</span>
                </button>
                <button 
                  disabled={bulkLoading}
                  onClick={() => handleBulkStatus(false)}
                  className="p-2.5 bg-white/5 hover:bg-amber-500/20 text-amber-400 rounded-xl transition-all border border-white/5 flex items-center gap-2 text-sm font-medium"
                  title="Mark as Out of Stock"
                >
                  <EyeOff className="w-4 h-4" /> <span className="hidden sm:inline">Out Stock</span>
                </button>
                <button 
                  disabled={bulkLoading}
                  onClick={handleBulkDelete}
                  className="p-2.5 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-xl transition-all border border-red-500/30 flex items-center gap-2 text-sm font-medium"
                  title="Delete Selected"
                >
                  {bulkLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  <span className="hidden sm:inline">Delete Permanent</span>
                </button>
                <button 
                  disabled={bulkLoading}
                  onClick={() => setSelectedIds([])}
                  className="p-2.5 bg-white/5 hover:bg-white/10 text-slate-400 rounded-xl transition-all border border-white/5"
                  title="Deselect All"
                >
                  <X className="w-4 h-4" />
                </button>
             </div>
          </div>
        </div>
      )}

      {/* Search Bar & Header Actions */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center glass-panel p-4 rounded-2xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search catalog or category..." 
            className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input outline-none text-sm placeholder:text-slate-400 text-slate-700"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
           <button 
             onClick={handleExport}
             className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
           >
             <FileSpreadsheet className="w-4 h-4" />
             <span className="hidden sm:inline">Export CSV</span>
             <Download className="w-3 h-3 ml-1 opacity-60" />
           </button>
           
           <div className="h-8 w-px bg-slate-200 hidden sm:block mx-1"></div>

           <div className="flex items-center gap-2 text-sm text-slate-500 font-medium whitespace-nowrap">
              <div className="w-8 h-8 rounded-full bg-white/50 flex items-center justify-center border border-white/40">
                <Filter className="w-4 h-4 text-blue-500" />
              </div>
              <span>{filteredProducts.length} items</span>
           </div>
        </div>
      </div>

      <div className="glass-panel rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/50 bg-white/30 backdrop-blur-md">
                <th className="px-6 py-5 w-10">
                   <button 
                     onClick={toggleSelectAll}
                     className={`p-1 rounded transition-colors ${selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? 'text-blue-600' : 'text-slate-300'}`}
                   >
                     {selectedIds.length === filteredProducts.length && filteredProducts.length > 0 ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                   </button>
                </th>
                <th className="px-2 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Product Info</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider">Price (BDT)</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Inventory</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-5 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/50">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-24 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                       <div className="bg-white/50 p-4 rounded-full mb-3 border border-white/50 shadow-sm">
                         <Package className="w-8 h-8 opacity-40" />
                       </div>
                       <p className="font-medium text-lg text-slate-600">No results found</p>
                       <p className="text-sm opacity-70 mt-1">Adjust your filters or add new products</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const totalStock = getTotalStock(product);
                  const mainImage = product.images?.[0] || product.variants?.[0]?.images?.[0]; 
                  const isDeleting = deletingId === product.id;
                  const isSelected = selectedIds.includes(product.id);
                  
                  return (
                    <tr key={product.id} className={`group hover:bg-white/40 transition-colors duration-300 ${isSelected ? 'bg-blue-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <button 
                          onClick={() => toggleSelect(product.id)}
                          className={`p-1 rounded transition-colors ${isSelected ? 'text-blue-600' : 'text-slate-300 hover:text-slate-400'}`}
                        >
                          {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                        </button>
                      </td>
                      <td className="px-2 py-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-white/80 overflow-hidden shrink-0 border border-white/60 shadow-sm group-hover:shadow-md transition-all group-hover:scale-105">
                            {mainImage ? (
                              <img src={mainImage} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                 <Package className="w-5 h-5 text-slate-300" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-1">{product.name}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold mt-1">ID: {product.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                          {product.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-900 tabular-nums">
                        ৳{getPriceRange(product)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                           <span className={`text-sm font-bold ${totalStock < 10 ? 'text-amber-600' : 'text-slate-700'}`}>{totalStock} units</span>
                           {product.variants && product.variants.length > 0 && (
                             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-50 px-1.5 py-0.5 rounded">{product.variants.length} Variants</span>
                           )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          {totalStock > 0 && product.inStock ? (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-500/20">
                              <Check className="w-3 h-3" />
                              Available
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 px-3 py-1 bg-red-500/10 text-red-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-red-500/20">
                              <AlertTriangle className="w-3 h-3" />
                              Out Stock
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => onEdit(product)}
                            disabled={isDeleting || bulkLoading}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          <button 
                            onClick={() => handleDeleteClick(product.id)}
                            disabled={isDeleting || bulkLoading}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-4 h-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};