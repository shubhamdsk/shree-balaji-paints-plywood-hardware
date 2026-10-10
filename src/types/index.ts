export type CategoryId = string;

export interface SeoFields {
  seoTitle?: string;
  seoDescription?: string;
}

export interface Category extends SeoFields {
  id: CategoryId;
  name: string;
  slug?: string;
  tagline?: string;
  description?: string;
  image?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export type CategoryFilter = CategoryId | "all";

export interface SubtypeDetails extends SeoFields {
  name: string;
  description?: string;
  image?: string;
}

export interface CategoryGroup extends SeoFields {
  id: CategoryId;
  name: string;
  slug?: string;
  description?: string;
  subtypes: string[];
  subtypeDetails?: SubtypeDetails[];
}

export interface AdminSubcategoryRecord extends SeoFields {
  id: string;
  categoryId: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}

export interface AdminCategoryRecord extends SeoFields {
  id: string;
  name: string;
  slug: string;
  tagline?: string;
  description?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
  subcategories: AdminSubcategoryRecord[];
}

export interface CategoryInput extends SeoFields {
  name: string;
  tagline?: string;
  description?: string;
  sortOrder: number;
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
  categoryName?: string;
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

export type ProductSummary = Pick<Product, "id" | "name" | "brand" | "category" | "type">;

export type CatalogProduct = Pick<
  Product,
  | "id"
  | "name"
  | "brand"
  | "category"
  | "categoryName"
  | "type"
  | "description"
  | "sizes"
  | "priceFrom"
  | "unit"
  | "image"
  | "featured"
  | "inStock"
>;

export interface AdminProduct extends Product {
  needsCategory: boolean;
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

export type EnquiryStatusFilter = "all" | EnquiryStatus;

export interface EnquiryCursor {
  createdAt: string;
  id: string;
}

export interface EnquiryQuery {
  status?: EnquiryStatusFilter;
  search?: string;
  after?: EnquiryCursor;
}

export interface EnquiryPage {
  items: EnquiryRecord[];
  next: EnquiryCursor | null;
}

export type EnquiryCounts = Record<EnquiryStatusFilter, number>;

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  caption?: string;
  image: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  title: string;
  body: string;
  image?: string;
  startsOn: string;
  endsOn: string;
  updatedAt: string;
}

export interface GalleryInput {
  title: string;
  category: string;
  caption?: string;
  sortOrder?: number;
  isActive?: boolean;
}

