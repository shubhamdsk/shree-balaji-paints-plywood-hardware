import { ROUTES } from "@/lib/routes";
import type { AdminCategoryRecord, AdminSubcategoryRecord } from "@/types";

function plural(n: number, word: string) {
  return `${n} ${word}${n === 1 ? "" : "s"}`;
}

export function categoryListItems(categories: AdminCategoryRecord[]) {
  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    image: category.image,
    isActive: category.isActive,
    productCount: category.productCount,
    detail: `${plural(category.subcategories.length, "type")} · ${plural(category.productCount, "product")}`,
    searchText: [category.name, ...category.subcategories.map((sub) => sub.name)].join(" "),
    editHref: ROUTES.adminCategory(category.id),
  }));
}

export function typeListItems(subcategories: AdminSubcategoryRecord[]) {
  return subcategories.map((sub) => ({
    id: sub.id,
    name: sub.name,
    image: sub.image,
    isActive: sub.isActive,
    productCount: sub.productCount,
    detail: plural(sub.productCount, "product"),
    searchText: sub.name,
    editHref: ROUTES.adminSubcategory(sub.categoryId, sub.id),
  }));
}

export function nextSortOrder(items: { sortOrder: number }[]) {
  return items.reduce((max, item) => Math.max(max, item.sortOrder + 1), 0);
}
