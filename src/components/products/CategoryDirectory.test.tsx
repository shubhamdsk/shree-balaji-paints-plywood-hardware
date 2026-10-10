import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import CategoryDirectory from "@/components/products/CategoryDirectory";
import { renderWithProviders } from "@/test/render";
import type { Category, CategoryGroup, Product } from "@/types";

vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const categories: Category[] = [
  { id: "paints", name: "Paints", tagline: "", description: "Wall and wood paints", image: "/images/categories/paints.jpg" },
  { id: "tools", name: "Tools", tagline: "", description: "Hand tools", image: "/images/categories/tools.jpg" },
];

const groups: CategoryGroup[] = [
  { id: "paints", name: "Paints", subtypes: ["Interior", "Exterior", "Enamel"] },
  { id: "tools", name: "Tools", subtypes: ["Tools"] },
];

function product(id: string, category: Product["category"], type: string): Product {
  return { id, name: id, brand: "B", category, type, description: "", sizes: [], priceFrom: 0, unit: "", colors: [], inStock: true };
}

const products = [product("a", "paints", "Interior"), product("b", "paints", "Exterior"), product("c", "tools", "Tools")];

describe("CategoryDirectory", () => {
  it("links every category with its product count", () => {
    renderWithProviders(<CategoryDirectory categories={categories} groups={groups} products={products} />);
    expect(screen.getByRole("link", { name: /Paints\s*2 products/ }).getAttribute("href")).toBe("/products/paints");
    expect(screen.getByRole("link", { name: /Tools\s*1 product$/ }).getAttribute("href")).toBe("/products/tools");
  });

  it("lists only the stocked types of a category", () => {
    renderWithProviders(<CategoryDirectory categories={categories} groups={groups} products={products} />);
    const types = within(screen.getByRole("list", { name: "Paints types" }));
    expect(types.getAllByRole("link").map((a) => a.textContent)).toEqual(["Interior", "Exterior"]);
    expect(screen.queryByRole("list", { name: "Tools types" })).toBeNull();
  });

  it("leaves out categories with no products", () => {
    renderWithProviders(<CategoryDirectory categories={categories} groups={groups} products={products.slice(0, 2)} />);
    expect(screen.queryByRole("link", { name: /Tools/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Paints\s*2 products/ })).toBeDefined();
  });
});
