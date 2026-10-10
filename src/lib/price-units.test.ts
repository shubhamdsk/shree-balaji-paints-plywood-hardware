import { describe, expect, it } from "vitest";
import { PRICE_UNITS, isAllowedUnit, sizesForUnit, sortSizes, unitOptions } from "@/lib/price-units";

const fevicol = { unit: "per 500 g", sizes: ["500 g", "1 kg", "Tin"] };

describe("unitOptions", () => {
  it("lists every unit by its short name", () => {
    expect(unitOptions().slice(0, 2)).toEqual([
      { value: "per litre", label: "Litre (L)" },
      { value: "per kg", label: "Kilogram (kg)" },
    ]);
    expect(unitOptions()).toHaveLength(PRICE_UNITS.length);
  });

  it("keeps a product's own unit when it isn't in the list", () => {
    expect(unitOptions(fevicol).at(-1)).toEqual({ value: "per 500 g", label: "per 500 g" });
    expect(unitOptions({ unit: "per kg", sizes: [] })).toHaveLength(PRICE_UNITS.length);
  });
});

describe("sizesForUnit", () => {
  it("offers the sizes configured for the unit", () => {
    expect(sizesForUnit("per kg")).toContain("20 kg");
    expect(sizesForUnit("per kg")).not.toContain("4 L");
    expect(sizesForUnit("")).toEqual([]);
  });

  it("keeps sizes the product already saved with that unit", () => {
    expect(sizesForUnit("per 500 g", fevicol)).toEqual(["500 g", "1 kg", "Tin"]);
    expect(sizesForUnit("per kg", fevicol)).not.toContain("Tin");
  });
});

describe("isAllowedUnit", () => {
  it("accepts listed units and the product's own saved unit only", () => {
    expect(isAllowedUnit("per litre")).toBe(true);
    expect(isAllowedUnit("per 500 g")).toBe(false);
    expect(isAllowedUnit("per 500 g", fevicol)).toBe(true);
    expect(isAllowedUnit("", { unit: "", sizes: [] })).toBe(false);
  });
});

describe("sortSizes", () => {
  it("puts sizes in list order and drops repeats", () => {
    expect(sortSizes(["20 L", "1 L", "4 L", "1 L"], "per litre")).toEqual(["1 L", "4 L", "20 L"]);
  });
});
