import React, { useState, useEffect } from 'react';
import { Product, AppConfig, INITIAL_PRODUCT, Category } from '../types';
import { uploadImageToCloudinary } from '../services/cloudinaryService';
import { fetchCategories } from '../services/supabaseService';
import { 
  X, Loader2, UploadCloud, ArrowLeft, ArrowRight, GripHorizontal, RefreshCcw, Tag as TagIcon, Plus, Palette
} from 'lucide-react';

interface ProductFormProps {
  product?: Product | null;
  config: AppConfig;
  onSubmit: (product: Product) => Promise<void>;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ product, config, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Product>(product ? 
    { 
      ...product, 
      currency: 'BDT', 
      variants: product.variants || [], 
      sizes: product.sizes || [], 
      colors: product.colors || [], 
      images: product.images || [] 
    } : 
    { ...INITIAL_PRODUCT, currency: 'BDT' }
  );
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [globalImageUploading, setGlobalImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{current: number, total: number} | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  
  const [sizeInput, setSizeInput] = useState('');
  const [colorInput, setColorInput] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (product) {
      setFormData({ 
        ...product, 
        currency: 'BDT',
        variants: product.variants || [], 
        sizes: product.sizes || [], 
        colors: product.colors || [], 
        images: product.images || [] 
      });
    }
  }, [product]);

  const loadCategories = async () => {
    setCategoryLoading(true);
    try {
        const cats = await fetchCategories();
        setCategories(cats);
    } catch (e) {
        console.error("Failed to load categories", e);
    } finally {
        setCategoryLoading(false);
    }
  };

  const handleGlobalChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: (name === 'price' || name === 'stock') ? (parseFloat(value) || 0) : value 
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
  };

  const addSize = () => {
    const val = sizeInput.trim();
    if (val && !formData.sizes.includes(val)) {
      setFormData(prev => ({ ...prev, sizes: [...prev.sizes, val] }));
      setSizeInput('');
    }
  };

  const removeSize = (size: string) => {
    setFormData(prev => ({ ...prev, sizes: prev.sizes.filter(s => s !== size) }));
  };

  const addColor = () => {
    const val = colorInput.trim();
    if (val && !formData.colors.includes(val)) {
      setFormData(prev => ({ ...prev, colors: [...prev.colors, val] }));
      setColorInput('');
    }
  };

  const removeColor = (color: string) => {
    setFormData(prev => ({ ...prev, colors: prev.colors.filter(c => c !== color) }));
  };

  const handleGlobalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setGlobalImageUploading(true);
    
    const files = Array.from(e.target.files) as File[];
    const totalFiles = files.length;
    setUploadProgress({ current: 0, total: totalFiles });

    const BATCH_SIZE = 3; 
    
    try {
      for (let i = 0; i < totalFiles; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        const uploadPromises = batch.map(file => uploadImageToCloudinary(file, config));
        const results = await Promise.allSettled(uploadPromises);
        
        const batchUrls: string[] = [];
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            batchUrls.push(result.value);
          }
        });
        
        setFormData(prev => ({ ...prev, images: [...prev.images, ...batchUrls] }));
        setUploadProgress(prev => prev ? ({ ...prev, current: Math.min(prev.current + batch.length, totalFiles) }) : null);
      }
    } catch (error) {
      console.error(error);
      alert("Error uploading images.");
    } finally {
      setGlobalImageUploading(false);
      setUploadProgress(null);
      e.target.value = '';
    }
  };

  const removeGlobalImage = (index: number) => {
    setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const newImages = [...formData.images];
    if (direction === 'left' && index > 0) {
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]];
    } else if (direction === 'right' && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    }
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    const newImages = [...formData.images];
    const itemToMove = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, itemToMove);
    setFormData(prev => ({ ...prev, images: newImages }));
    setDraggedIndex(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!formData.price || formData.price < 0)) {
      alert("Please set a valid Price.");
      return;
    }
    if (!formData.category) {
      alert("Please select a category.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit({ ...formData, currency: 'BDT' });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-8">
      <div className="flex justify-between items-center mb-8 border-b border-slate-200/50 pb-6">
        <h2 className="text-2xl font-bold text-slate-800 tracking-tight">
          {product ? 'Edit Product' : 'Add New Product'}
        </h2>
        <button onClick={onCancel} className="text-slate-400 hover:text-slate-700 transition-colors p-2 hover:bg-white/50 rounded-lg">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* SECTION 1: GENERAL INFO */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1 h-4 bg-blue-500 rounded-full"></span>
            General Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">Product Name <span className="text-red-500">*</span></label>
              <input required type="text" name="name" value={formData.name} onChange={handleGlobalChange} className="w-full px-4 py-3 rounded-xl glass-input outline-none" placeholder="e.g. Premium Cotton T-Shirt" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex justify-between">
                  <span>Category <span className="text-red-500">*</span></span>
                  <button type="button" onClick={loadCategories} title="Refresh Categories" className="text-blue-600 hover:text-blue-800">
                     {categoryLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCcw className="w-3 h-3" />}
                  </button>
              </label>
              <select
                required
                name="category"
                value={formData.category}
                onChange={handleGlobalChange}
                className="w-full px-4 py-3 rounded-xl glass-input outline-none text-slate-700"
                disabled={categoryLoading}
              >
                <option value="" disabled>Select Category</option>
                {categories.map(cat => (
                    <option key={cat.id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Currency</label>
              <div className="w-full px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-500 font-bold flex items-center gap-2">
                <span>BDT (৳)</span>
                <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded uppercase font-bold text-slate-400">Locked</span>
              </div>
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Base Price (BDT)</label>
               <input type="number" name="price" value={formData.price} onChange={handleGlobalChange} className="w-full px-4 py-3 rounded-xl glass-input outline-none" placeholder="0.00" />
            </div>
            <div>
               <label className="block text-sm font-medium text-slate-700 mb-2">Initial Stock</label>
               <input type="number" name="stock" value={formData.stock} onChange={handleGlobalChange} className="w-full px-4 py-3 rounded-xl glass-input outline-none" placeholder="0" />
            </div>
          </div>
        </div>

        {/* SECTION 2: ATTRIBUTES */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1 h-4 bg-purple-500 rounded-full"></span>
            Product Attributes
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Available Sizes</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <TagIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={sizeInput}
                    onChange={e => setSizeInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input outline-none text-sm"
                    placeholder="e.g. S, M, XL, 42..."
                  />
                </div>
                <button type="button" onClick={addSize} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-white/30 rounded-xl border border-dashed border-slate-300">
                {formData.sizes.map(size => (
                  <span key={size} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-lg border border-blue-200">
                    {size}
                    <button type="button" onClick={() => removeSize(size)} className="hover:text-blue-900"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Available Colors</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    value={colorInput}
                    onChange={e => setColorInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input outline-none text-sm"
                    placeholder="e.g. Red, Navy, Black..."
                  />
                </div>
                <button type="button" onClick={addColor} className="p-2.5 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"><Plus className="w-5 h-5" /></button>
              </div>
              <div className="flex flex-wrap gap-2 min-h-[40px] p-3 bg-white/30 rounded-xl border border-dashed border-slate-300">
                {formData.colors.map(color => (
                  <span key={color} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg border border-purple-200">
                    {color}
                    <button type="button" onClick={() => removeColor(color)} className="hover:text-purple-900"><X className="w-3 h-3" /></button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: MEDIA */}
        <div className="space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
            <span className="w-1 h-4 bg-amber-500 rounded-full"></span>
            Product Media
          </h3>
          <div>
             <div className="border-2 border-dashed border-slate-300/60 rounded-2xl bg-white/30 hover:bg-white/50 transition-all p-8 mb-6 group relative backdrop-blur-sm">
                 <input type="file" multiple accept="image/*" onChange={handleGlobalImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" disabled={globalImageUploading} />
                 <div className="flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-blue-100/50 text-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10 ring-4 ring-white/40">
                       {globalImageUploading ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-1">Upload Product Photos</h3>
                    <p className="text-sm text-slate-500 max-w-sm mx-auto">{globalImageUploading ? `Uploading ${uploadProgress?.current}/${uploadProgress?.total}` : 'Drag and drop multiple images or click to browse'}</p>
                 </div>
             </div>

             {formData.images.length > 0 && (
               <div className="bg-white/40 rounded-xl border border-white/50 p-4 max-h-[400px] overflow-y-auto backdrop-blur-sm">
                 <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                   {formData.images.map((img, idx) => (
                     <div key={idx} draggable onDragStart={(e) => handleDragStart(e, idx)} onDragOver={(e) => handleDragOver(e, idx)} onDrop={(e) => handleDrop(e, idx)} className={`relative aspect-square rounded-lg overflow-hidden border border-white/60 group bg-white shadow-sm transition-all ${draggedIndex === idx ? 'opacity-40 scale-95' : 'hover:ring-2 hover:ring-blue-500/20'}`}>
                       <img src={img} alt="" className="w-full h-full object-cover" />
                       <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                         <div className="flex justify-between">
                            <div className="p-1 bg-white/20 rounded cursor-grab active:cursor-grabbing"><GripHorizontal className="w-3 text-white" /></div>
                            <button type="button" onClick={() => removeGlobalImage(idx)} className="p-1 bg-red-500 text-white rounded hover:bg-red-600"><X className="w-3 h-3" /></button>
                         </div>
                         <div className="flex justify-center gap-1">
                            <button type="button" onClick={() => moveImage(idx, 'left')} disabled={idx === 0} className="p-1 rounded bg-white/20 text-white disabled:opacity-30"><ArrowLeft className="w-3 h-3" /></button>
                            <span className="bg-black/40 text-white text-[10px] px-1.5 rounded">{idx + 1}</span>
                            <button type="button" onClick={() => moveImage(idx, 'right')} disabled={idx === formData.images.length - 1} className="p-1 rounded bg-white/20 text-white disabled:opacity-30"><ArrowRight className="w-3 h-3" /></button>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}
          </div>
        </div>

        {/* SECTION 4: DETAILS */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
             <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
               <span className="w-1 h-4 bg-teal-500 rounded-full"></span>
               Product Story
             </h3>
          </div>
          <textarea 
            name="description" 
            rows={4} 
            value={formData.description} 
            onChange={handleGlobalChange} 
            className="w-full px-4 py-3 rounded-xl glass-input outline-none resize-none transition-all focus:h-32" 
            placeholder="Detailed product description..."
          />
          <div className="flex gap-6 p-4 bg-white/30 rounded-xl border border-white/40">
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" name="isNew" checked={formData.isNew} onChange={handleCheckboxChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-slate-300" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">Mark as New Arrival</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <input type="checkbox" name="inStock" checked={formData.inStock} onChange={handleCheckboxChange} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-slate-300" />
              <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">Active / In Stock</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-8 border-t border-slate-200/50">
          <button type="button" onClick={onCancel} className="px-6 py-3 text-slate-600 hover:bg-white/50 rounded-xl transition-colors font-medium">Cancel</button>
          <button type="submit" disabled={loading} className="px-10 py-3 bg-slate-900 text-white hover:bg-black rounded-xl transition-all font-semibold flex items-center gap-2 shadow-xl shadow-slate-900/20">
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {product ? 'Save Changes' : 'Create Product'}
          </button>
        </div>
      </form>
    </div>
  );
};