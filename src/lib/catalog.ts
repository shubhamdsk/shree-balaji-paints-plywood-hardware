import type { CategoryId, Product } from "@/types";

export function countProducts(products: Product[], categoryId: CategoryId, subtype?: string) {
  return products.filter((p) => p.category === categoryId && (!subtype || p.type === subtype)).length;
}

export function getBrandNames(products: Product[]) {
  return [...new Set(products.map((p) => p.brand))].sort();
}
