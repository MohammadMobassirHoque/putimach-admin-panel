import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, AppConfig, ProductVariant, Category } from '../types';

let supabase: SupabaseClient | null = null;

export const initSupabase = (config: AppConfig) => {
  if (config.supabaseUrl && config.supabaseKey) {
    try {
      supabase = createClient(config.supabaseUrl, config.supabaseKey);
    } catch (e) {
      console.error("Failed to initialize Supabase client", e);
    }
  }
};

// --- CATEGORIES ---

export const fetchCategories = async (): Promise<Category[]> => {
  if (!supabase) throw new Error("Supabase not configured");
  
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data || [];
};

export const createCategory = async (name: string): Promise<Category> => {
  if (!supabase) throw new Error("Supabase not configured");
  
  const { data, error } = await supabase
    .from('categories')
    .insert([{ name }])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteCategory = async (id: number): Promise<void> => {
  if (!supabase) throw new Error("Supabase not configured");
  
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const updateCategory = async (id: number, name: string): Promise<void> => {
  if (!supabase) throw new Error("Supabase not configured");
  
  const { error } = await supabase
    .from('categories')
    .update({ name })
    .eq('id', id);

  if (error) throw error;
};

// --- PRODUCTS ---

export const fetchProducts = async (): Promise<Product[]> => {
  if (!supabase) throw new Error("Supabase not configured");
  
  const { data, error } = await supabase
    .from('products')
    .select('*, product_variants(*)')
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((p: any) => ({
    ...p,
    variants: p.product_variants || [],
    sizes: p.sizes || [],
    colors: p.colors || [],
    images: p.images || (p.product_variants?.[0]?.images || [])
  }));
};

export const createProduct = async (product: Product): Promise<Product[]> => {
  if (!supabase) throw new Error("Supabase not configured");

  const productPayload = {
    name: product.name,
    category: product.category,
    description: product.description,
    isNew: product.isNew,
    inStock: product.inStock,
    currency: product.currency,
    price: product.price,
    stock: product.stock,
    sizes: product.sizes,
    colors: product.colors,
    images: product.images
  };

  const { data: prodData, error: prodError } = await supabase
    .from('products')
    .insert([productPayload])
    .select();

  if (prodError) throw prodError;
  const newProduct = prodData[0];

  if (product.variants && product.variants.length > 0) {
    const variantsPayload = product.variants.map(v => ({
      product_id: newProduct.id,
      size: v.size,
      color: v.color,
      price: v.price,
      stock: v.stock,
      images: v.images
    }));

    const { error: varError } = await supabase
      .from('product_variants')
      .insert(variantsPayload);

    if (varError) {
      console.error("Error inserting variants", varError);
    }
  }

  return prodData || [];
};

export const updateProduct = async (product: Product): Promise<Product[]> => {
  if (!supabase) throw new Error("Supabase not configured");

  const productPayload = {
    name: product.name,
    category: product.category,
    description: product.description,
    isNew: product.isNew,
    inStock: product.inStock,
    currency: product.currency,
    price: product.price,
    stock: product.stock,
    sizes: product.sizes,
    colors: product.colors,
    images: product.images
  };

  const { data, error } = await supabase
    .from('products')
    .update(productPayload)
    .eq('id', product.id)
    .select();

  if (error) throw error;

  await supabase.from('product_variants').delete().eq('product_id', product.id);

  if (product.variants && product.variants.length > 0) {
    const variantsPayload = product.variants.map(v => ({
      product_id: product.id,
      size: v.size,
      color: v.color,
      price: v.price,
      stock: v.stock,
      images: v.images
    }));

    const { error: varError } = await supabase
      .from('product_variants')
      .insert(variantsPayload);
      
    if (varError) throw varError;
  }

  return data || [];
};

export const deleteProduct = async (id: string | number): Promise<void> => {
  if (!supabase) throw new Error("Supabase not configured");
  
  await supabase.from('product_variants').delete().eq('product_id', id);

  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const bulkDeleteProducts = async (ids: (string | number)[]): Promise<void> => {
  if (!supabase) throw new Error("Supabase not configured");
  
  // Variants are deleted via CASCADE in DB but we ensure it
  await supabase.from('product_variants').delete().in('product_id', ids);

  const { error } = await supabase
    .from('products')
    .delete()
    .in('id', ids);

  if (error) throw error;
};

export const bulkUpdateProductsStock = async (ids: (string | number)[], inStock: boolean): Promise<void> => {
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase
    .from('products')
    .update({ inStock })
    .in('id', ids);

  if (error) throw error;
};