export interface User {
  id: string;
  name: string;
  email: string;
}

export interface SizeOption {
  size: string;
  price: number;
}

export interface Product {
  id:string;
  name: string;
  description: string;
  sizes: SizeOption[];
  imageUrl?: string;
}

export interface CartItem {
  id: string; // Composite key: `${productId}-${size}`
  productId: string;
  name: string;
  quantity: number;
  size: string;
  price: number;
}

export interface Order {
  id: string;
  userName: string;
  total: number;
  status: 'confirmed' | 'ready' | 'delivered';
}
