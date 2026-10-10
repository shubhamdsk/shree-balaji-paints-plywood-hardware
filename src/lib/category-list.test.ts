import { describe, expect, it } from "vitest";
import { categoryListItems, nextSortOrder, typeListItems } from "@/lib/category-list";
import { ROUTES } from "@/lib/routes";
import type { AdminCategoryRecord } from "@/types";

const sub = {
  id: "paints-wood-paint",
  categoryId: "paints",
  name: "Wood Paint",
  slug: "paints-wood-paint",
  sortOrder: 3,
  isActive: true,
  productCount: 1,
};

const category: AdminCategoryRecord = {
  id: "paints",
  name: "Paints",
  slug: "paints",
  sortOrder: 8,
  isActive: true,
  productCount: 1,
  subcategories: [sub],
};

describe("category list rows", () => {
  it("describe a category by its types and products and search by type names too", () => {
    expect(categoryListItems([category])[0]).toMatchObject({
      detail: "1 type · 1 product",
      searchText: "Paints Wood Paint",
      editHref: ROUTES.adminCategory("paints"),
    });
  });

  it("link a type to its edit page under its category", () => {
    expect(typeListItems([{ ...sub, productCount: 2 }])[0]).toMatchObject({
      detail: "2 products",
      editHref: ROUTES.adminSubcategory("paints", "paints-wood-paint"),
    });
  });

  it("put a new entry after the last position", () => {
    expect(nextSortOrder([{ sortOrder: 3 }, { sortOrder: 9 }])).toBe(10);
    expect(nextSortOrder([])).toBe(0);
  });
});
