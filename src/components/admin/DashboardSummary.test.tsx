import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DashboardSummary from "@/components/admin/DashboardSummary";
import { ROUTES } from "@/lib/routes";
import { renderWithProviders } from "@/test/render";

vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

describe("DashboardSummary", () => {
  it("links each count to the page where the owner acts on it", () => {
    renderWithProviders(<DashboardSummary newEnquiries={3} outOfStock={2} liveOffers={1} />);
    expect(screen.getByRole("link", { name: /New enquiries\s*3/ }).getAttribute("href")).toBe(ROUTES.adminEnquiries);
    expect(screen.getByRole("link", { name: /Out of stock\s*2/ }).getAttribute("href")).toBe(ROUTES.adminProducts);
    expect(screen.getByRole("link", { name: /Offers running today\s*1/ }).getAttribute("href")).toBe(ROUTES.adminOffers);
  });

  it("says when there is nothing to do", () => {
    renderWithProviders(<DashboardSummary newEnquiries={0} outOfStock={0} liveOffers={0} />);
    expect(screen.getByText("All caught up")).toBeDefined();
    expect(screen.getByText("Everything is in stock")).toBeDefined();
  });
});
