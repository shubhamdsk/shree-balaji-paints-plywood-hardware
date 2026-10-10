import { describe, expect, it } from "vitest";
import { LEGACY_CATEGORY_IDS, LEGACY_REDIRECTS } from "@/lib/legacy-routes";
import { ROUTES } from "@/lib/routes";

const destination = (source: string) => LEGACY_REDIRECTS.find((r) => r.source === source)?.destination;

describe("LEGACY_REDIRECTS", () => {
  it("sends old type pages to the matching new subcategory page", () => {
    expect(destination("/products/paints/interior")).toBe(ROUTES.category("paints", "Interior Emulsion"));
    expect(destination("/products/paints/putty")).toBe(ROUTES.category("paint-preparation", "Wall Putty"));
    expect(destination("/products/plywood/marine")).toBe(ROUTES.category("plywood-boards", "BWP / Marine Plywood"));
    expect(destination("/products/plywood/laminate")).toBe(ROUTES.category("laminates", "Decorative Laminates"));
  });

  it("sends every old category, and anything under it, to its new category or the catalogue", () => {
    expect(destination("/products/plywood/:type*")).toBe(ROUTES.category("plywood-boards"));
    expect(destination("/products/hardware/:type*")).toBe(ROUTES.category("furniture-hardware"));
    expect(destination("/products/plumbing/:type*")).toBe(ROUTES.products);
    for (const id of LEGACY_CATEGORY_IDS) expect(destination(`/products/${id}/:type*`)).toBeDefined();
  });

  it("lists the specific type moves before the category catch-alls that would swallow them", () => {
    const sources = LEGACY_REDIRECTS.map((r) => r.source);
    expect(sources.indexOf("/products/plywood/marine")).toBeLessThan(sources.indexOf("/products/plywood/:type*"));
    expect(LEGACY_REDIRECTS.every((r) => r.permanent)).toBe(true);
  });
});
