import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import BrandGrid from "@/components/brands/BrandGrid";
import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

describe("BrandGrid", () => {
  it("links every brand to its own page", () => {
    renderWithProviders(<BrandGrid brands={["Asian Paints", "Berger"]} />);
    expect(screen.getByRole("link", { name: "Asian Paints products" }).getAttribute("href")).toBe(
      "/brands/asian-paints",
    );
    expect(screen.getByRole("link", { name: "Berger products" })).toBeTruthy();
  });

  it("shows product counts when given", () => {
    renderWithProviders(<BrandGrid brands={["Berger", "Bosch"]} counts={{ Berger: 3, Bosch: 1 }} />);
    expect(screen.getByRole("link", { name: "Berger, 3 products" }).textContent).toContain("3 products");
    expect(screen.getByRole("link", { name: "Bosch, 1 product" }).textContent).toContain("1 product");
  });
});
