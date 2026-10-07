export type CategoryId =
  | "paints"
  | "plywood"
  | "hardware"
  | "plumbing"
  | "electrical"
  | "tools"
  | "adhesives";

export interface Category {
  id: CategoryId;
  name: string;
  tagline: string;
  description: string;
  image: string;
}

export type CategoryFilter = CategoryId | "all";

export interface CategoryGroup {
  id: CategoryId;
  name: string;
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
