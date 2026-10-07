import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import PaintCalculator from "@/components/calculator/PaintCalculator";
import { renderWithProviders } from "@/test/render";

const products = [
  { id: "ap-royale-luxury", label: "Asian Paints Royale Luxury Emulsion", type: "Interior", sizes: ["1 L", "4 L", "10 L", "20 L"] },
];

function renderCalculator(initialProductId = "ap-royale-luxury") {
  return renderWithProviders(<PaintCalculator products={products} initialProductId={initialProductId} />);
}

async function fillRoom(user: ReturnType<typeof renderCalculator>["user"]) {
  await user.type(screen.getByLabelText("Length (ft)"), "12");
  await user.type(screen.getByLabelText("Width (ft)"), "10");
  await user.clear(screen.getByLabelText("Windows"));
  await user.type(screen.getByLabelText("Windows"), "2");
  await user.click(screen.getByRole("button", { name: "Calculate" }));
}

describe("PaintCalculator", () => {
  it("pre-selects the paint passed in", () => {
    renderCalculator();
    expect(screen.getByRole("combobox", { name: /Paint/ })).toHaveProperty("value", "ap-royale-luxury");
  });

  it("shows linked errors and no estimate when sizes are missing", async () => {
    const { user } = renderCalculator("");
    await user.click(screen.getByRole("button", { name: "Calculate" }));

    const length = screen.getByLabelText("Length (ft)");
    expect(length.getAttribute("aria-invalid")).toBe("true");
    expect(document.getElementById(length.getAttribute("aria-describedby") ?? "")?.textContent).toBe(
      "Enter a size greater than 0.",
    );
    expect(screen.getByText("Choose a paint.")).toBeDefined();
    expect(screen.queryByRole("heading", { name: /You need about/ })).toBeNull();
  });

  it("shows the litres and packs, and hides the estimate when an input changes", async () => {
    const { user } = renderCalculator();
    await fillRoom(user);

    expect(screen.getByRole("heading", { name: "You need about 8 L of Asian Paints Royale Luxury Emulsion" })).toBeDefined();
    expect(screen.getByText("About 395 sq ft")).toBeDefined();
    expect(screen.getByText("2 × 4 L")).toBeDefined();

    await user.type(screen.getByLabelText("Length (ft)"), "0");
    expect(screen.queryByRole("heading", { name: /You need about/ })).toBeNull();
  });

  it("converts metres when the unit changes", async () => {
    const { user } = renderCalculator();
    await user.selectOptions(screen.getByLabelText("Measure in"), "m");
    expect(screen.getByLabelText("Length (m)")).toBeDefined();
  });

  it("confirms before opening WhatsApp with the estimate", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const { user } = renderCalculator();
    await fillRoom(user);
    await user.click(screen.getByRole("button", { name: "Send estimate on WhatsApp" }));

    expect(screen.getByRole("dialog", { name: "Send this estimate on WhatsApp?" })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Open WhatsApp" }));

    const url = new URL(String(open.mock.calls[0][0]));
    expect(url.hostname).toBe("wa.me");
    expect(url.searchParams.get("text")).toContain("Estimate: about 8 L (2 × 4 L)");
  });

  it("does not open WhatsApp when the confirmation is cancelled", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    const { user } = renderCalculator();
    await fillRoom(user);
    await user.click(screen.getByRole("button", { name: "Send estimate on WhatsApp" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(open).not.toHaveBeenCalled();
  });

  it("asks before clearing the entered sizes", async () => {
    const { user } = renderCalculator();
    expect(screen.getByRole("button", { name: "Clear" })).toHaveProperty("disabled", true);

    await user.type(screen.getByLabelText("Length (ft)"), "12");
    await user.click(screen.getByRole("button", { name: "Clear" }));
    await user.click(screen.getByRole("button", { name: "Clear sizes" }));
    expect(screen.getByLabelText("Length (ft)")).toHaveProperty("value", "");
  });
});
