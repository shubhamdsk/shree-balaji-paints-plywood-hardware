import { screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProductCatalog from "@/components/products/ProductCatalog";
import { router } from "@/test/mocks/next-navigation";
import { renderWithProviders } from "@/test/render";
import type { CategoryGroup, Product } from "@/types";

vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

function product(id: string, name: string, type: string): Product {
  return {
    id,
    name,
    brand: "Asian Paints",
    category: "paints",
    type,
    description: "",
    sizes: [],
    priceFrom: 100,
    unit: "L",
    colors: [],
    inStock: true,
  };
}

const products = [product("royale", "Royale Emulsion", "Interior"), product("apex", "Apex Ultima", "Exterior")];
const groups: CategoryGroup[] = [{ id: "paints", name: "Paints", subtypes: ["Interior", "Exterior"] }];

afterEach(() => router.push.mockClear());

describe("ProductCatalog", () => {
  it("shows only the products of the given category type", () => {
    renderWithProviders(
      <ProductCatalog products={products} index={products} categoryGroups={groups} category="paints" subtype="Exterior" />,
    );
    expect(screen.getByRole("heading", { name: "Apex Ultima" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Royale Emulsion" })).toBeNull();
  });

  it("opens clean category paths from the sidebar", async () => {
    const { user } = renderWithProviders(<ProductCatalog products={products} index={products} categoryGroups={groups} />);
    const sidebar = within(screen.getAllByRole("complementary")[0]);
    expect(sidebar.queryByRole("button", { name: /^Interior/ })).toBeNull();

    await user.click(sidebar.getByRole("button", { name: /^Paints/ }));
    await user.click(sidebar.getByRole("button", { name: /^Interior/ }));
    expect(router.push).toHaveBeenLastCalledWith("/products/paints/interior", { scroll: false });

    await user.click(sidebar.getByRole("button", { name: /^All Paints/ }));
    expect(router.push).toHaveBeenLastCalledWith("/products/paints", { scroll: false });

    await user.click(sidebar.getByRole("button", { name: /^All Products/ }));
    expect(router.push).toHaveBeenLastCalledWith("/products", { scroll: false });
  });

  it("hides categories that have no products", () => {
    const withEmpty = [...groups, { id: "hardware", name: "Hardware", subtypes: ["Locks"] }];
    renderWithProviders(<ProductCatalog products={products} index={products} categoryGroups={withEmpty} />);
    const sidebar = within(screen.getAllByRole("complementary")[0]);
    expect(sidebar.queryByRole("button", { name: /^Hardware/ })).toBeNull();
  });

  it("counts the products shown and loads more on request", async () => {
    const many = Array.from({ length: 14 }, (_, i) => product(`p${i}`, `Paint ${String(i).padStart(2, "0")}`, "Interior"));
    const { user } = renderWithProviders(<ProductCatalog products={many} index={many} categoryGroups={groups} />);
    expect(screen.getByText("14 products")).toBeDefined();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(12);

    await user.click(screen.getByRole("button", { name: "Show more products" }));
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(14);
    expect(screen.queryByRole("button", { name: "Show more products" })).toBeNull();
  });
});
