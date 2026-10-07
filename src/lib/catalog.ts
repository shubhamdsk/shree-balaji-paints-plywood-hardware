import { ROUTES } from "@/lib/routes";
import { slugify } from "@/lib/slug";
import type { CategoryGroup, CategoryId, Product } from "@/types";

export const HOME_FEATURED_LIMIT = 8;

export function countProducts(products: Product[], categoryId: CategoryId, subtype?: string) {
  return products.filter((p) => p.category === categoryId && (!subtype || p.type === subtype)).length;
}

export function productLabel(product: Pick<Product, "brand" | "name">) {
  return `${product.brand} ${product.name}`;
}

export function getBrandNames(products: Product[]) {
  return [...new Set(products.map((p) => p.brand))].sort();
}

export function countByBrand(products: Product[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of products) counts[p.brand] = (counts[p.brand] ?? 0) + 1;
  return counts;
}

export function findBrandBySlug(products: Product[], slug: string) {
  return getBrandNames(products).find((name) => slugify(name) === slug);
}

export function listStockedSubtypes(products: Product[], groups: CategoryGroup[]) {
  return groups.flatMap((group) =>
    group.subtypes
      .filter((subtype) => countProducts(products, group.id, subtype) > 0)
      .map((subtype) => ({ group, subtype })),
  );
}

export function stockedHref(products: Product[], categoryId: CategoryId, subtype: string) {
  return countProducts(products, categoryId, subtype) > 0
    ? ROUTES.category(categoryId, subtype)
    : ROUTES.category(categoryId);
}

export function compareByPrice(a: Product, b: Product, direction: "asc" | "desc") {
  if (a.priceFrom === b.priceFrom) return 0;
  if (a.priceFrom === undefined) return 1;
  if (b.priceFrom === undefined) return -1;
  return direction === "asc" ? a.priceFrom - b.priceFrom : b.priceFrom - a.priceFrom;
}

export function findSubtypeBySlug(group: CategoryGroup, slug: string) {
  return group.subtypes.find((subtype) => slugify(subtype) === slug);
}
