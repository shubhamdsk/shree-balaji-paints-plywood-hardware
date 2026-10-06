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
      <ProductCatalog products={products} categoryGroups={groups} category="paints" subtype="Exterior" />,
    );
    expect(screen.getByRole("heading", { name: "Apex Ultima" })).toBeTruthy();
    expect(screen.queryByRole("heading", { name: "Royale Emulsion" })).toBeNull();
  });

  it("opens clean category paths from the sidebar", async () => {
    const { user } = renderWithProviders(<ProductCatalog products={products} categoryGroups={groups} />);
    const sidebar = within(screen.getAllByRole("complementary")[0]);

    await user.click(sidebar.getByRole("button", { name: /^Interior/ }));
    expect(router.push).toHaveBeenLastCalledWith("/products/paints/interior", { scroll: false });

    await user.click(sidebar.getByRole("button", { name: /^All Paints/ }));
    expect(router.push).toHaveBeenLastCalledWith("/products/paints", { scroll: false });

    await user.click(sidebar.getByRole("button", { name: /^All Products/ }));
    expect(router.push).toHaveBeenLastCalledWith("/products", { scroll: false });
  });
});
