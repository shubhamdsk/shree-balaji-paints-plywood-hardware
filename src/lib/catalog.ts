import { shop } from "@/config/shop";
import { ROUTES } from "@/lib/routes";
import { slugify } from "@/lib/slug";
import type { CategoryGroup, CategoryId, Product } from "@/types";

type Placed = Pick<Product, "category" | "type">;
type Branded = Pick<Product, "brand">;

export const HOME_FEATURED_LIMIT = 8;

export function countProducts(products: Placed[], categoryId: CategoryId, subtype?: string) {
  return products.filter((p) => p.category === categoryId && (!subtype || p.type === subtype)).length;
}

export function productLabel(product: Pick<Product, "brand" | "name">) {
  return `${product.brand} ${product.name}`;
}

export function categoryLabel(product: Pick<Product, "category" | "categoryName">) {
  return product.categoryName ?? product.category.charAt(0).toUpperCase() + product.category.slice(1).replaceAll("-", " ");
}

export function getBrandNames(products: Branded[]) {
  return [...new Set(products.map((p) => p.brand))].sort();
}

export function countByBrand(products: Branded[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const p of products) counts[p.brand] = (counts[p.brand] ?? 0) + 1;
  return counts;
}

export function findBrandBySlug(products: Branded[], slug: string) {
  return getBrandNames(products).find((name) => slugify(name) === slug);
}

/** Only what pickers and filters need, so client components don't receive SEO text and descriptions. */
export function compactGroups(groups: CategoryGroup[]): CategoryGroup[] {
  return groups.map(({ id, name, subtypes }) => ({ id, name, subtypes }));
}

export function listStockedSubtypes(products: Placed[], groups: CategoryGroup[]) {
  return groups.flatMap((group) =>
    group.subtypes
      .filter((subtype) => countProducts(products, group.id, subtype) > 0)
      .map((subtype) => ({ group, subtype })),
  );
}

export function stockedHref(products: Placed[], categoryId: CategoryId, subtype: string) {
  return countProducts(products, categoryId, subtype) > 0
    ? ROUTES.category(categoryId, subtype)
    : ROUTES.category(categoryId);
}

export function compareByPrice(a: Pick<Product, "priceFrom">, b: Pick<Product, "priceFrom">, direction: "asc" | "desc") {
  if (a.priceFrom === b.priceFrom) return 0;
  if (a.priceFrom === undefined) return 1;
  if (b.priceFrom === undefined) return -1;
  return direction === "asc" ? a.priceFrom - b.priceFrom : b.priceFrom - a.priceFrom;
}

export function categoryPageMeta(group: CategoryGroup, subtype?: string) {
  const details = subtype ? group.subtypeDetails?.find((d) => d.name === subtype) : group;
  const name = subtype ? `${subtype} ${group.name}` : group.name;
  return {
    title: details?.seoTitle ?? name,
    description:
      details?.seoDescription ?? details?.description ?? `Browse ${name.toLowerCase()} at ${shop.shortName}, ${shop.address.city}.`,
  };
}

export function findSubtypeBySlug(group: CategoryGroup, slug: string) {
  return group.subtypes.find((subtype) => slugify(subtype) === slug);
}
