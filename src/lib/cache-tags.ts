import { slugify } from "@/lib/slug";

export const CACHE_TAGS = {
  structure: "catalog-structure",
  productIndex: "product-index",
  products: "products",
  featured: "featured-products",
  gallery: "gallery",
  offers: "offers",
  product: (id: string) => `product:${id}`,
  category: (categoryId: string) => `category-products:${categoryId}`,
  brand: (brand: string) => `brand-products:${slugify(brand)}`,
} as const;

export interface ProductSnapshot {
  id: string;
  name: string;
  brand: string;
  category: string | null;
  type: string | null;
  isVisible: boolean;
  featured?: boolean;
}

const INDEX_FIELDS = ["name", "brand", "category", "type", "isVisible"] as const;

export function productChangeTags(before: ProductSnapshot | undefined, after: ProductSnapshot | undefined): string[] {
  const snapshots = [before, after].filter((s): s is ProductSnapshot => s !== undefined);
  const tags = new Set<string>([CACHE_TAGS.products]);
  for (const s of snapshots) {
    tags.add(CACHE_TAGS.product(s.id));
    tags.add(CACHE_TAGS.brand(s.brand));
    if (s.category) tags.add(CACHE_TAGS.category(s.category));
    if (s.featured) tags.add(CACHE_TAGS.featured);
  }
  const indexChanged = !before || !after || INDEX_FIELDS.some((field) => before[field] !== after[field]);
  if (indexChanged) tags.add(CACHE_TAGS.productIndex);
  return [...tags];
}
