import { describe, expect, it } from "vitest";
import {
  buildEstimateMessage,
  estimatePaint,
  formatPacks,
  isCalculablePaint,
  parseMillilitres,
  suggestPacks,
  validateRoom,
  type RoomValues,
} from "@/lib/paint-calculator";

const room: RoomValues = {
  productId: "ap-royale-luxury",
  unit: "ft",
  length: "12",
  width: "10",
  height: "10",
  doors: "1",
  windows: "2",
  coats: "2",
  includeCeiling: false,
};

const interior = { category: "paints" as const, type: "Interior", sizes: ["1 L", "4 L", "10 L", "20 L"] };

describe("parseMillilitres", () => {
  it("reads litre and millilitre pack sizes", () => {
    expect(parseMillilitres("4 L")).toBe(4000);
    expect(parseMillilitres("200 ml")).toBe(200);
    expect(parseMillilitres("1.5 L")).toBe(1500);
  });

  it("ignores sizes that are not liquid volumes", () => {
    expect(parseMillilitres("20 kg")).toBeNull();
    expect(parseMillilitres("8 x 4 ft")).toBeNull();
  });
});

describe("isCalculablePaint", () => {
  it("accepts wall paints sold by volume", () => {
    expect(isCalculablePaint(interior)).toBe(true);
    expect(isCalculablePaint({ ...interior, type: "Exterior" })).toBe(true);
  });

  it("rejects other categories, unsupported types and paints sold by weight", () => {
    expect(isCalculablePaint({ ...interior, category: "plywood" })).toBe(false);
    expect(isCalculablePaint({ ...interior, type: "Enamel" })).toBe(false);
    expect(isCalculablePaint({ ...interior, type: "Interior", sizes: ["5 kg", "20 kg"] })).toBe(false);
  });
});

describe("validateRoom", () => {
  it("accepts a complete room", () => {
    expect(validateRoom(room)).toEqual({});
  });

  it("requires a paint and positive sizes", () => {
    const errors = validateRoom({ ...room, productId: "", length: "", width: "0", height: "-2" });
    expect(Object.keys(errors).sort()).toEqual(["height", "length", "productId", "width"]);
  });

  it("limits sizes to a realistic room in either unit", () => {
    expect(validateRoom({ ...room, length: "201" }).length).toBe("Enter 200 ft or less.");
    expect(validateRoom({ ...room, unit: "m", length: "61" }).length).toBe("Enter 60 m or less.");
    expect(validateRoom({ ...room, unit: "m", length: "60" }).length).toBeUndefined();
  });

  it("needs whole numbers of doors and windows", () => {
    expect(validateRoom({ ...room, doors: "1.5" }).doors).toBeDefined();
    expect(validateRoom({ ...room, windows: "-1" }).windows).toBeDefined();
    expect(validateRoom({ ...room, windows: "21" }).windows).toBeDefined();
  });

  it("rejects doors and windows larger than the walls", () => {
    expect(validateRoom({ ...room, length: "2", width: "2", height: "2", doors: "2" }).doors).toBe(
      "Doors and windows are larger than the walls.",
    );
  });
});

describe("suggestPacks", () => {
  it("covers the need with the least waste, then the fewest cans", () => {
    expect(suggestPacks(14, interior.sizes)).toEqual([
      { label: "10 L", count: 1 },
      { label: "4 L", count: 1 },
    ]);
    expect(suggestPacks(8, interior.sizes)).toEqual([{ label: "4 L", count: 2 }]);
    expect(suggestPacks(40, interior.sizes)).toEqual([{ label: "20 L", count: 2 }]);
  });

  it("rounds up to the next pack when no exact combination exists", () => {
    expect(suggestPacks(3, ["4 L", "10 L", "20 L"])).toEqual([{ label: "4 L", count: 1 }]);
  });

  it("handles millilitre packs and ignores sizes that are not volumes", () => {
    expect(suggestPacks(0.7, ["200 ml", "500 ml", "1 L", "Kit"])).toEqual([
      { label: "500 ml", count: 1 },
      { label: "200 ml", count: 1 },
    ]);
  });

  it("returns nothing when there is no need or no usable size", () => {
    expect(suggestPacks(0, interior.sizes)).toEqual([]);
    expect(suggestPacks(5, ["20 kg"])).toEqual([]);
  });
});

describe("estimatePaint", () => {
  it("subtracts doors and windows and divides by coverage for every coat", () => {
    const estimate = estimatePaint(room, interior);
    expect(estimate.areaSqft).toBe(395);
    expect(estimate.litres).toBe(8);
    expect(estimate.packs).toEqual([{ label: "4 L", count: 2 }]);
  });

  it("adds the ceiling when asked", () => {
    expect(estimatePaint({ ...room, includeCeiling: true }, interior).areaSqft).toBe(515);
  });

  it("converts metres to feet", () => {
    const estimate = estimatePaint({ ...room, unit: "m", length: "4", width: "3", height: "3", doors: "0", windows: "0" }, interior);
    expect(estimate.areaSqft).toBe(452);
  });

  it("uses the coverage of the paint type", () => {
    expect(estimatePaint(room, { ...interior, type: "Exterior" }).litres).toBe(15);
  });
});

describe("buildEstimateMessage", () => {
  it("describes the room, the estimate and the suggested packs", () => {
    const estimate = estimatePaint(room, interior);
    expect(buildEstimateMessage(room, estimate, "Asian Paints Royale").split("\n")).toEqual([
      "Hello Shree Balaji, I used the paint calculator on your website.",
      "Paint: Asian Paints Royale",
      "Room: 12 × 10 × 10 ft, 1 door(s), 2 window(s)",
      "Coats: 2",
      "Area: about 395 sq ft",
      "Estimate: about 8 L (2 × 4 L)",
      "Please confirm the quantity and price.",
    ]);
  });

  it("formats packs largest first", () => {
    expect(formatPacks([{ label: "10 L", count: 1 }, { label: "4 L", count: 1 }])).toBe("1 × 10 L + 1 × 4 L");
  });
});
