import { describe, expect, it } from "vitest";
import { sitemapPaths } from "@/lib/sitemap";
import { getCategoryGroups, getProducts } from "@/services/catalog-service";
import { setupTestDatabase } from "@/test/db";

setupTestDatabase();

describe("sitemapPaths", () => {
  it("lists the main pages, categories, stocked types, brands and every product once", async () => {
    const [products, groups] = await Promise.all([getProducts(), getCategoryGroups()]);
    const paths = sitemapPaths(products, groups);

    expect(paths).toEqual(expect.arrayContaining(["/", "/products", "/categories", "/brands", "/offers", "/paint-calculator"]));
    expect(paths).toContain("/products/paints");
    expect(paths).toContain("/products/paints/interior-emulsion");
    expect(paths).toContain("/brands/asian-paints");
    for (const p of products) expect(paths).toContain(`/products/${p.id}`);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("keeps clean paths without query strings or hashes", async () => {
    const paths = sitemapPaths(await getProducts(), await getCategoryGroups());
    expect(paths.every((path) => path.startsWith("/") && !/[?#]/.test(path))).toBe(true);
  });
});
