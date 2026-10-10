import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import StockAlertList from "@/components/admin/StockAlertList";
import { SESSION_COOKIE } from "@/server/auth/session";
import { getAdminProduct, listAdminProducts } from "@/services/admin-product-service";
import { logIn } from "@/services/auth-service";
import { setupTestDatabase } from "@/test/db";
import { cookieJar } from "@/test/mocks/next-headers";
import { renderWithProviders } from "@/test/render";
import type { AdminProduct } from "@/types";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

setupTestDatabase();
let outOfStock: AdminProduct[];

beforeEach(async () => {
  vi.stubEnv("ADMIN_USERNAME", "owner");
  vi.stubEnv("ADMIN_INITIAL_PASSWORD", "owner-password-123");
  const result = await logIn("owner", "owner-password-123");
  if (!result.ok) throw new Error("login failed");
  cookieJar.set(SESSION_COOKIE, { value: result.token });
  outOfStock = (await listAdminProducts()).filter((p) => !p.inStock);
});

describe("StockAlertList", () => {
  it("shows nothing when every product is in stock", () => {
    renderWithProviders(<StockAlertList outOfStockProducts={[]} />);
    expect(screen.queryByRole("heading", { name: /Out of stock/ })).toBeNull();
  });

  it("names each product with its brand and type", () => {
    const [product] = outOfStock;
    renderWithProviders(<StockAlertList outOfStockProducts={outOfStock} />);
    expect(screen.getByRole("heading", { name: `Out of stock (${outOfStock.length})` })).toBeDefined();
    expect(screen.getByText(`${product.brand} · ${product.type}`)).toBeDefined();
  });

  it("marks a product in stock", async () => {
    const [product] = outOfStock;
    const { user } = renderWithProviders(<StockAlertList outOfStockProducts={outOfStock} />);
    await user.click(screen.getByRole("button", { name: `Mark ${product.name} in stock` }));
    await waitFor(async () => expect((await getAdminProduct(product.id))?.inStock).toBe(true));
  });
});
