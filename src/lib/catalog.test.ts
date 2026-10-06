import { describe, expect, it } from "vitest";
import { countProducts, getBrandNames } from "@/lib/catalog";
import type { Product } from "@/types";

function product(overrides: Partial<Product>): Product {
  return {
    id: "p",
    name: "Product",
    brand: "Brand",
    category: "paints",
    type: "Interior",
    description: "",
    sizes: [],
    priceFrom: 0,
    unit: "",
    colors: [],
    inStock: true,
    ...overrides,
  };
}

const products = [
  product({ id: "a", brand: "Berger", type: "Interior" }),
  product({ id: "b", brand: "Asian Paints", type: "Exterior" }),
  product({ id: "c", brand: "Asian Paints", category: "plywood", type: "Marine" }),
];

describe("countProducts", () => {
  it("counts products in a category", () => {
    expect(countProducts(products, "paints")).toBe(2);
    expect(countProducts(products, "hardware")).toBe(0);
  });

  it("narrows the count by subtype", () => {
    expect(countProducts(products, "paints", "Exterior")).toBe(1);
  });
});

describe("getBrandNames", () => {
  it("returns unique brand names in alphabetical order", () => {
    expect(getBrandNames(products)).toEqual(["Asian Paints", "Berger"]);
  });
});
