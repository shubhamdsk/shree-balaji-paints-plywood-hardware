import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import OfferCards from "@/components/offers/OfferCards";
import { renderWithProviders } from "@/test/render";

describe("OfferCards", () => {
  it("shows the dated offers first with their end date, then the standing offers", () => {
    renderWithProviders(
      <OfferCards
        datedOffers={[
          { id: "offer-1", title: "Diwali offer", body: "10% off", startsOn: "2026-10-20", endsOn: "2026-10-27", updatedAt: "" },
        ]}
      />,
    );

    const titles = screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles).toEqual(["Diwali offer", "Better rates on bulk orders", "Need help choosing colours?"]);
    expect(screen.getByText("Valid till 27 Oct 2026")).toBeDefined();
    const link = screen.getByRole("link", { name: "Ask About This Offer" });
    expect(decodeURIComponent(link.getAttribute("href") ?? "")).toContain("your offer: Diwali offer");
  });

  it("shows only the standing offers when nothing is dated", () => {
    renderWithProviders(<OfferCards />);
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
  });
});
