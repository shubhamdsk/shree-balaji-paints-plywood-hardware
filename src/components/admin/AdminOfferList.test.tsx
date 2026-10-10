import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import AdminOfferList from "@/components/admin/AdminOfferList";
import { ROUTES } from "@/lib/routes";
import { renderWithProviders } from "@/test/render";
import type { Offer } from "@/types";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const offer = (id: string, title: string, startsOn: string, endsOn: string): Offer => ({
  id,
  title,
  body: "Details",
  startsOn,
  endsOn,
  updatedAt: "2026-10-01T00:00:00.000Z",
});

const offers = [
  offer("offer-next", "Christmas offer", "2026-12-20", "2026-12-31"),
  offer("offer-now", "Diwali offer", "2026-10-05", "2026-10-15"),
  offer("offer-old", "Holi offer", "2026-03-01", "2026-03-10"),
];

describe("AdminOfferList", () => {
  it("marks each offer Starts soon, Live or Ended for today", () => {
    renderWithProviders(<AdminOfferList offers={offers} today="2026-10-10" />);
    const status = (title: string) => within(screen.getByRole("heading", { name: title }).parentElement!).getByText(/Live|Ended|Starts soon/);
    expect(status("Christmas offer").textContent).toBe("Starts soon");
    expect(status("Diwali offer").textContent).toBe("Live");
    expect(status("Holi offer").textContent).toBe("Ended");
  });

  it("links to edit and copy each offer", () => {
    renderWithProviders(<AdminOfferList offers={offers} today="2026-10-10" />);
    expect(screen.getByRole("link", { name: "Copy Holi offer" }).getAttribute("href")).toBe(ROUTES.adminCopyOffer("offer-old"));
    expect(screen.getByRole("link", { name: "Edit Holi offer" }).getAttribute("href")).toBe(ROUTES.adminOffer("offer-old"));
  });

  it("asks before deleting and keeps the offer when cancelled", async () => {
    const { user } = renderWithProviders(<AdminOfferList offers={offers} today="2026-10-10" />);
    await user.click(screen.getByRole("button", { name: "Delete Holi offer" }));

    const dialog = screen.getByRole("dialog", { name: 'Delete "Holi offer"?' });
    await user.click(within(dialog).getByRole("button", { name: "Cancel" }));
    expect(screen.getByRole("heading", { name: "Holi offer" })).toBeDefined();
  });

  it("explains what to do when there are no offers", () => {
    renderWithProviders(<AdminOfferList offers={[]} today="2026-10-10" />);
    expect(screen.getByText(/No offers yet/)).toBeDefined();
  });
});
