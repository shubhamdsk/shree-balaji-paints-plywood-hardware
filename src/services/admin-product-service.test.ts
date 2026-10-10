import { asc, eq } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import type { ProductInput } from "@/lib/product-input";
import { adminUsers, auditLog, products, subcategories } from "@/server/db/schema";
import {
  createProduct,
  getAdminProduct,
  listAdminProducts,
  setProductFlag,
  updateProduct,
} from "@/services/admin-product-service";
import { getFeaturedProducts, getProductById, getProducts } from "@/services/catalog-service";
import { setupTestDatabase } from "@/test/db";
import type { AdminUser } from "@/types";

const db = setupTestDatabase();

const input: ProductInput = {
  name: "Weatherbond Advance",
  brand: "Nippon Paint",
  category: "paints",
  type: "Exterior Emulsion",
  description: "Exterior emulsion that resists rain and dust.",
  sizes: ["1 L", "4 L", "10 L"],
  priceFrom: 295,
  unit: "per litre",
  inStock: true,
  featured: false,
};

async function owner(): Promise<AdminUser> {
  const [row] = await db()
    .insert(adminUsers)
    .values({ username: "owner", passwordHash: "unused" })
    .returning({ id: adminUsers.id, username: adminUsers.username });
  return row;
}

async function auditFor(id: string) {
  return db()
    .select({ action: auditLog.action, before: auditLog.before, after: auditLog.after })
    .from(auditLog)
    .where(eq(auditLog.entityId, id))
    .orderBy(asc(auditLog.id));
}

describe("createProduct", () => {
  it("adds the product to the website at the end of the catalogue", async () => {
    const id = await createProduct(await owner(), input, "/api/photos/photo.jpg");
    expect(id).toBe("weatherbond-advance");

    const product = await getProductById(id);
    expect(product).toMatchObject({ ...input, colors: [], image: "/api/photos/photo.jpg" });
    expect((await getProducts()).at(-1)?.id).toBe(id);
    expect((await auditFor(id)).map((entry) => entry.action)).toEqual(["product_create"]);
  });

  it("never reuses an existing product id or a category id", async () => {
    const actor = await owner();
    const [existing] = await listAdminProducts();
    expect(await createProduct(actor, { ...input, name: existing.name }, undefined)).not.toBe(existing.id);
    expect(await createProduct(actor, { ...input, name: "Paints" })).toBe("paints-2");
    expect(await createProduct(actor, { ...input, name: "Plywood" })).toBe("plywood-2");
  });

  it("stores a product without a price as Ask for price", async () => {
    const id = await createProduct(await owner(), { ...input, priceFrom: undefined });
    expect((await getProductById(id))?.priceFrom).toBeUndefined();
  });
});

describe("updateProduct", () => {
  it("saves the changes, keeps the photo when none is uploaded and records before and after", async () => {
    const actor = await owner();
    const id = await createProduct(actor, input, "/api/photos/old.jpg");

    expect(await updateProduct(actor, id, { ...input, inStock: false, sizes: ["20 L"] })).toEqual({ previousImage: null });
    expect(await getProductById(id)).toMatchObject({ inStock: false, sizes: ["20 L"], image: "/api/photos/old.jpg" });

    const [, update] = await auditFor(id);
    expect(update).toMatchObject({ action: "product_update", before: { inStock: true }, after: { inStock: false } });
  });

  it("returns the old photo when a new one replaces it", async () => {
    const actor = await owner();
    const id = await createProduct(actor, input, "/api/photos/old.jpg");
    expect(await updateProduct(actor, id, input, "/api/photos/new.jpg")).toEqual({ previousImage: "/api/photos/old.jpg" });
    expect((await getProductById(id))?.image).toBe("/api/photos/new.jpg");
  });

  it("keeps the rich product details that the form does not edit", async () => {
    const [seeded] = await getProducts();
    await updateProduct(await owner(), seeded.id, { ...input, category: seeded.category, type: seeded.type });
    const { longDescription, features, colors } = (await getProductById(seeded.id))!;
    expect({ longDescription, features, colors }).toEqual({
      longDescription: seeded.longDescription,
      features: seeded.features,
      colors: seeded.colors,
    });
  });

  it("returns null when the product is gone", async () => {
    expect(await updateProduct(await owner(), "missing", input)).toBeNull();
  });
});

describe("setProductFlag", () => {
  it("hides a product from every public read and shows it again", async () => {
    const actor = await owner();
    const [product] = await getProducts();

    expect(await setProductFlag(actor, product.id, "isVisible", false)).toMatchObject({ id: product.id, isVisible: true });
    expect(await getProductById(product.id)).toBeUndefined();
    expect((await getAdminProduct(product.id))?.isVisible).toBe(false);

    await setProductFlag(actor, product.id, "isVisible", true);
    expect(await getProductById(product.id)).toBeDefined();
    expect((await auditFor(product.id)).map((entry) => entry.action)).toEqual(["product_visibility", "product_visibility"]);
  });

  it("records the stock change with the old and new value", async () => {
    const [product] = await getProducts();
    await setProductFlag(await owner(), product.id, "inStock", false);
    expect((await getProductById(product.id))?.inStock).toBe(false);
    expect(await auditFor(product.id)).toEqual([
      { action: "product_stock", before: { inStock: true }, after: { inStock: false } },
    ]);
  });

  it("puts the most recently featured product first on the home page", async () => {
    const actor = await owner();
    const notFeatured = (await getProducts()).find((p) => !p.featured)!;
    const firstBefore = (await getFeaturedProducts())[0];

    await setProductFlag(actor, notFeatured.id, "featured", true);
    expect((await getFeaturedProducts()).map((p) => p.id).slice(0, 2)).toEqual([notFeatured.id, firstBefore.id]);

    await setProductFlag(actor, notFeatured.id, "featured", false);
    expect((await getFeaturedProducts())[0].id).toBe(firstBefore.id);
    const [row] = await db().select({ featuredAt: products.featuredAt }).from(products).where(eq(products.id, notFeatured.id));
    expect(row.featuredAt).toBeNull();
  });

  it("keeps the featured order when an already featured product is edited", async () => {
    const actor = await owner();
    const newer = await createProduct(actor, { ...input, featured: true });
    const [older] = (await getFeaturedProducts()).slice(1);
    await updateProduct(actor, older.id, { ...input, name: older.name, featured: true });
    expect((await getFeaturedProducts())[0].id).toBe(newer);
  });

  it("returns null for a missing product", async () => {
    expect(await setProductFlag(await owner(), "missing", "inStock", false)).toBeNull();
  });
});

describe("listing", () => {
  it("lists hidden products too, most recently changed first", async () => {
    const actor = await owner();
    const [first, second] = await getProducts();
    await setProductFlag(actor, first.id, "isVisible", false);
    await new Promise((resolve) => setTimeout(resolve, 5));
    await setProductFlag(actor, second.id, "inStock", false);

    const list = await listAdminProducts();
    expect(list.map((p) => p.id).slice(0, 2)).toEqual([second.id, first.id]);
  });

  it("links each product to its subcategory and flags products whose subcategory is gone", async () => {
    const id = await createProduct(await owner(), input);
    const [row] = await db().select({ subcategoryId: products.subcategoryId }).from(products).where(eq(products.id, id));
    expect(row.subcategoryId).toBe("paints-exterior-emulsion");
    expect(await getAdminProduct(id)).toMatchObject({ needsCategory: false, type: "Exterior Emulsion" });

    await db().delete(subcategories).where(eq(subcategories.id, "paints-exterior-emulsion"));
    expect(await getAdminProduct(id)).toMatchObject({ needsCategory: true, type: "Exterior Emulsion" });
    expect(await getProductById(id)).toBeUndefined();
  });
});
