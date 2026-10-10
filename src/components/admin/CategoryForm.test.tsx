import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import CategoryForm from "@/components/admin/CategoryForm";
import { ROUTES } from "@/lib/routes";
import { linkNavigated } from "@/test/mocks/next-link";
import { renderWithProviders } from "@/test/render";
import type { AdminSubcategoryRecord } from "@/types";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const type: AdminSubcategoryRecord = {
  id: "paints-wood-paint",
  categoryId: "paints",
  name: "Wood Paint",
  slug: "paints-wood-paint",
  seoTitle: "Wood paints in Kotul",
  sortOrder: 4,
  isActive: true,
  productCount: 0,
};

beforeEach(() => linkNavigated.mockClear());

function description(field: HTMLElement) {
  const ids = field.getAttribute("aria-describedby")?.split(" ") ?? [];
  return ids.map((id) => document.getElementById(id)?.textContent).join(" ");
}

describe("CategoryForm", () => {
  it("starts a new category at the next position and shows errors next to their fields", async () => {
    const { user } = renderWithProviders(
      <CategoryForm kind="category" cancelHref={ROUTES.adminCategories} defaultSortOrder={11} />,
    );
    expect(screen.getByLabelText(/Position/)).toHaveProperty("value", "11");
    await user.clear(screen.getByLabelText(/Position/));
    await user.type(screen.getByLabelText(/Search title/), "Glass 🪟");
    await user.click(screen.getByRole("button", { name: "Save category" }));

    expect(description(screen.getByLabelText(/Category name/))).toBe("Enter the name");
    expect(description(screen.getByLabelText(/Position/))).toBe("Enter a whole number from 0 to 9999");
    expect(description(screen.getByLabelText(/Search title/))).toBe("Emojis aren't allowed here");
  });

  it("keeps only digits in the position and stops long text at the limit", async () => {
    const { user } = renderWithProviders(
      <CategoryForm kind="category" cancelHref={ROUTES.adminCategories} defaultSortOrder={11} />,
    );
    await user.clear(screen.getByLabelText(/Position/));
    await user.type(screen.getByLabelText(/Position/), "-1a2.5");
    expect(screen.getByLabelText(/Position/)).toHaveProperty("value", "125");
    await user.type(screen.getByLabelText(/Search title/), "x".repeat(75));
    expect(screen.getByLabelText(/Search title/)).toHaveProperty("value", "x".repeat(70));
  });

  it("fills in a saved type without the category-only tagline", () => {
    renderWithProviders(
      <CategoryForm kind="type" categoryId="paints" record={type} cancelHref={ROUTES.adminCategory("paints")} defaultSortOrder={4} />,
    );
    expect(screen.getByLabelText(/Type name/)).toHaveProperty("value", "Wood Paint");
    expect(screen.getByLabelText(/Search title/)).toHaveProperty("value", "Wood paints in Kotul");
    expect(screen.queryByLabelText(/Tagline/)).toBeNull();
    expect(screen.getByRole("button", { name: "Save type" })).toBeDefined();
  });

  it("asks before discarding changes", async () => {
    const { user } = renderWithProviders(
      <CategoryForm kind="type" categoryId="paints" record={type} cancelHref={ROUTES.adminCategory("paints")} defaultSortOrder={4} />,
    );
    await user.type(screen.getByLabelText(/Type name/), "s");
    await user.click(screen.getByRole("link", { name: "Cancel" }));
    expect(screen.getByRole("dialog", { name: "Discard unsaved changes?" })).toBeDefined();
  });
});
