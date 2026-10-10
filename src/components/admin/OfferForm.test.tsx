import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import OfferForm from "@/components/admin/OfferForm";
import { ROUTES } from "@/lib/routes";
import { linkNavigated } from "@/test/mocks/next-link";
import { renderWithProviders } from "@/test/render";
import type { Offer } from "@/types";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const offer: Offer = {
  id: "offer-1",
  title: "Diwali offer",
  body: "10% off on Royale",
  startsOn: "2026-10-20",
  endsOn: "2026-10-27",
  updatedAt: "2026-10-10T10:00:00.000Z",
};

beforeEach(() => linkNavigated.mockClear());

function description(field: HTMLElement) {
  const ids = field.getAttribute("aria-describedby")?.split(" ") ?? [];
  return ids.map((id) => document.getElementById(id)?.textContent).join(" ");
}

describe("OfferForm", () => {
  it("shows every error next to its field when saved empty", async () => {
    const { user } = renderWithProviders(<OfferForm />);
    await user.click(screen.getByRole("button", { name: "Save offer" }));

    expect(description(screen.getByLabelText(/Offer title/))).toBe("Enter the offer title");
    expect(description(screen.getByLabelText(/Offer details/))).toBe("Describe the offer");
    expect(description(screen.getByLabelText(/Start date/))).toBe("Choose the start date");
    expect(description(screen.getByLabelText(/End date/))).toBe("Choose the end date");
  });

  it("fills in the saved offer when editing", () => {
    renderWithProviders(<OfferForm offer={offer} />);
    expect(screen.getByLabelText(/Offer title/)).toHaveProperty("value", "Diwali offer");
    expect(screen.getByLabelText(/Start date/)).toHaveProperty("value", "2026-10-20");
    expect(screen.getByLabelText(/End date/)).toHaveProperty("value", "2026-10-27");
  });

  it("copies the text but asks for new dates", () => {
    renderWithProviders(<OfferForm copyFrom={offer} />);
    expect(screen.getByLabelText(/Offer details/)).toHaveProperty("value", "10% off on Royale");
    expect(screen.getByLabelText(/Start date/)).toHaveProperty("value", "");
  });

  it("rejects a file that is not a photo", async () => {
    renderWithProviders(<OfferForm />);
    const input = screen.getByLabelText("Photo");
    fireEvent.change(input, { target: { files: [new File(["%PDF"], "bill.pdf", { type: "application/pdf" })] } });
    await waitFor(() => expect(description(input)).toBe("Choose a JPEG, PNG or WebP photo."));
  });

  it("asks before discarding changes", async () => {
    const { user } = renderWithProviders(<OfferForm offer={offer} />);
    await user.type(screen.getByLabelText(/Offer title/), "!");
    await user.click(screen.getByRole("link", { name: "Cancel" }));

    expect(screen.getByRole("dialog", { name: "Discard unsaved changes?" })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(linkNavigated).not.toHaveBeenCalled();
  });

  it("leaves without asking when nothing changed", async () => {
    const { user } = renderWithProviders(<OfferForm offer={offer} />);
    await user.click(screen.getByRole("link", { name: "Cancel" }));
    expect(linkNavigated).toHaveBeenCalledWith(ROUTES.adminOffers);
  });
});
