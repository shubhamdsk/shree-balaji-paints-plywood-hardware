import { afterEach, describe, expect, it, vi } from "vitest";

async function loadSite(siteUrl?: string) {
  vi.resetModules();
  vi.stubEnv("SITE_URL", siteUrl ?? "");
  return import("@/config/site");
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("site config", () => {
  it("falls back to the current live address", async () => {
    const { siteUrl } = await loadSite();
    expect(siteUrl).toBe("https://shree-balaji.shreebalajipaints.workers.dev");
  });

  it("uses SITE_URL without a trailing slash", async () => {
    const { siteUrl, absoluteUrl } = await loadSite("https://shop.example.com/");
    expect(siteUrl).toBe("https://shop.example.com");
    expect(absoluteUrl("/brands")).toBe("https://shop.example.com/brands");
    expect(absoluteUrl("/")).toBe("https://shop.example.com");
  });
});
