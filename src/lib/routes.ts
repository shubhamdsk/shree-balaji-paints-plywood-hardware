import { slugify } from "@/lib/slug";
import type { CategoryId } from "@/types";

export const ROUTES = {
  home: "/",
  products: "/products",
  category: (category: CategoryId, type?: string) =>
    type ? `/products/${category}/${slugify(type)}` : `/products/${category}`,
  product: (id: string) => `/products/${id}`,
  categories: "/categories",
  brands: "/brands",
  brand: (name: string) => `/brands/${slugify(name)}`,
  offers: "/offers",
  about: "/about",
  contact: "/contact",
  enquiry: (productId?: string) => (productId ? `/enquiry/${productId}` : "/enquiry"),
  paintCalculator: (productId?: string) => (productId ? `/paint-calculator/${productId}` : "/paint-calculator"),
  admin: "/admin",
  adminLogin: "/admin/login",
  adminPassword: "/admin/password",
  adminProducts: "/admin/products",
  adminNewProduct: "/admin/products/new",
  adminProduct: (id: string) => `/admin/products/${id}`,
  adminEnquiries: "/admin/enquiries",
} as const;

