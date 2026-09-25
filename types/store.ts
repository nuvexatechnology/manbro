export type ProductCategory = string;

export interface AdminUser {
  id: string;
  email: string;
  password: string; // In production, this should be hashed
  name: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export type ClothingSize = "XS" | "S" | "M" | "L" | "XL" | "XXL";

export interface ColorOption {
  name: string;
  hex: string;
}

export interface ProductVariant {
  id: string;
  size: ClothingSize;
  color: ColorOption;
  stock: number;
  price?: number; // Optional price override for specific variant
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  details: string[];
  price: number;
  originalPrice?: number;
  category: ProductCategory;
  sizes: ClothingSize[];
  colors: ColorOption[];
  variants: ProductVariant[]; // Replaces simple inStock with detailed variant stock
  images: string[];
  colorImages?: Record<string, string>; // Maps color name → image path for color-based image switching
  rating: number;
  reviewCount: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  inStock: boolean; // Overall stock status (derived from variants)
  tags: string[];
  version?: number;
}

export interface CartItem {
  id: string; // unique cart item id (product.id + size + color)
  product: Product;
  selectedSize: ClothingSize;
  selectedColor: ColorOption;
  quantity: number;
}

export interface FilterState {
  category: ProductCategory;
  searchQuery: string;
  selectedSizes: ClothingSize[];
  selectedColors: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: "featured" | "price-asc" | "price-desc" | "newest" | "rating";
}

export interface CheckoutFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes?: string;
  paymentMethod: "cashfree" | "whatsapp" | "cod" | "card";
}

export type OrderStatus = "NEW" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

export interface IndiaPostTracking {
  courierName: string;
  trackingNumber: string;
  shippingDate: string;
  shippingCharge: number;
}

export interface Order {
  id: string;
  createdAt: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  shippingAddress: CheckoutFormValues;
  status: OrderStatus;
  trackingInfo?: IndiaPostTracking;
  adminNotes?: string;
}

export type CustomerOrder = Pick<Order, "id" | "createdAt" | "items" | "subtotal" | "discount" | "shipping" | "tax" | "total" | "status" | "trackingInfo">;
