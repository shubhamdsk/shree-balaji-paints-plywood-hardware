import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ThemeSwitcher from "@/components/layout/ThemeSwitcher";
import { THEME_STORAGE_KEY } from "@/lib/theme";
import { renderWithProviders } from "@/test/render";

describe("ThemeSwitcher", () => {
  it("starts on system and names the next theme", () => {
    renderWithProviders(<ThemeSwitcher />);
    expect(screen.getByRole("button", { name: "Theme: System. Switch to Light" })).toBeDefined();
  });

  it("shows the saved choice", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    renderWithProviders(<ThemeSwitcher showLabel />);
    expect(screen.getByRole("button", { name: "Theme: Dark. Switch to System" }).textContent).toBe("Theme: Dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
  });

  it("cycles light, dark and system, remembering each choice", async () => {
    const { user } = renderWithProviders(<ThemeSwitcher />);
    const button = screen.getByRole("button");

    await user.click(button);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("light");

    await user.click(button);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");

    await user.click(button);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBeNull();
    expect(button.getAttribute("aria-label")).toBe("Theme: System. Switch to Light");
  });
});
