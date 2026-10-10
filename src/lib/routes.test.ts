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
    expect(ROUTES.category("paints", "Interior Emulsion")).toBe("/products/paints/interior-emulsion");
    expect(ROUTES.category("plywood-boards", "BWP / Marine Plywood")).toBe("/products/plywood-boards/bwp-marine-plywood");
    expect(ROUTES.adminSubcategory("paints", "paints-wood-paint")).toBe("/admin/categories/paints/types/paints-wood-paint");
    expect(ROUTES.product("ap-royale-luxury")).toBe("/products/ap-royale-luxury");
    expect(ROUTES.brand("Century Ply")).toBe("/brands/century-ply");
    expect(ROUTES.enquiry()).toBe("/enquiry");
    expect(ROUTES.enquiry("ap-royale-luxury")).toBe("/enquiry/ap-royale-luxury");
    expect(ROUTES.paintCalculator()).toBe("/paint-calculator");
    expect(ROUTES.paintCalculator("ap-royale-luxury")).toBe("/paint-calculator/ap-royale-luxury");
  });
});
