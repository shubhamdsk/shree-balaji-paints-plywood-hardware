import { describe, expect, it, vi } from "vitest";
import {
  parseThemePreference,
  readThemePreference,
  resolveTheme,
  setThemePreference,
  subscribeThemePreference,
  THEME_STORAGE_KEY,
  themeInitScript,
} from "@/lib/theme";
import { stubColorScheme } from "@/test/mocks/match-media";

describe("parseThemePreference", () => {
  it("keeps known values and falls back to system", () => {
    expect(parseThemePreference("light")).toBe("light");
    expect(parseThemePreference("dark")).toBe("dark");
    expect(parseThemePreference("blue")).toBe("system");
    expect(parseThemePreference(null)).toBe("system");
  });
});

describe("resolveTheme", () => {
  it("follows the device only for the system preference", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });
});

describe("setThemePreference", () => {
  it("stores the choice, applies it and notifies subscribers", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeThemePreference(listener);

    setThemePreference("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(readThemePreference()).toBe("dark");
    expect(listener).toHaveBeenCalledTimes(1);

    unsubscribe();
    setThemePreference("light");
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("clears the stored value for system and resolves from the device", () => {
    stubColorScheme(true);
    localStorage.setItem(THEME_STORAGE_KEY, "light");

    setThemePreference("system");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(document.documentElement.dataset.theme).toBe("dark");
  });
});

describe("themeInitScript", () => {
  it("applies the saved theme, or the device theme when nothing is saved", () => {
    stubColorScheme(true);
    new Function(themeInitScript)();
    expect(document.documentElement.dataset.theme).toBe("dark");

    localStorage.setItem(THEME_STORAGE_KEY, "light");
    new Function(themeInitScript)();
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});
