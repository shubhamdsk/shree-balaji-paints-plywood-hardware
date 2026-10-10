import { describe, expect, it } from "vitest";
import { todayInIndia } from "@/lib/dates";

describe("todayInIndia", () => {
  it("uses the Indian date, which is ahead of UTC late in the evening", () => {
    expect(todayInIndia(new Date("2026-10-19T18:29:00Z"))).toBe("2026-10-19");
    expect(todayInIndia(new Date("2026-10-19T18:30:00Z"))).toBe("2026-10-20");
  });
});
