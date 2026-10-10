import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminCategoryList from "@/components/admin/AdminCategoryList";
import { renderWithProviders } from "@/test/render";
import type { AdminCategoryRecord } from "@/types";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const sampleCategories: AdminCategoryRecord[] = [
  {
    id: "paints",
    name: "Paints & Wall Care",
    slug: "paints",
    tagline: "Authorized Paints Dealer",
    description: "Interior & Exterior Paints",
    image: "/images/categories/paints.jpg",
    sortOrder: 1,
    isActive: true,
    productCount: 12,
    subcategories: [
      {
        id: "paints-interior-emulsion",
        categoryId: "paints",
        name: "Interior Emulsion",
        slug: "interior-emulsion",
        sortOrder: 1,
        isActive: true,
        productCount: 5,
      },
    ],
  },
];

describe("AdminCategoryList", () => {
  it("renders category metrics and categories list with product counts", () => {
    renderWithProviders(<AdminCategoryList categories={sampleCategories} />);
    expect(screen.getByText("Category Management")).toBeDefined();
    expect(screen.getByText("Paints & Wall Care")).toBeDefined();
    expect(screen.getByText("12 products")).toBeDefined();
    expect(screen.getByText("Interior Emulsion")).toBeDefined();
    expect(screen.getByText("5")).toBeDefined();
  });

  it("filters categories when searching", async () => {
    const { user } = renderWithProviders(<AdminCategoryList categories={sampleCategories} />);
    const search = screen.getByPlaceholderText(/Filter categories/);
    await user.type(search, "NonExistentName");
    expect(screen.getByText(/No categories found matching/)).toBeDefined();
  });

  it("opens add category modal on button click", async () => {
    const { user } = renderWithProviders(<AdminCategoryList categories={sampleCategories} />);
    const addBtn = screen.getByRole("button", { name: /Add Category/ });
    await user.click(addBtn);
    expect(screen.getByRole("heading", { name: "Add New Category" })).toBeDefined();
  });
});
