import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import EnquiryForm from "@/components/enquiry/EnquiryForm";
import { renderWithProviders } from "@/test/render";

const products = [{ id: "ap-royale-luxury", label: "Asian Paints Royale Luxury Emulsion" }];

function renderForm(initialProductId?: string) {
  return renderWithProviders(<EnquiryForm products={products} initialProductId={initialProductId} />);
}

describe("EnquiryForm", () => {
  it("pre-selects the product passed in", () => {
    renderForm("ap-royale-luxury");
    expect(screen.getByRole("button", { name: "Product: Asian Paints Royale Luxury Emulsion" })).toBeDefined();
  });

  it("shows linked validation errors and does not open WhatsApp", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const { user } = renderForm();
    await user.click(screen.getByRole("button", { name: "Send on WhatsApp" }));

    const name = screen.getByLabelText(/Your name/);
    expect(name.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(name.getAttribute("aria-describedby") ?? "")?.textContent).toBe(
      "Please enter your name.",
    );
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(open).not.toHaveBeenCalled();
  });

  it("confirms, opens WhatsApp with the message, and resets the form", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const { user } = renderForm("ap-royale-luxury");
    await user.type(screen.getByLabelText(/Your name/), "Ramesh Patil");
    await user.type(screen.getByLabelText("Quantity"), "2 x 20 L");
    await user.click(screen.getByRole("button", { name: "Send on WhatsApp" }));

    expect(screen.getByRole("dialog", { name: "Send this enquiry on WhatsApp?" })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Open WhatsApp" }));

    const url = new URL(String(open.mock.calls[0][0]));
    expect(url.hostname).toBe("wa.me");
    expect(url.searchParams.get("text")).toContain("Product: Asian Paints Royale Luxury Emulsion");
    expect(url.searchParams.get("text")).toContain("Quantity: 2 x 20 L");
    expect(screen.getByLabelText(/Your name/)).toHaveProperty("value", "");
    expect(screen.getByRole("status").textContent).toContain("Enquiry ready in WhatsApp");
  });

  it("does not send when the user cancels the confirmation", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const { user } = renderForm("ap-royale-luxury");
    await user.type(screen.getByLabelText(/Your name/), "Ramesh Patil");
    await user.click(screen.getByRole("button", { name: "Send on WhatsApp" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(open).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Your name/)).toHaveProperty("value", "Ramesh Patil");
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
