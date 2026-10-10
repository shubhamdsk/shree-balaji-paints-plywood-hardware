import { eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { adminUsers, auditLog, products } from "@/server/db/schema";
import {
  createCategory,
  createSubcategory,
  getAdminCategory,
  getAdminSubcategory,
  listAdminCategories,
  setCategoryActive,
  setSubcategoryActive,
  updateCategory,
  updateSubcategory,
} from "@/services/admin-category-service";
import { getProductById } from "@/services/catalog-service";
import { setupTestDatabase } from "@/test/db";
import type { AdminUser, CategoryInput } from "@/types";

const db = setupTestDatabase();

const input: CategoryInput = { name: "Glass & Mirrors", tagline: "Cut to size", sortOrder: 20 };

async function owner(): Promise<AdminUser> {
  const [row] = await db()
    .insert(adminUsers)
    .values({ username: "owner", passwordHash: "unused" })
    .returning({ id: adminUsers.id, username: adminUsers.username });
  return row;
}

describe("listAdminCategories", () => {
  it("counts products by the subcategory they are linked to", async () => {
    const paints = (await listAdminCategories()).find((c) => c.id === "paints")!;
    const interior = paints.subcategories.find((s) => s.name === "Interior Emulsion")!;
    expect(interior.productCount).toBeGreaterThan(0);
    expect(paints.productCount).toBe(paints.subcategories.reduce((sum, s) => sum + s.productCount, 0));
  });
});

describe("categories", () => {
  it("creates a category with an id from its name, a photo and search fields, and audits it", async () => {
    const actor = await owner();
    const result = await createCategory(actor, { ...input, seoTitle: "Glass in Kotul" }, "/api/photos/glass.jpg");
    expect(result).toEqual({ ok: true, id: "glass-mirrors" });
    expect(await getAdminCategory("glass-mirrors")).toMatchObject({
      name: "Glass & Mirrors",
      image: "/api/photos/glass.jpg",
      seoTitle: "Glass in Kotul",
      sortOrder: 20,
      productCount: 0,
    });
    const [entry] = await db().select().from(auditLog).where(eq(auditLog.entityId, "glass-mirrors"));
    expect(entry.action).toBe("category_create");
  });

  it("refuses a name already used by a category, an old category address or a product", async () => {
    const actor = await owner();
    expect(await createCategory(actor, { ...input, name: "paints" })).toEqual({ ok: false, reason: "taken" });
    expect(await createCategory(actor, { ...input, name: "Plywood" })).toEqual({ ok: false, reason: "taken" });
    expect(await createCategory(actor, { ...input, name: "ap royale luxury" })).toEqual({ ok: false, reason: "taken" });
  });

  it("keeps the id when renamed and returns the photo it replaced", async () => {
    const actor = await owner();
    await createCategory(actor, input, "/api/photos/old.jpg");
    const result = await updateCategory(actor, "glass-mirrors", { ...input, name: "Glass" }, "/api/photos/new.jpg");
    expect(result).toEqual({ ok: true, id: "glass-mirrors", replacedImage: "/api/photos/old.jpg" });
    expect(await getAdminCategory("glass-mirrors")).toMatchObject({ name: "Glass", image: "/api/photos/new.jpg" });
    expect(await updateCategory(actor, "glass-mirrors", input)).toMatchObject({ ok: true });
    expect((await getAdminCategory("glass-mirrors"))?.image).toBe("/api/photos/new.jpg");
  });

  it("reports a missing category and a name clash on update", async () => {
    const actor = await owner();
    expect(await updateCategory(actor, "missing", input)).toEqual({ ok: false, reason: "missing" });
    expect(await updateCategory(actor, "laminates", { ...input, name: "Paints" })).toEqual({ ok: false, reason: "taken" });
  });

  it("hides and shows a category without deleting anything", async () => {
    const actor = await owner();
    expect(await setCategoryActive(actor, "laminates", false)).toBe(true);
    expect((await getAdminCategory("laminates"))?.isActive).toBe(false);
    expect((await getAdminCategory("laminates"))?.productCount).toBeGreaterThan(0);
    expect(await setCategoryActive(actor, "missing", false)).toBe(false);
  });
});

describe("types", () => {
  it("adds a type under a category and refuses a duplicate name in it", async () => {
    const actor = await owner();
    expect(await createSubcategory(actor, "paints", { name: "Chalk Paint", sortOrder: 99 })).toEqual({
      ok: true,
      id: "paints-chalk-paint",
    });
    expect(await createSubcategory(actor, "paints", { name: "chalk paint", sortOrder: 1 })).toEqual({
      ok: false,
      reason: "taken",
    });
    expect(await createSubcategory(actor, "missing", { name: "X type", sortOrder: 1 })).toEqual({
      ok: false,
      reason: "missing",
    });
  });

  it("keeps products linked when a type is renamed", async () => {
    const actor = await owner();
    const [linked] = await db()
      .select({ id: products.id })
      .from(products)
      .where(eq(products.subcategoryId, "paints-interior-emulsion"));
    await updateSubcategory(actor, "paints-interior-emulsion", { name: "Interior Emulsions", sortOrder: 0 });
    expect((await getProductById(linked.id))?.type).toBe("Interior Emulsions");
    expect((await getAdminSubcategory("paints-interior-emulsion"))?.productCount).toBeGreaterThan(0);
  });

  it("hides and shows a type", async () => {
    const actor = await owner();
    expect(await setSubcategoryActive(actor, "paints-wood-paint", false)).toBe(true);
    expect((await getAdminSubcategory("paints-wood-paint"))?.isActive).toBe(false);
  });
});
