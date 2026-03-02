import React, { useState, useEffect, useRef } from 'react';
import { Product, Note, ProductVariant } from '../../types';
import { UploadCloud, RefreshCw, Plus, Trash2, Image as ImageIcon, Tag, Layers, Droplets } from 'lucide-react';

interface ProductFormProps {
  token: string;
  initialData?: Product | null;
  onSuccess: () => void;
  onCancel: () => void;
  onAuthError: () => void;
}

export default function ProductForm({ token, initialData, onSuccess, onCancel, onAuthError }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    brand: initialData?.brand || '',
    description: initialData?.description || '',
    imageUrl: initialData?.imageUrl || '',
    images: initialData?.images || [],
    price: initialData?.price?.toString() || '',
    gender: initialData?.gender || 'Unisex',
    concentration: initialData?.concentration || 'EDP',
    stockThreshold: initialData?.stockThreshold?.toString() || '10',
    topNotes: initialData ? initialData.topNotes.map(n => n.name).join(', ') : '',
    heartNotes: initialData ? initialData.heartNotes.map(n => n.name).join(', ') : '',
    baseNotes: initialData ? initialData.baseNotes.map(n => n.name).join(', ') : '',
    scentFamilies: initialData?.scentFamilies || [],
    tags: initialData?.tags?.join(', ') || '',
    variants: initialData?.variants || []
  });

  const [submitting, setSubmitting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const addVariant = () => {
    const newVariant: ProductVariant = {
      productId: initialData?.id || 0,
      size: '',
      price: parseFloat(formData.price) || 0,
      stock: 0,
      sku: ''
    };
    setFormData(prev => ({ ...prev, variants: [...prev.variants, newVariant] }));
  };

  const removeVariant = (index: number) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== index) }));
  };

  const updateVariant = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData(prev => ({ ...prev, variants: newVariants }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const parseNotes = (str: string): Note[] => {
      return str.split(',').map(n => ({
        name: n.trim(),
        value: Math.floor(Math.random() * 40) + 20
      })).filter(n => n.name !== '');
    };

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stockThreshold: parseInt(formData.stockThreshold),
      topNotes: parseNotes(formData.topNotes),
      heartNotes: parseNotes(formData.heartNotes),
      baseNotes: parseNotes(formData.baseNotes),
      tags: formData.tags.split(',').map(t => t.trim()).filter(t => t !== ''),
      variants: formData.variants.map(v => ({
        ...v,
        price: typeof v.price === 'string' ? parseFloat(v.price) : v.price,
        stock: typeof v.stock === 'string' ? parseInt(v.stock) : v.stock
      }))
    };

    try {
      const url = initialData ? `/api/products/${initialData.id}` : '/api/products';
      const method = initialData ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        if (res.status === 401) {
          onAuthError();
          throw new Error('Session expired');
        }
        throw new Error(initialData ? 'Failed to update product' : 'Failed to create product');
      }
      onSuccess();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
        <h2 className="text-xl font-serif text-stone-900 dark:text-stone-100">{initialData ? 'Edit Fragrance' : 'New Fragrance'}</h2>
        <button type="button" onClick={onCancel} className="text-sm text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100">Cancel</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="space-y-6">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Product Name</label>
            <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent outline-none text-stone-900 dark:text-stone-100" placeholder="e.g. Santal 33" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Brand</label>
            <input required type="text" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent outline-none text-stone-900 dark:text-stone-100" placeholder="e.g. Le Labo" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Base Price ($)</label>
              <input required type="number" min="0" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent outline-none text-stone-900 dark:text-stone-100" placeholder="320.00" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Stock Threshold</label>
              <input required type="number" min="0" value={formData.stockThreshold} onChange={e => setFormData({...formData, stockThreshold: e.target.value})} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent outline-none text-stone-900 dark:text-stone-100" placeholder="10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Gender</label>
              <select required value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value as any})} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent outline-none text-stone-900 dark:text-stone-100 appearance-none">
                <option value="Unisex">Unisex</option>
                <option value="Male">For Him</option>
                <option value="Female">For Her</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Concentration</label>
              <select required value={formData.concentration} onChange={e => setFormData({...formData, concentration: e.target.value as any})} className="w-full px-4 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 focus:border-transparent outline-none text-stone-900 dark:text-stone-100 appearance-none">
                <option value="EDP">Eau de Parfum (EDP)</option>
                <option value="EDT">Eau de Toilette (EDT)</option>
                <option value="Parfum">Parfum</option>
                <option value="Cologne">Cologne</option>
              </select>
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4">
          <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Product Main Image</label>
          <div 
            className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-colors cursor-pointer ${isDragging ? 'border-stone-900 bg-stone-50' : 'border-stone-200 hover:border-stone-400'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]); }}
            onClick={() => fileInputRef.current?.click()}
          >
            {formData.imageUrl ? (
              <img src={formData.imageUrl} alt="Preview" className="h-48 w-48 object-cover rounded-xl shadow-md" referrerPolicy="no-referrer" />
            ) : (
              <div className="text-center">
                <UploadCloud className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-sm text-stone-500">Click or drag to upload</p>
              </div>
            )}
            <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) handleFile(e.target.files[0]); }} />
          </div>
          <input type="text" value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})} className="w-full px-4 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl text-sm" placeholder="Or enter image URL..." />
        </div>
      </div>

      {/* Description & Tags */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Description</label>
          <textarea rows={4} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 outline-none resize-none text-stone-900 dark:text-stone-100" placeholder="Describe the fragrance story and character..." />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Tags (comma separated)</label>
          <textarea rows={4} value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} className="w-full px-4 py-3 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:ring-2 focus:ring-stone-900 dark:focus:ring-stone-100 outline-none resize-none text-stone-900 dark:text-stone-100" placeholder="e.g. niche, bestseller, winter, evening" />
        </div>
      </div>

      {/* Scent Profile */}
      <div className="bg-stone-50 dark:bg-stone-950/50 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 space-y-6">
        <div className="flex items-center gap-2 mb-2">
          <Droplets className="w-5 h-5 text-stone-400" />
          <h3 className="text-lg font-serif">Fragrance Pyramid</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Top Notes</label>
            <input type="text" value={formData.topNotes} onChange={e => setFormData({...formData, topNotes: e.target.value})} className="w-full px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm" placeholder="e.g. Bergamot, Pink Pepper" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Heart Notes</label>
            <input type="text" value={formData.heartNotes} onChange={e => setFormData({...formData, heartNotes: e.target.value})} className="w-full px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm" placeholder="e.g. Rose, Jasmine" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1">Base Notes</label>
            <input type="text" value={formData.baseNotes} onChange={e => setFormData({...formData, baseNotes: e.target.value})} className="w-full px-4 py-2.5 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl text-sm" placeholder="e.g. Sandalwood, Musk" />
          </div>
        </div>
        
        <div className="pt-4">
          <label className="text-xs font-medium uppercase tracking-wider text-stone-500 dark:text-stone-400 ml-1 mb-3 block">Scent Families</label>
          <div className="flex flex-wrap gap-2">
            {['Floral', 'Oriental', 'Woody', 'Fresh', 'Citrus', 'Spicy', 'Leather', 'Gourmand', 'Chypre', 'Fougere'].map(family => (
              <button
                key={family}
                type="button"
                onClick={() => {
                  const newFamilies = formData.scentFamilies.includes(family)
                    ? formData.scentFamilies.filter(f => f !== family)
                    : [...formData.scentFamilies, family];
                  setFormData({...formData, scentFamilies: newFamilies});
                }}
                className={`px-4 py-1.5 rounded-full text-sm transition-all border ${
                  formData.scentFamilies.includes(family)
                    ? 'bg-stone-900 text-white border-stone-900'
                    : 'bg-white dark:bg-stone-900 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-800 hover:border-stone-400'
                }`}
              >
                {family}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Variants */}
      <div className="bg-stone-50 dark:bg-stone-950/50 p-6 rounded-3xl border border-stone-100 dark:border-stone-800 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-stone-400" />
            <h3 className="text-lg font-serif">Product Variants</h3>
          </div>
          <button type="button" onClick={addVariant} className="text-sm font-medium text-stone-900 dark:text-stone-100 flex items-center gap-1 hover:underline">
            <Plus className="w-4 h-4" /> Add Variant
          </button>
        </div>

        <div className="space-y-4">
          {formData.variants.length === 0 ? (
            <p className="text-sm text-stone-500 text-center py-4">No variants added. The base price will be used.</p>
          ) : (
            formData.variants.map((variant, idx) => (
              <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4 bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 items-end">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Size</label>
                  <input required type="text" value={variant.size} onChange={e => updateVariant(idx, 'size', e.target.value)} className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-lg text-sm" placeholder="100ml" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Price ($)</label>
                  <input required type="number" step="0.01" value={variant.price} onChange={e => updateVariant(idx, 'price', e.target.value)} className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-lg text-sm" placeholder="290.00" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-stone-400">Stock</label>
                  <input required type="number" value={variant.stock} onChange={e => updateVariant(idx, 'stock', e.target.value)} className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-lg text-sm" placeholder="50" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="space-y-1 flex-1">
                    <label className="text-[10px] font-bold uppercase text-stone-400">SKU</label>
                    <input type="text" value={variant.sku} onChange={e => updateVariant(idx, 'sku', e.target.value)} className="w-full px-3 py-2 bg-stone-50 dark:bg-stone-950 border border-stone-100 dark:border-stone-800 rounded-lg text-sm" placeholder="SKU-001" />
                  </div>
                  <button type="button" onClick={() => removeVariant(idx)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-end pt-4 gap-4">
        <button type="button" onClick={onCancel} className="px-8 py-3 text-stone-600 font-medium hover:text-stone-900 transition-colors">Cancel</button>
        <button 
          type="submit" 
          disabled={submitting}
          className="px-10 py-3 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-xl font-medium hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors disabled:opacity-70 flex items-center gap-2 shadow-lg shadow-stone-900/10"
        >
          {submitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          <span>{initialData ? 'Update Product' : 'Create Product'}</span>
        </button>
      </div>
    </form>
  );
}
