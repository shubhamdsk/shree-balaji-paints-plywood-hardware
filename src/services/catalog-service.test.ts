import { eq } from "drizzle-orm";
import { describe, expect, it, vi } from "vitest";
import { categories, products, subcategories } from "@/server/db/schema";
import { setupTestDatabase } from "@/test/db";

const db = setupTestDatabase();

async function loadService(catalogApiUrl?: string) {
  vi.resetModules();
  vi.stubEnv("CATALOG_API_URL", catalogApiUrl ?? "");
  return import("@/services/catalog-service");
}

describe("catalog-service with the database", () => {
  it("leaves hidden products out of every read", async () => {
    await db().update(products).set({ isVisible: false }).where(eq(products.id, "ap-royale-luxury"));
    const { getProducts, getProductById, getCalculablePaints } = await loadService();
    expect((await getProducts()).map((p) => p.id)).not.toContain("ap-royale-luxury");
    expect(await getProductById("ap-royale-luxury")).toBeUndefined();
    expect((await getCalculablePaints()).map((p) => p.id)).not.toContain("ap-royale-luxury");
  });

  it("shows a product under its subcategory's current name after a rename", async () => {
    await db().update(subcategories).set({ name: "Luxury Interior Emulsion" }).where(eq(subcategories.id, "paints-interior-emulsion"));
    const { getProductById, getCategoryGroups } = await loadService();
    expect((await getProductById("ap-royale-luxury"))?.type).toBe("Luxury Interior Emulsion");
    const paints = (await getCategoryGroups()).find((g) => g.id === "paints");
    expect(paints?.subtypes).toContain("Luxury Interior Emulsion");
  });

  it("hides the products of a hidden subcategory or category", async () => {
    await db().update(subcategories).set({ isActive: false }).where(eq(subcategories.id, "paints-interior-emulsion"));
    await db().update(categories).set({ isActive: false }).where(eq(categories.id, "laminates"));
    const { getProducts, getCategories } = await loadService();
    const shown = await getProducts();
    expect(shown.some((p) => p.type === "Interior Emulsion")).toBe(false);
    expect(shown.some((p) => p.category === "laminates")).toBe(false);
    expect((await getCategories()).map((c) => c.id)).not.toContain("laminates");
  });

  it("returns no image for a category without a photo so the page shows a placeholder", async () => {
    await db().update(categories).set({ image: null }).where(eq(categories.id, "screws-fasteners"));
    const { getCategories } = await loadService();
    expect((await getCategories()).find((c) => c.id === "screws-fasteners")?.image).toBeUndefined();
  });

  it("returns products in the catalogue order with their details", async () => {
    const { getProducts, getProductById } = await loadService();
    expect((await getProducts())[0].id).toBe("ap-royale-luxury");
    const product = await getProductById("ap-royale-luxury");
    expect(product?.colors.length).toBeGreaterThan(0);
    expect(product?.features?.length).toBeGreaterThan(0);
  });

  it("returns products with unique IDs", async () => {
    const { getProducts } = await loadService();
    const products = await getProducts();
    expect(products.length).toBeGreaterThan(0);
    expect(new Set(products.map((p) => p.id)).size).toBe(products.length);
  });

  it("only uses categories that exist", async () => {
    const { getProducts, getCategories, getCategoryGroups } = await loadService();
    const categoryIds = new Set((await getCategories()).map((c) => c.id));
    for (const p of await getProducts()) expect(categoryIds).toContain(p.category);
    for (const g of await getCategoryGroups()) expect(categoryIds).toContain(g.id);
  });

  it("finds a product by ID and returns undefined for an unknown ID", async () => {
    const { getProductById } = await loadService();
    expect((await getProductById("ap-royale-luxury"))?.name).toBe("Royale Luxury Emulsion");
    expect(await getProductById("does-not-exist")).toBeUndefined();
  });

  it("returns only featured products", async () => {
    const { getFeaturedProducts } = await loadService();
    const featured = await getFeaturedProducts();
    expect(featured.length).toBeGreaterThan(0);
    expect(featured.every((p) => p.featured)).toBe(true);
  });

  it("returns only wall paints the calculator supports", async () => {
    const { getCalculablePaints } = await loadService();
    const paints = await getCalculablePaints();
    expect(paints.map((p) => p.id)).toContain("ap-royale-luxury");
    expect(
      paints.every(
        (p) => (p.category === "paints" || p.category === "paint-preparation") && !["Enamel Paint", "Wall Putty"].includes(p.type),
      ),
    ).toBe(true);
  });

  it("returns the popular brands", async () => {
    const { getPopularBrands } = await loadService();
    expect(await getPopularBrands()).toContain("Asian Paints");
  });

  it("reads only one category's products, in the catalogue order", async () => {
    const { getCategoryProducts, getCatalogProducts } = await loadService();
    const paints = await getCategoryProducts("paints");
    expect(paints.length).toBeGreaterThan(0);
    expect(paints.every((p) => p.category === "paints")).toBe(true);
    const all = await getCatalogProducts();
    expect(paints.map((p) => p.id)).toEqual(all.filter((p) => p.category === "paints").map((p) => p.id));
  });

  it("keeps the light index in step with the visible products", async () => {
    await db().update(products).set({ isVisible: false }).where(eq(products.id, "ap-royale-luxury"));
    const { getProductIndex, getProducts } = await loadService();
    const index = await getProductIndex();
    expect(index.map((p) => p.id).sort()).toEqual((await getProducts()).map((p) => p.id).sort());
    expect(Object.keys(index[0]).sort()).toEqual(["brand", "category", "id", "name", "type"]);
  });

  it("finds a brand by its slug and reads only that brand's products", async () => {
    const { findBrand, getBrandProducts } = await loadService();
    expect(await findBrand("asian-paints")).toBe("Asian Paints");
    expect(await findBrand("no-such-brand")).toBeUndefined();
    const products = await getBrandProducts("Asian Paints");
    expect(products.length).toBeGreaterThan(0);
    expect(products.every((p) => p.brand === "Asian Paints")).toBe(true);
  });

  it("shows the first gallery photo on catalogue cards, falling back to the main photo", async () => {
    await db()
      .update(products)
      .set({ image: "/main.jpg", details: { gallery: ["/gallery-1.jpg", "/gallery-2.jpg"] } })
      .where(eq(products.id, "ap-royale-luxury"));
    await db().update(products).set({ image: "/only.jpg", details: {} }).where(eq(products.id, "ap-apex-ultima"));
    const { getCatalogProducts } = await loadService();
    const cards = await getCatalogProducts();
    expect(cards.find((p) => p.id === "ap-royale-luxury")?.image).toBe("/gallery-1.jpg");
    expect(cards.find((p) => p.id === "ap-apex-ultima")?.image).toBe("/only.jpg");
  });
});

describe("catalog-service with an external backend", () => {
  it("fetches products from CATALOG_API_URL", async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json([{ id: "remote" }]));
    vi.stubGlobal("fetch", fetchMock);
    const { getProducts } = await loadService("https://backend.test");

    expect(await getProducts()).toEqual([{ id: "remote" }]);
    expect(fetchMock.mock.calls[0][0]).toBe("https://backend.test/api/products");
  });

  it("maps a 404 for a product to undefined", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 404 })));
    const { getProductById } = await loadService("https://backend.test");
    expect(await getProductById("missing")).toBeUndefined();
  });

  it("rethrows other backend errors", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 500 })));
    const { getProductById } = await loadService("https://backend.test");
    await expect(getProductById("any")).rejects.toThrow("500");
  });
});
