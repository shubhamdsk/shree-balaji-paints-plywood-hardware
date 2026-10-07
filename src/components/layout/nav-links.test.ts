import { describe, expect, it } from "vitest";
import { isActivePath } from "@/components/layout/nav-links";

describe("isActivePath", () => {
  it("matches home only on the home page", () => {
    expect(isActivePath("/", "/")).toBe(true);
    expect(isActivePath("/", "/products")).toBe(false);
  });

  it("matches a section and the pages inside it", () => {
    expect(isActivePath("/brands", "/brands")).toBe(true);
    expect(isActivePath("/brands", "/brands/asian-paints")).toBe(true);
  });

  it("does not match a different path that shares a prefix", () => {
    expect(isActivePath("/offers", "/offers-old")).toBe(false);
  });
});
