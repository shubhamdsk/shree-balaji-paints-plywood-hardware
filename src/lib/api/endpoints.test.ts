import { describe, expect, it } from "vitest";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

describe("API_ENDPOINTS", () => {
  it("encodes product IDs in the product path", () => {
    expect(API_ENDPOINTS.product("ap-royale-luxury")).toBe("/api/products/ap-royale-luxury");
    expect(API_ENDPOINTS.product("a/b c")).toBe("/api/products/a%2Fb%20c");
  });

  it("keeps every path under /api", () => {
    const paths = [API_ENDPOINTS.products, API_ENDPOINTS.categories, API_ENDPOINTS.categoryGroups, API_ENDPOINTS.brands];
    for (const path of paths) expect(path.startsWith("/api/")).toBe(true);
  });
});
