import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProductForm from "@/components/admin/ProductForm";
import { ROUTES } from "@/lib/routes";
import { linkNavigated } from "@/test/mocks/next-link";
import { renderWithProviders } from "@/test/render";
import type { AdminProduct, CategoryGroup } from "@/types";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const groups = [
  { id: "paints", name: "Paints", subtypes: ["Interior", "Exterior"] },
  { id: "plywood", name: "Plywood", subtypes: ["Marine"] },
] as CategoryGroup[];

const product: AdminProduct = {
  id: "weatherbond-advance",
  name: "Weatherbond Advance",
  brand: "Nippon Paint",
  category: "paints",
  type: "Exterior Emulsion",
  description: "",
  sizes: ["1 L", "4 L"],
  priceFrom: 295,
  unit: "per litre",
  colors: [],
  inStock: true,
  featured: false,
  needsCategory: false,
  isVisible: true,
  updatedAt: "2026-10-07T10:00:00.000Z",
};

beforeEach(() => linkNavigated.mockClear());

function description(field: HTMLElement) {
  const ids = field.getAttribute("aria-describedby")?.split(" ") ?? [];
  return ids.map((id) => document.getElementById(id)?.textContent).join(" ");
}

describe("ProductForm", () => {
  it("shows every error next to its field when saved empty", async () => {
    const { user } = renderWithProviders(<ProductForm categoryGroups={groups} />);
    await user.click(screen.getByRole("button", { name: "Save product" }));

    const fields = {
      "Enter the product name": screen.getByLabelText(/Product name/),
      "Enter the brand": screen.getByLabelText(/Brand/),
      "Choose a category": screen.getByRole("button", { name: "Category: Choose a category" }),
      "Choose a type": screen.getByRole("button", { name: "Type: Choose a category first" }),
      "Choose a price unit": screen.getByRole("button", { name: "Price unit: Choose a price unit" }),
      "Choose at least one size": screen.getByRole("button", { name: "Sizes: Choose a price unit first" }),
    };
    for (const [message, field] of Object.entries(fields)) expect(description(field)).toBe(message);
    expect(screen.getByLabelText(/Product name/).getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByRole("alert").textContent).toBe("Fix the 6 highlighted fields to continue.");
    expect(document.activeElement).toBe(screen.getByLabelText(/Product name/));
  });

  it("offers the sizes of the chosen price unit and lets several be ticked", async () => {
    const { user } = renderWithProviders(<ProductForm categoryGroups={groups} />);
    expect(screen.getByRole("button", { name: "Sizes: Choose a price unit first" })).toHaveProperty("disabled", true);

    await user.click(screen.getByRole("button", { name: "Price unit: Choose a price unit" }));
    await user.click(screen.getByRole("option", { name: "Kilogram (kg)" }));
    await user.click(screen.getByRole("button", { name: "Sizes: Choose sizes" }));
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toContain("20 kg");
    expect(screen.queryByRole("option", { name: "4 L" })).toBeNull();

    await user.click(screen.getByRole("option", { name: "20 kg" }));
    await user.click(screen.getByRole("option", { name: "5 kg" }));
    await user.click(screen.getByRole("button", { name: "Done" }));
    expect(screen.getByRole("button", { name: "Sizes: 5 kg, 20 kg" })).toBeDefined();
  });

  it("drops sizes that don't fit a newly chosen unit", async () => {
    const { user } = renderWithProviders(<ProductForm product={product} categoryGroups={groups} />);
    await user.click(screen.getByRole("button", { name: "Price unit: Litre (L)" }));
    await user.click(screen.getByRole("option", { name: "Kilogram (kg)" }));
    expect(screen.getByRole("button", { name: "Sizes: Choose sizes" })).toBeDefined();
  });

  it("keeps only digits as the price is typed", async () => {
    const { user } = renderWithProviders(<ProductForm categoryGroups={groups} />);
    await user.type(screen.getByLabelText(/Starting price/), "₹5,2a😀0");
    expect(screen.getByLabelText(/Starting price/)).toHaveProperty("value", "520");
  });

  it("checks the name as soon as the field is left", async () => {
    const { user } = renderWithProviders(<ProductForm categoryGroups={groups} />);
    await user.type(screen.getByLabelText(/Product name/), "Royale 🎨");
    await user.tab();
    expect(description(screen.getByLabelText(/Product name/))).toBe("Emojis aren't allowed here");
  });

  it("offers only the types of the chosen category and clears a type that no longer fits", async () => {
    const { user } = renderWithProviders(<ProductForm product={product} categoryGroups={groups} />);
    await user.click(screen.getByRole("button", { name: "Category: Paints" }));
    await user.click(screen.getByRole("option", { name: "Plywood" }));

    const type = screen.getByRole("button", { name: "Type: Choose a type" });
    await user.click(type);
    expect(screen.getAllByRole("option").map((o) => o.textContent)).toEqual(["Choose a type", "Marine"]);
  });

  it("fills in the saved product when editing", () => {
    renderWithProviders(<ProductForm product={product} categoryGroups={groups} />);
    expect(screen.getByLabelText(/Product name/)).toHaveProperty("value", "Weatherbond Advance");
    expect(screen.getByRole("button", { name: "Sizes: 1 L, 4 L" })).toBeDefined();
    expect(screen.getByRole("button", { name: "Price unit: Litre (L)" })).toBeDefined();
    expect(screen.getByText('Shows as "From ₹295 per litre"')).toBeDefined();
    expect(screen.getByLabelText(/Starting price/)).toHaveProperty("value", "295");
    expect(screen.getByLabelText("In stock")).toHaveProperty("checked", true);
    expect(screen.getByLabelText("Show on the home page").getAttribute("aria-describedby")).toBe("featured-hint");
  });

  it("rejects a file that is not a photo before uploading", async () => {
    renderWithProviders(<ProductForm categoryGroups={groups} />);
    const input = screen.getByLabelText("Photo");
    fireEvent.change(input, { target: { files: [new File(["%PDF"], "bill.pdf", { type: "application/pdf" })] } });
    await waitFor(() => expect(description(input)).toBe("Choose a JPEG, PNG or WebP photo."));
  });

  it("leaves without asking when nothing changed", async () => {
    const { user } = renderWithProviders(<ProductForm product={product} categoryGroups={groups} />);
    await user.click(screen.getByRole("link", { name: "Cancel" }));
    expect(linkNavigated).toHaveBeenCalledWith(ROUTES.adminProducts);
  });

  it("asks before discarding changes", async () => {
    const { user } = renderWithProviders(<ProductForm product={product} categoryGroups={groups} />);
    await user.type(screen.getByLabelText(/Brand/), " India");
    await user.click(screen.getByRole("link", { name: "Cancel" }));

    expect(screen.getByRole("dialog", { name: "Discard unsaved changes?" })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Keep editing" }));
    expect(linkNavigated).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Brand/)).toHaveProperty("value", "Nippon Paint India");
  });
});
