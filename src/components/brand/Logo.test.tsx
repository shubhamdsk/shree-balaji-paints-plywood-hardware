import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Logo from "@/components/brand/Logo";
import { shop } from "@/config/shop";
import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

describe("Logo", () => {
  it("links home with the English shop name and shows the Marathi wordmark", () => {
    renderWithProviders(<Logo />);
    const link = screen.getByRole("link", { name: shop.name });
    expect(link.getAttribute("href")).toBe("/");
    expect(link.textContent).toContain(shop.marathi.name);
    expect(link.textContent).toContain(shop.marathi.tagline);
  });

  it("keeps the accessible name in compact mode and hides the mark from screen readers", () => {
    renderWithProviders(<Logo compact />);
    const link = screen.getByRole("link", { name: "Shree Balaji" });
    expect(link.querySelector("svg")?.getAttribute("aria-hidden")).toBe("true");
    expect(link.textContent).toBe("");
  });
});
