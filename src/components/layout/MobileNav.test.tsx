import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import MobileNav from "@/components/layout/MobileNav";
import { pathname } from "@/test/mocks/next-navigation";
import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

afterEach(() => {
  pathname.mockReturnValue("/");
});

describe("MobileNav", () => {
  it("links to home, products, categories and contact", () => {
    renderWithProviders(<MobileNav />);
    const nav = within(screen.getByRole("navigation", { name: "Quick links" }));
    expect(nav.getAllByRole("link").map((a) => a.getAttribute("href"))).toEqual(["/", "/products", "/categories", "/contact"]);
  });

  it("marks the section of the current page", () => {
    pathname.mockReturnValue("/products/paints/interior");
    renderWithProviders(<MobileNav />);
    expect(screen.getByRole("link", { name: "Products" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Home" }).getAttribute("aria-current")).toBeNull();
  });
});
