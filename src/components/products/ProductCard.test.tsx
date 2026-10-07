import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ProductCard from "@/components/products/ProductCard";
import { renderWithProviders } from "@/test/render";
import type { Product } from "@/types";

vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const product: Product = {
  id: "ap-royale-luxury",
  name: "Royale Luxury Emulsion",
  brand: "Asian Paints",
  category: "paints",
  type: "Interior",
  description: "",
  sizes: ["1 L", "4 L", "10 L", "20 L", "50 L"],
  priceFrom: 0,
  unit: "",
  colors: [],
  inStock: true,
};

describe("ProductCard", () => {
  it("shows brand, category and type, and links to the product page", () => {
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByText("Asian Paints")).toBeDefined();
    expect(screen.getByText("Paints · Interior")).toBeDefined();
    expect(screen.getByRole("link", { name: "View details of Royale Luxury Emulsion" }).getAttribute("href")).toBe(
      "/products/ap-royale-luxury",
    );
  });

  it("lists the first four sizes and how many more there are", () => {
    renderWithProviders(<ProductCard product={product} />);
    expect(screen.getByText("20 L")).toBeDefined();
    expect(screen.queryByText("50 L")).toBeNull();
    expect(screen.getByText("+1 more")).toBeDefined();
  });

  it("opens WhatsApp with a message naming the product", () => {
    renderWithProviders(<ProductCard product={product} />);
    const href = screen.getByRole("link", { name: "Enquire about Royale Luxury Emulsion on WhatsApp" }).getAttribute("href") ?? "";
    expect(href.startsWith("https://wa.me/")).toBe(true);
    expect(decodeURIComponent(href)).toContain("Product: Asian Paints Royale Luxury Emulsion");
  });

  it("flags products that are out of stock", () => {
    renderWithProviders(<ProductCard product={{ ...product, inStock: false }} />);
    expect(screen.getByText("Out of stock")).toBeDefined();
  });
});
