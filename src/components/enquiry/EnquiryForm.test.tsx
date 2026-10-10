import { screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import { setupTestDatabase } from "@/test/db";
import { renderWithProviders } from "@/test/render";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

setupTestDatabase();

const products = [{ id: "ap-royale-luxury", label: "Asian Paints Royale Luxury Emulsion" }];

function renderForm(initialProductId?: string) {
  return renderWithProviders(<EnquiryForm products={products} initialProductId={initialProductId} />);
}

describe("EnquiryForm", () => {
  it("pre-selects the product passed in", () => {
    renderForm("ap-royale-luxury");
    expect(screen.getByRole("button", { name: "Product: Asian Paints Royale Luxury Emulsion" })).toBeDefined();
  });

  it("shows linked validation errors when submitted empty", async () => {
    const { user } = renderForm();
    await user.click(screen.getByRole("button", { name: "Submit Enquiry" }));

    const name = screen.getByLabelText(/Your name/);
    expect(name.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(name.getAttribute("aria-describedby") ?? "")?.textContent).toBe(
      "Please enter your name.",
    );
  });

  it("drops letters and emojis typed into the mobile number", async () => {
    const { user } = renderForm();
    await user.type(screen.getByLabelText(/Mobile number/), "+91 98a765😀-43210");
    expect(screen.getByLabelText(/Mobile number/)).toHaveProperty("value", "+91 98765-43210");
  });

  it("rejects a name without letters", async () => {
    const { user } = renderForm();
    await user.type(screen.getByLabelText(/Your name/), "12");
    await user.tab();
    const name = screen.getByLabelText(/Your name/);
    expect(document.getElementById(name.getAttribute("aria-describedby") ?? "")?.textContent).toBe(
      "Use at least one letter.",
    );
  });

  it("submits directly to the database, resets the form, and displays success banner with optional WhatsApp link", async () => {
    const { user } = renderForm("ap-royale-luxury");
    await user.type(screen.getByLabelText(/Your name/), "Ramesh Patil");
    await user.type(screen.getByLabelText("Quantity"), "2 x 20 L");
    await user.click(screen.getByRole("button", { name: "Submit Enquiry" }));

    await waitFor(() => {
      expect(screen.getByRole("status").textContent).toContain("Enquiry Submitted Successfully!");
    });

    expect(screen.getByLabelText(/Your name/)).toHaveProperty("value", "");
    const waLink = screen.getByRole("link", { name: /Chat on WhatsApp/ });
    expect(waLink.getAttribute("href")).toContain("Product%3A%20Asian%20Paints%20Royale%20Luxury%20Emulsion");
    expect(waLink.getAttribute("href")).toContain("Quantity%3A%202%20x%2020%20L");
  });

  it("asks before clearing typed input", async () => {
    const { user } = renderForm();
    const clear = screen.getByRole("button", { name: "Clear" });
    expect(clear).toHaveProperty("disabled", true);

    await user.type(screen.getByLabelText(/Your name/), "Ramesh");
    await user.click(clear);
    await user.click(screen.getByRole("button", { name: "Clear form" }));
    expect(screen.getByLabelText(/Your name/)).toHaveProperty("value", "");
  });
});
