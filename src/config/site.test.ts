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
    expect(siteUrl).toBe("https://shree-balaji-paints-plywood-hardwar.vercel.app");
  });

  it("uses SITE_URL without a trailing slash", async () => {
    const { siteUrl, absoluteUrl } = await loadSite("https://shree-balaji.netlify.app/");
    expect(siteUrl).toBe("https://shree-balaji.netlify.app");
    expect(absoluteUrl("/brands")).toBe("https://shree-balaji.netlify.app/brands");
    expect(absoluteUrl("/")).toBe("https://shree-balaji.netlify.app");
  });
});
