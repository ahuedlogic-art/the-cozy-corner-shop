export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  isTopItem?: boolean;
  isFavorite?: boolean;
  inStock: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
}

export interface FilterState {
  priceRange: [number, number];
  rating: number;
  brands: string[];
  category: string;
  deliveryOption: 'standard' | 'pickup' | 'all';
}
