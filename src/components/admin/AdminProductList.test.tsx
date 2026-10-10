import { eq } from "drizzle-orm";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminProductList from "@/components/admin/AdminProductList";
import { SESSION_COOKIE } from "@/server/auth/session";
import { auditLog } from "@/server/db/schema";
import { getAdminProduct, listAdminProducts } from "@/services/admin-product-service";
import { logIn } from "@/services/auth-service";
import { setupTestDatabase } from "@/test/db";
import { cookieJar } from "@/test/mocks/next-headers";
import { renderWithProviders } from "@/test/render";
import type { AdminProduct } from "@/types";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

const db = setupTestDatabase();
let products: AdminProduct[];

beforeEach(async () => {
  vi.stubEnv("ADMIN_USERNAME", "owner");
  vi.stubEnv("ADMIN_INITIAL_PASSWORD", "owner-password-123");
  const result = await logIn("owner", "owner-password-123");
  if (!result.ok) throw new Error("login failed");
  cookieJar.set(SESSION_COOKIE, { value: result.token });
  products = await listAdminProducts();
});

describe("AdminProductList", () => {
  it("searches by name, brand or type", async () => {
    const { user } = renderWithProviders(<AdminProductList products={products} />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(products.length);

    await user.type(screen.getByLabelText("Search products"), "tractor");
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Tractor Emulsion"]);

    await user.clear(screen.getByLabelText("Search products"));
    await user.type(screen.getByLabelText("Search products"), "no such thing");
    expect(screen.getByText("No products match.")).toBeDefined();
  });

  it("filters to products that are out of stock", async () => {
    const { user } = renderWithProviders(<AdminProductList products={products} />);
    const outOfStockCount = products.filter((p) => !p.inStock).length;
    await user.click(screen.getByRole("button", { name: `Out of stock ${outOfStockCount}` }));

    const outOfStock = products.filter((p) => !p.inStock).map((p) => p.name);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(outOfStock);
  });

  it("marks a product out of stock with one tap", async () => {
    const product = products.find((p) => p.inStock)!;
    const { user } = renderWithProviders(<AdminProductList products={products} />);
    const stock = screen.getByRole("switch", { name: `${product.name} in stock` });
    expect(stock.getAttribute("aria-checked")).toBe("true");

    await user.click(stock);
    expect(stock.getAttribute("aria-checked")).toBe("false");
    await waitFor(async () => expect((await getAdminProduct(product.id))?.inStock).toBe(false));
  });

  it("ignores repeat clicks while a product update is pending", async () => {
    const product = products.find((p) => p.inStock)!;
    renderWithProviders(<AdminProductList products={products} />);
    const stock = screen.getByRole("switch", { name: `${product.name} in stock` });

    fireEvent.click(stock);
    fireEvent.click(stock);

    await waitFor(async () => expect((await getAdminProduct(product.id))?.inStock).toBe(false));
    const entries = await db().select().from(auditLog).where(eq(auditLog.entityId, product.id));
    expect(entries.filter((entry) => entry.action === "product_stock")).toHaveLength(1);
  });

  it("asks before hiding a product and keeps it when cancelled", async () => {
    const [product] = products;
    const { user } = renderWithProviders(<AdminProductList products={products} />);
    await user.click(screen.getByRole("button", { name: `Hide ${product.name}` }));

    expect(screen.getByRole("dialog", { name: `Hide ${product.name}?` })).toBeDefined();
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect((await getAdminProduct(product.id))?.isVisible).toBe(true);
  });

  it("hides the product once confirmed", async () => {
    const [product] = products;
    const { user } = renderWithProviders(<AdminProductList products={products} />);
    await user.click(screen.getByRole("button", { name: `Hide ${product.name}` }));
    await user.click(screen.getByRole("button", { name: "Hide product" }));

    await waitFor(async () => expect((await getAdminProduct(product.id))?.isVisible).toBe(false));
  });

  it("shows a hidden product again without asking", async () => {
    const hidden = { ...products[0], isVisible: false };
    const { user } = renderWithProviders(<AdminProductList products={[hidden, ...products.slice(1)]} />);
    expect(screen.getByText("Hidden from the website")).toBeDefined();

    await user.click(screen.getByRole("button", { name: `Show ${hidden.name}` }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("offers the needs-a-category filter only when a product needs one", () => {
    renderWithProviders(<AdminProductList products={products} />);
    expect(screen.queryByRole("button", { name: /^Needs a category/ })).toBeNull();
  });

  it("flags and filters products whose type was removed", async () => {
    const orphan = { ...products[0], needsCategory: true };
    const { user } = renderWithProviders(<AdminProductList products={[orphan, ...products.slice(1)]} />);
    expect(screen.getByText("Needs a category — not on the website")).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Needs a category 1" }));
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([orphan.name]);
  });
});
