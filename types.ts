
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  weight: string;
  discountPercentage?: number;
  image: string;
  images?: string[]; 
  categories: string[];
  ingredients: string[];
  nutrition: {
    calories: string;
    fat: string;
    sugar: string;
    protein: string;
  };
  tags: string[];
  isNew?: boolean;
  isBestSeller?: boolean;
  stock: number;
  status: 'in-stock' | 'out-of-stock';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  isBlocked?: boolean;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  email: string;
  items: CartItem[];
  total: number;
  subtotal: number;
  discountAmount: number;
  status: 'pending' | 'shipped' | 'delivered' | 'cancelled';
  trackingId: string;
  trackingUrl?: string;
  channel?: string;
  date: string;
  address: string;
  country: string;
  state: string;
  city: string;
  zip: string;
  phone: string;
}

export interface TicketReply {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: 'user' | 'admin';
  message: string;
  date: string;
}

export interface Ticket {
  id: string;
  userId: string;
  orderId?: string;
  userName: string;
  email: string;
  subject: string;
  message: string;
  status: 'open' | 'closed';
  date: string;
  replies: TicketReply[];
  unreadAdmin: boolean;
  unreadUser: boolean;
}

export interface Offer {
  id: string;
  title: string;
  description: string;
  code: string;
  discount: number;
  isActive: boolean;
  bannerImage?: string;
  productId?: string;
}

export interface OfferApplied extends Offer {
  discountCalculated: number;
}

export interface SiteSettings {
  heroImages: string[];
}
