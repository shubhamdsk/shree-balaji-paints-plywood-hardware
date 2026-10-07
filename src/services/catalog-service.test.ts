import { describe, expect, it, vi } from "vitest";

async function loadService(catalogApiUrl?: string) {
  vi.resetModules();
  vi.stubEnv("CATALOG_API_URL", catalogApiUrl ?? "");
  return import("@/services/catalog-service");
}

describe("catalog-service with local data", () => {
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
    expect(paints.every((p) => p.category === "paints" && !["Enamel", "Putty"].includes(p.type))).toBe(true);
  });

  it("returns the popular brands", async () => {
    const { getPopularBrands } = await loadService();
    expect(await getPopularBrands()).toContain("Asian Paints");
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
