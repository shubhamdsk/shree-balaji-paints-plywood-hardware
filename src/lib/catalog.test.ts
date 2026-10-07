import { describe, expect, it } from "vitest";
import {
  countByBrand,
  countProducts,
  findBrandBySlug,
  findSubtypeBySlug,
  getBrandNames,
  listStockedSubtypes,
  productLabel,
  stockedHref,
} from "@/lib/catalog";
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

describe("countByBrand", () => {
  it("counts products for each brand across categories", () => {
    expect(countByBrand(products)).toEqual({ "Asian Paints": 2, Berger: 1 });
  });
});

describe("findSubtypeBySlug", () => {
  it("finds the subtype name for a slug, or undefined", () => {
    const group = { id: "hardware" as const, name: "Hardware", subtypes: ["Locks", "Hinges & Handles"] };
    expect(findSubtypeBySlug(group, "hinges-handles")).toBe("Hinges & Handles");
    expect(findSubtypeBySlug(group, "taps")).toBeUndefined();
  });
});

describe("listStockedSubtypes", () => {
  it("lists only the subtypes that have products, keeping their group", () => {
    const groups = [
      { id: "paints" as const, name: "Paints", subtypes: ["Interior", "Exterior", "Enamel"] },
      { id: "hardware" as const, name: "Hardware", subtypes: ["Locks"] },
    ];
    expect(listStockedSubtypes(products, groups).map(({ group, subtype }) => `${group.id}/${subtype}`)).toEqual([
      "paints/Interior",
      "paints/Exterior",
    ]);
  });
});

describe("productLabel", () => {
  it("puts the brand before the product name", () => {
    expect(productLabel({ brand: "Asian Paints", name: "Royale" })).toBe("Asian Paints Royale");
  });
});

describe("stockedHref", () => {
  it("links to the type page when that type has products", () => {
    expect(stockedHref(products, "paints", "Exterior")).toBe("/products/paints/exterior");
  });

  it("falls back to the category page when the type has none", () => {
    expect(stockedHref(products, "paints", "Primer")).toBe("/products/paints");
  });
});

describe("findBrandBySlug", () => {
  it("finds the brand name for a slug, or undefined", () => {
    expect(findBrandBySlug(products, "asian-paints")).toBe("Asian Paints");
    expect(findBrandBySlug(products, "unknown")).toBeUndefined();
  });
});
