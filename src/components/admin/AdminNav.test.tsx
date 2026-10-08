import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminNav, { isAdminLinkActive } from "@/components/admin/AdminNav";
import { ROUTES } from "@/lib/routes";
import { pathname } from "@/test/mocks/next-navigation";
import { renderWithProviders } from "@/test/render";

vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

describe("isAdminLinkActive", () => {
  it("marks the dashboard only on its own page", () => {
    expect(isAdminLinkActive(ROUTES.admin, ROUTES.admin)).toBe(true);
    expect(isAdminLinkActive(ROUTES.admin, ROUTES.adminProducts)).toBe(false);
  });

  it("marks Products on the list, new and edit pages", () => {
    for (const path of [ROUTES.adminProducts, ROUTES.adminNewProduct, ROUTES.adminProduct("tractor-emulsion")]) {
      expect(isAdminLinkActive(ROUTES.adminProducts, path)).toBe(true);
    }
  });
});

describe("AdminNav", () => {
  it("highlights the current section", () => {
    pathname.mockReturnValue(ROUTES.adminProduct("tractor-emulsion"));
    renderWithProviders(<AdminNav />);
    expect(screen.getByRole("link", { name: "Products" }).getAttribute("aria-current")).toBe("page");
    expect(screen.getByRole("link", { name: "Dashboard" }).getAttribute("aria-current")).toBeNull();
  });

  it("links to the password page", () => {
    pathname.mockReturnValue(ROUTES.adminPassword);
    renderWithProviders(<AdminNav />);
    expect(screen.getByRole("link", { name: "Password" }).getAttribute("aria-current")).toBe("page");
  });

  it("links to the enquiries page", () => {
    pathname.mockReturnValue(ROUTES.adminEnquiries);
    renderWithProviders(<AdminNav />);
    expect(screen.getByRole("link", { name: "Enquiries" }).getAttribute("aria-current")).toBe("page");
  });
});

