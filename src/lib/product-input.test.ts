import { describe, expect, it } from "vitest";
import { createProductId, parsePrice, readProductForm, validateProductInput } from "@/lib/product-input";
import type { CategoryGroup } from "@/types";

const groups = [
  { id: "paints", name: "Paints", subtypes: ["Interior", "Exterior"] },
  { id: "plywood", name: "Plywood", subtypes: ["Marine"] },
] as CategoryGroup[];

const valid = {
  name: "Weatherbond Advance",
  brand: "Nippon Paint",
  category: "paints",
  type: "Exterior",
  description: "",
  sizes: ["1 L", "4 L"],
  priceFrom: 295,
  unit: "per litre",
  inStock: true,
  featured: false,
};

describe("parsePrice", () => {
  it("reads whole rupees and ignores grouping commas", () => {
    expect(parsePrice("1,25,000")).toBe(125000);
    expect(parsePrice(" 520 ")).toBe(520);
  });

  it("treats an empty price as not set", () => {
    expect(parsePrice("  ")).toBeUndefined();
  });

  it("marks anything else as invalid", () => {
    for (const text of ["520.50", "12.345", "-5", "₹520", "abc", "1e3"]) expect(parsePrice(text)).toBeNaN();
  });
});

describe("readProductForm", () => {
  it("turns the submitted form into product input", () => {
    const formData = new FormData();
    for (const [key, value] of Object.entries({
      name: "Weatherbond Advance",
      brand: "Nippon Paint",
      category: "paints",
      type: "Exterior",
      priceFrom: "295",
      unit: "per litre",
      inStock: "on",
    })) {
      formData.set(key, value);
    }
    formData.append("sizes", "1 L");
    formData.append("sizes", "4 L");
    expect(readProductForm(formData)).toEqual(valid);
  });
});

describe("validateProductInput", () => {
  it("accepts a complete product", () => {
    expect(validateProductInput(valid, groups)).toEqual({ ok: true, input: valid });
  });

  it("accepts a product without a price", () => {
    const result = validateProductInput({ ...valid, priceFrom: undefined }, groups);
    expect(result.ok).toBe(true);
  });

  it("reports one message per field", () => {
    const result = validateProductInput(
      { ...valid, name: " ", brand: "", category: "tiles", sizes: [], priceFrom: Number.NaN, unit: "" },
      groups,
    );
    expect(result).toEqual({
      ok: false,
      errors: {
        name: "Enter the product name",
        brand: "Enter the brand",
        category: "Choose a category",
        sizes: "Choose at least one size",
        priceFrom: "Enter the price in whole rupees, like 520",
        unit: "Choose a price unit",
      },
    });
  });

  it("puts sizes in the unit's list order", () => {
    expect(validateProductInput({ ...valid, sizes: ["20 L", "1 L"] }, groups)).toMatchObject({
      ok: true,
      input: { sizes: ["1 L", "20 L"] },
    });
  });

  it("rejects a unit outside the list and sizes that belong to another unit", () => {
    expect(validateProductInput({ ...valid, unit: "per bucket" }, groups)).toEqual({
      ok: false,
      errors: { unit: "Choose a price unit" },
    });
    expect(validateProductInput({ ...valid, unit: "per kg" }, groups)).toEqual({
      ok: false,
      errors: { sizes: "Choose sizes from the list for this unit" },
    });
  });

  it("keeps a product's own saved unit and sizes valid when editing", () => {
    const saved = { unit: "per 500 g", sizes: ["500 g", "Tin"] };
    const fevicol = { ...valid, unit: "per 500 g", sizes: ["Tin", "500 g"] };
    expect(validateProductInput(fevicol, groups, saved)).toMatchObject({ ok: true, input: { sizes: ["500 g", "Tin"] } });
    expect(validateProductInput(fevicol, groups).ok).toBe(false);
  });

  it("rejects a type from another category", () => {
    const result = validateProductInput({ ...valid, type: "Marine" }, groups);
    expect(result).toEqual({ ok: false, errors: { type: "Choose a type from this category" } });
  });

  it("rejects paise sent straight to the server", () => {
    expect(validateProductInput({ ...valid, priceFrom: 295.5 }, groups)).toEqual({
      ok: false,
      errors: { priceFrom: "Enter the price in whole rupees, like 520" },
    });
  });

  it("rejects a zero price and unknown fields", () => {
    expect(validateProductInput({ ...valid, priceFrom: 0 }, groups)).toMatchObject({
      ok: false,
      errors: { priceFrom: "Enter a price above zero" },
    });
    expect(validateProductInput({ ...valid, isVisible: false }, groups).ok).toBe(false);
  });
});

describe("createProductId", () => {
  it("builds a slug from the name", () => {
    expect(createProductId("Weatherbond Advance 10 L", [], [])).toBe("weatherbond-advance-10-l");
  });

  it("adds a number when the id is taken or is a category id", () => {
    expect(createProductId("Tractor", ["tractor", "tractor-2"], [])).toBe("tractor-3");
    expect(createProductId("Paints", [], ["paints"])).toBe("paints-2");
  });

  it("falls back to a generic id when the name has no letters or digits", () => {
    expect(createProductId("***", [], [])).toBe("product");
  });
});
