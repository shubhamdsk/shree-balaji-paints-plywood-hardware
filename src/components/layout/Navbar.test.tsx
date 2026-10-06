import { screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Navbar from "@/components/layout/Navbar";
import { pathname } from "@/test/mocks/next-navigation";
import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

function currentLinks() {
  return screen
    .getAllByRole("link")
    .filter((link) => link.getAttribute("aria-current") === "page")
    .map((link) => link.textContent);
}

afterEach(() => {
  pathname.mockReturnValue("/");
});

describe("Navbar", () => {
  it("links each menu item to its own page", () => {
    renderWithProviders(<Navbar />);
    const hrefs = ["Brands", "Offers", "About", "Contact"].map((name) =>
      screen.getByRole("link", { name }).getAttribute("href"),
    );
    expect(hrefs).toEqual(["/brands", "/offers", "/about", "/contact"]);
  });

  it.each([
    ["/", "Home"],
    ["/brands", "Brands"],
    ["/contact", "Contact"],
    ["/products/asian-royale", "Products"],
  ])("marks only the current page on %s", (path, label) => {
    pathname.mockReturnValue(path);
    renderWithProviders(<Navbar />);
    expect(currentLinks()).toEqual([label]);
  });
});
