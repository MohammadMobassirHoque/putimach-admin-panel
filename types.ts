export type Role = 'ADMIN' | 'EDITOR';

export interface User {
  id: string;
  username: string;
  role: Role;
}

export interface Category {
  id: number;
  name: string;
  created_at?: string;
}

export interface ProductVariant {
  id?: string | number;
  product_id?: string | number;
  size: string;
  color: string;
  price: number;
  stock: number;
  images: string[];
}

export interface Product {
  id: string | number;
  name: string;
  category: string;
  description: string;
  isNew: boolean;
  inStock: boolean;
  currency: string;
  created_at?: string;
  
  // Flat / Global fields
  price: number;
  stock: number;
  sizes: string[];
  colors: string[];
  images: string[];

  // Variant support
  variants: ProductVariant[];
}

export interface AppConfig {
  supabaseUrl: string;
  supabaseKey: string;
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  cloudinaryApiKey?: string;
  cloudinaryApiSecret?: string;
}

export enum ViewState {
  LIST = 'LIST',
  ADD = 'ADD',
  EDIT = 'EDIT',
  SETTINGS = 'SETTINGS',
  USERS = 'USERS',
  CATEGORIES = 'CATEGORIES'
}

export const INITIAL_VARIANT: ProductVariant = {
  size: '',
  color: '',
  price: 0,
  stock: 0,
  images: []
};

export const INITIAL_PRODUCT: Product = {
  id: '',
  name: '',
  category: '',
  description: '',
  isNew: true,
  inStock: true,
  currency: 'BDT',
  price: 0,
  stock: 0,
  sizes: [],
  colors: [],
  images: [],
  variants: []
};