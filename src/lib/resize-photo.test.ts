import { describe, expect, it } from "vitest";
import { fitWithin, MAX_PHOTO_SIDE } from "@/lib/resize-photo";

describe("fitWithin", () => {
  it("shrinks the longer side to the limit and keeps the shape", () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: MAX_PHOTO_SIDE, height: 1200 });
    expect(fitWithin(3000, 4000)).toEqual({ width: 1200, height: MAX_PHOTO_SIDE });
  });

  it("never enlarges a small photo", () => {
    expect(fitWithin(800, 600)).toEqual({ width: 800, height: 600 });
  });
});
