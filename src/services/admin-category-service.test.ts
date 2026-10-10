import { describe, expect, it } from "vitest";
import { adminUsers } from "@/server/db/schema";
import {
  createCategory,
  createSubcategory,
  getAdminCategoriesWithCounts,
  toggleCategoryActive,
  toggleSubcategoryActive,
  updateCategory,
} from "@/services/admin-category-service";
import { setupTestDatabase } from "@/test/db";
import type { AdminCategoryRecord, AdminSubcategoryRecord, AdminUser } from "@/types";

const db = setupTestDatabase();

async function owner(): Promise<AdminUser> {
  const [row] = await db()
    .insert(adminUsers)
    .values({ username: "owner", passwordHash: "unused" })
    .returning({ id: adminUsers.id, username: adminUsers.username });
  return row;
}

describe("admin-category-service", () => {
  it("lists categories with subcategories and product counts", async () => {
    const list = await getAdminCategoriesWithCounts();
    expect(list.length).toBeGreaterThan(0);
    const plywood = list.find((c: AdminCategoryRecord) => c.id === "plywood-boards");
    expect(plywood).toBeDefined();
    expect(plywood?.productCount).toBeGreaterThan(0);
    expect(plywood?.subcategories.length).toBeGreaterThan(0);
  });

  it("creates a new category and subcategory", async () => {
    const testOwner = await owner();
    const cat = await createCategory(testOwner, {
      name: "Electricals & Wiring",
      slug: "electricals-wiring",
      tagline: "Quality Wires & Switches",
      description: "Cables, Switches, DBs and MCBs",
    });
    expect(cat.id).toBe("electricals-wiring");
    expect(cat.name).toBe("Electricals & Wiring");

    const sub = await createSubcategory(testOwner, {
      categoryId: cat.id,
      name: "Copper Wires",
      slug: "copper-wires",
    });
    expect(sub.id).toBe("electricals-wiring-copper-wires");

    const list = await getAdminCategoriesWithCounts();
    const createdCat = list.find((c: AdminCategoryRecord) => c.id === cat.id);
    expect(createdCat).toBeDefined();
    expect(createdCat?.subcategories.some((s: AdminSubcategoryRecord) => s.id === sub.id)).toBe(true);
  });

  it("updates category details", async () => {
    const testOwner = await owner();
    const updatedCat = await updateCategory(testOwner, "paints", {
      name: "Paints & Wall Finish",
      slug: "paints",
      tagline: "Updated Tagline",
      description: "Updated Description",
    });
    expect(updatedCat?.name).toBe("Paints & Wall Finish");

    const list = await getAdminCategoriesWithCounts();
    const paints = list.find((c: AdminCategoryRecord) => c.id === "paints");
    expect(paints?.name).toBe("Paints & Wall Finish");
  });

  it("toggles active status for categories and subcategories", async () => {
    const testOwner = await owner();
    const okCat = await toggleCategoryActive(testOwner, "laminates", false);
    expect(okCat).toBe(true);

    let list = await getAdminCategoriesWithCounts();
    let lami = list.find((c: AdminCategoryRecord) => c.id === "laminates");
    expect(lami?.isActive).toBe(false);

    const subId = lami?.subcategories[0]?.id;
    if (subId) {
      const okSub = await toggleSubcategoryActive(testOwner, subId, false);
      expect(okSub).toBe(true);
      list = await getAdminCategoriesWithCounts();
      lami = list.find((c: AdminCategoryRecord) => c.id === "laminates");
      const sub = lami?.subcategories.find((s: AdminSubcategoryRecord) => s.id === subId);
      expect(sub?.isActive).toBe(false);
    }
  });
});
