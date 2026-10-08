export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  image: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type CategoryFilter = CategoryId | "all";

export interface Subcategory {
  id: string;
  categoryId: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface CategoryGroup {
  id: CategoryId;
  name: string;
  slug?: string;
  subtypes: string[];
}

export interface ProductDownload {
  label: string;
  note?: string;
}

export interface ProductDetails {
  longDescription?: string;
  colors?: string[];
  gallery?: string[];
  features?: string[];
  suitableFor?: string[];
  technical?: Record<string, string>;
  application?: string;
  downloads?: ProductDownload[];
}

export interface Product extends Omit<ProductDetails, "colors"> {
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  type: string;
  description: string;
  sizes: string[];
  priceFrom?: number;
  unit: string;
  colors: string[];
  image?: string;
  featured?: boolean;
  inStock: boolean;
}

export interface AdminProduct extends Product {
  isVisible: boolean;
  updatedAt: string;
}

export interface AdminUser {
  id: number;
  username: string;
}

export type SortOption = "price-asc" | "price-desc" | "name";

export type EnquiryStatus = "new" | "contacted" | "closed";

export interface EnquiryRecord {
  id: string;
  name: string;
  phone?: string;
  productId?: string;
  productName?: string;
  quantity?: string;
  message: string;
  status: EnquiryStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

