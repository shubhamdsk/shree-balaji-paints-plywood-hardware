import { describe, expect, it } from "vitest";
import { ROUTES } from "@/lib/routes";
import { slugify } from "@/lib/slug";

describe("slugify", () => {
  it("turns names into clean path segments", () => {
    expect(slugify("Asian Paints")).toBe("asian-paints");
    expect(slugify(" Hinges & Handles ")).toBe("hinges-handles");
  });
});

describe("ROUTES", () => {
  it("builds clean paths without query strings or hashes", () => {
    expect(ROUTES.category("paints")).toBe("/products/paints");
    expect(ROUTES.category("paints", "Interior")).toBe("/products/paints/interior");
    expect(ROUTES.category("hardware", "Hinges & Handles")).toBe("/products/hardware/hinges-handles");
    expect(ROUTES.product("ap-royale-luxury")).toBe("/products/ap-royale-luxury");
    expect(ROUTES.brand("Century Ply")).toBe("/brands/century-ply");
    expect(ROUTES.enquiry()).toBe("/enquiry");
    expect(ROUTES.enquiry("ap-royale-luxury")).toBe("/enquiry/ap-royale-luxury");
  });
});
