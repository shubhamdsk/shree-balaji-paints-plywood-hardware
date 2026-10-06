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

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: CategoryId;
  type: string;
  description: string;
  longDescription?: string;
  sizes: string[];
  priceFrom: number;
  unit: string;
  colors: string[];
  image?: string;
  gallery?: string[];
  features?: string[];
  suitableFor?: string[];
  technical?: Record<string, string>;
  application?: string;
  downloads?: ProductDownload[];
  featured?: boolean;
  inStock: boolean;
}

export type SortOption = "price-asc" | "price-desc" | "name";
