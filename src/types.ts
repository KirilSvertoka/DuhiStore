export interface Note {
  name: string;
  value: number;
}

export interface ProductVariant {
  id?: number;
  productId: number;
  size: string; // e.g., '30ml', '50ml', '100ml', 'Tester'
  price: number;
  stock: number;
  sku: string;
}

export interface Product {
  id: number;
  name: string;
  brand: string;
  description: string;
  imageUrl: string;
  images?: string[];
  price: number; // Base price or starting price
  topNotes: Note[];
  heartNotes: Note[];
  baseNotes: Note[];
  gender: 'Male' | 'Female' | 'Unisex';
  scentFamilies: string[];
  concentration: 'EDP' | 'EDT' | 'Parfum' | 'Cologne';
  stockThreshold: number;
  tags: string[];
  variants?: ProductVariant[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  region?: string;
  createdAt: string;
  ltv: number;
  orderCount: number;
  avgOrderValue: number;
  segment?: string;
}

export interface Order {
  id: number;
  userId?: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerRegion: string;
  total: number;
  status: 'New' | 'Paid' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  trackingNumber?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  variantId?: number;
  productName: string;
  variantSize?: string;
  quantity: number;
  price: number;
}

export interface Review {
  id: number;
  productId: number;
  userName: string;
  rating: number;
  comment: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export interface CMSPage {
  id: string;
  title: string;
  content: string;
  updatedAt: string;
}

export interface HomeConfig {
  announcement: { text: string; active: boolean };
  hero: { 
    slides: { image: string; title: string; subtitle: string; link?: string; timerEnd?: string }[] 
  };
  featuredProductsTitle: string;
  featuredProductIds: number[];
  promoImages: string[];
  dynamicBlocks: { type: 'New' | 'BestSellers' | 'Recommended'; title: string; active: boolean }[];
}
