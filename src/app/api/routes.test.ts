import { describe, expect, it } from "vitest";
import { GET as getBrands } from "@/app/api/brands/route";
import { GET as getCategoryGroups } from "@/app/api/categories/groups/route";
import { GET as getCategories } from "@/app/api/categories/route";
import { GET as getProduct } from "@/app/api/products/[id]/route";
import { GET as getProducts } from "@/app/api/products/route";
import { setupTestDatabase } from "@/test/db";

setupTestDatabase();

type ProductRouteContext = Parameters<typeof getProduct>[1];

function productContext(id: string) {
  return { params: Promise.resolve({ id }) } as ProductRouteContext;
}

describe("REST routes", () => {
  it.each([
    ["/api/products", getProducts],
    ["/api/categories", getCategories],
    ["/api/categories/groups", getCategoryGroups],
    ["/api/brands", getBrands],
  ])("%s returns a JSON list", async (_path, handler) => {
    const response = await handler();
    expect(response.status).toBe(200);
    expect(Array.isArray(await response.json())).toBe(true);
  });

  it("/api/products/[id] returns the product", async () => {
    const response = await getProduct(new Request("http://test/api/products/ap-royale-luxury"), productContext("ap-royale-luxury"));
    expect(response.status).toBe(200);
    expect((await response.json()).id).toBe("ap-royale-luxury");
  });

  it("/api/products/[id] returns 404 for an unknown product", async () => {
    const response = await getProduct(new Request("http://test/api/products/nope"), productContext("nope"));
    expect(response.status).toBe(404);
  });
});
