import { describe, expect, it } from "vitest";
import { matchesQuery } from "@/lib/search";

describe("matchesQuery", () => {
  it("matches every word in any order, ignoring case", () => {
    expect(matchesQuery("Asian Paints Royale Luxury Emulsion", "royale asian")).toBe(true);
    expect(matchesQuery("Asian Paints Royale Luxury Emulsion", "ROYALE")).toBe(true);
    expect(matchesQuery("Asian Paints Royale Luxury Emulsion", "royale berger")).toBe(false);
  });

  it("matches everything for an empty query", () => {
    expect(matchesQuery("Berger Bison", "   ")).toBe(true);
  });
});
