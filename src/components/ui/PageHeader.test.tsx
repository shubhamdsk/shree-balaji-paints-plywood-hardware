import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PageHeader from "@/components/ui/PageHeader";
import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

describe("PageHeader", () => {
  it("renders the title as the page heading with a Home breadcrumb", () => {
    renderWithProviders(<PageHeader title="Offers" description="Deals" />);
    expect(screen.getByRole("heading", { level: 1, name: "Offers" })).toBeTruthy();
    const crumbs = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(crumbs.getByRole("link", { name: "Home" }).getAttribute("href")).toBe("/");
  });

  it("adds parent pages between Home and the title", () => {
    renderWithProviders(
      <PageHeader
        title="Interior"
        description=""
        parents={[
          { label: "Products", href: "/products" },
          { label: "Paints", href: "/products/paints" },
        ]}
      />,
    );
    const crumbs = within(screen.getByRole("navigation", { name: "Breadcrumb" }));
    expect(crumbs.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
      "Home",
      "Products",
      "Paints",
      "Interior",
    ]);
    expect(crumbs.getByRole("link", { name: "Paints" }).getAttribute("href")).toBe("/products/paints");
  });
});
