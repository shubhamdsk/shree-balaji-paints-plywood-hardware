import { describe, expect, it } from "vitest";
import {
  categoryLabel,
  categoryPageMeta,
  compareByPrice,
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

describe("compareByPrice", () => {
  it("sorts by price in either direction and puts products without a price last", () => {
    const list = [product({ id: "ask" }), product({ id: "high", priceFrom: 900 }), product({ id: "low", priceFrom: 100 })];
    const ids = (direction: "asc" | "desc") => [...list].sort((a, b) => compareByPrice(a, b, direction)).map((p) => p.id);
    expect(ids("asc")).toEqual(["low", "high", "ask"]);
    expect(ids("desc")).toEqual(["high", "low", "ask"]);
  });
});

describe("findBrandBySlug", () => {
  it("finds the brand name for a slug, or undefined", () => {
    expect(findBrandBySlug(products, "asian-paints")).toBe("Asian Paints");
    expect(findBrandBySlug(products, "unknown")).toBeUndefined();
  });
});

describe("categoryLabel", () => {
  it("uses the category name from the database, or a readable form of the id", () => {
    expect(categoryLabel(product({ category: "paint-preparation", categoryName: "Paint Preparation Material" }))).toBe(
      "Paint Preparation Material",
    );
    expect(categoryLabel(product({ category: "paint-preparation" }))).toBe("Paint preparation");
  });
});

describe("categoryPageMeta", () => {
  const group = {
    id: "paints",
    name: "Paints",
    subtypes: ["Interior Emulsion", "Wood Paint"],
    seoTitle: "Paints in Kotul",
    subtypeDetails: [
      { name: "Interior Emulsion", seoDescription: "Washable emulsions for every room." },
      { name: "Wood Paint", description: "Paints for doors and furniture." },
    ],
  };

  it("uses the owner's search title and description when they are set", () => {
    expect(categoryPageMeta(group).title).toBe("Paints in Kotul");
    expect(categoryPageMeta(group, "Interior Emulsion")).toEqual({
      title: "Interior Emulsion Paints",
      description: "Washable emulsions for every room.",
    });
  });

  it("falls back to the description, then to a standard sentence", () => {
    expect(categoryPageMeta(group, "Wood Paint").description).toBe("Paints for doors and furniture.");
    expect(categoryPageMeta(group).description).toMatch(/^Browse paints at /);
  });
});
