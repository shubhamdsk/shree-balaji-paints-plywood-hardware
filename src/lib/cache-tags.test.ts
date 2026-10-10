import { describe, expect, it } from "vitest";
import { CACHE_TAGS, productChangeTags, type ProductSnapshot } from "@/lib/cache-tags";

const paint: ProductSnapshot = {
  id: "ap-royale",
  name: "Royale",
  brand: "Asian Paints",
  category: "paints",
  type: "Interior Emulsion",
  isVisible: true,
  featured: false,
};

describe("productChangeTags", () => {
  it("limits a stock or price change to the product, its category, its brand and the full list", () => {
    expect(productChangeTags(paint, { ...paint }).sort()).toEqual(
      ["products", "product:ap-royale", "category-products:paints", "brand-products:asian-paints"].sort(),
    );
  });

  it("refreshes the featured list when the product is or was featured", () => {
    expect(productChangeTags(paint, { ...paint, featured: true })).toContain(CACHE_TAGS.featured);
    expect(productChangeTags({ ...paint, featured: true }, paint)).toContain(CACHE_TAGS.featured);
  });

  it("refreshes both categories and brands when a product moves", () => {
    const tags = productChangeTags(paint, { ...paint, category: "paint-preparation", brand: "Birla Opus" });
    expect(tags).toEqual(
      expect.arrayContaining([
        "category-products:paints",
        "category-products:paint-preparation",
        "brand-products:asian-paints",
        "brand-products:birla-opus",
        CACHE_TAGS.productIndex,
      ]),
    );
  });

  it("refreshes the product index for new, renamed and hidden products only", () => {
    expect(productChangeTags(undefined, paint)).toContain(CACHE_TAGS.productIndex);
    expect(productChangeTags(paint, { ...paint, name: "Royale Luxury" })).toContain(CACHE_TAGS.productIndex);
    expect(productChangeTags(paint, { ...paint, isVisible: false })).toContain(CACHE_TAGS.productIndex);
    expect(productChangeTags(paint, { ...paint })).not.toContain(CACHE_TAGS.productIndex);
  });

  it("skips the category tag for a product without a category", () => {
    expect(productChangeTags({ ...paint, category: null }, { ...paint, category: null })).not.toContain(
      "category-products:null",
    );
  });
});
