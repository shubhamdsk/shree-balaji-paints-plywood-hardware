import { describe, expect, it } from "vitest";
import { formatPrice } from "@/lib/price";

describe("formatPrice", () => {
  it("shows the starting price in whole rupees with Indian grouping and the unit", () => {
    expect(formatPrice(1250, "per sheet")).toBe("From ₹1,250 per sheet");
    expect(formatPrice(125000)).toBe("From ₹1,25,000");
  });

  it("asks for the price when none is set", () => {
    expect(formatPrice(undefined, "per litre")).toBe("Ask for price");
    expect(formatPrice(0, "per litre")).toBe("Ask for price");
  });
});
