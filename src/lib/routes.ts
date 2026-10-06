import { slugify } from "@/lib/slug";
import type { CategoryId } from "@/types";

export const ROUTES = {
  home: "/",
  products: "/products",
  category: (category: CategoryId, type?: string) =>
    type ? `/products/${category}/${slugify(type)}` : `/products/${category}`,
  product: (id: string) => `/products/${id}`,
  brands: "/brands",
  brand: (name: string) => `/brands/${slugify(name)}`,
  offers: "/offers",
  about: "/about",
  contact: "/contact",
  enquiry: (productId?: string) => (productId ? `/enquiry/${productId}` : "/enquiry"),
} as const;
