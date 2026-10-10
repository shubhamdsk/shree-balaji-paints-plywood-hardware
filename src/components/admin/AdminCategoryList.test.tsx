import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminCategoryList from "@/components/admin/AdminCategoryList";
import { categoryListItems, typeListItems } from "@/lib/category-list";
import { ROUTES } from "@/lib/routes";
import { SESSION_COOKIE } from "@/server/auth/session";
import { getAdminCategory, listAdminCategories } from "@/services/admin-category-service";
import { logIn } from "@/services/auth-service";
import { setupTestDatabase } from "@/test/db";
import { cookieJar } from "@/test/mocks/next-headers";
import { renderWithProviders } from "@/test/render";
import type { AdminCategoryRecord } from "@/types";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

setupTestDatabase();
let categories: AdminCategoryRecord[];

beforeEach(async () => {
  vi.stubEnv("ADMIN_USERNAME", "owner");
  vi.stubEnv("ADMIN_INITIAL_PASSWORD", "owner-password-123");
  const result = await logIn("owner", "owner-password-123");
  if (!result.ok) throw new Error("login failed");
  cookieJar.set(SESSION_COOKIE, { value: result.token });
  categories = await listAdminCategories();
});

describe("AdminCategoryList", () => {
  it("lists every category with its type and product counts and an edit link", () => {
    renderWithProviders(<AdminCategoryList kind="category" items={categoryListItems(categories)} />);
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(categories.length);
    const paints = categories.find((c) => c.id === "paints")!;
    expect(screen.getByRole("link", { name: "Edit Paints" }).getAttribute("href")).toBe(ROUTES.adminCategory("paints"));
    expect(screen.getAllByText(new RegExp(`^${paints.subcategories.length} types · `)).length).toBeGreaterThan(0);
  });

  it("finds a category by the name of one of its types", async () => {
    const { user } = renderWithProviders(<AdminCategoryList kind="category" items={categoryListItems(categories)} />);
    await user.type(screen.getByLabelText("Search categories"), "wall putty");
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual(["Paint Preparation Material"]);
    expect(screen.getByText(`1 of ${categories.length} categories`)).toBeDefined();
  });

  it("asks before hiding a category that has products, and hides it once confirmed", async () => {
    const { user } = renderWithProviders(<AdminCategoryList kind="category" items={categoryListItems(categories)} />);
    await user.click(screen.getByRole("switch", { name: "Laminates on the website" }));
    expect(screen.getByRole("dialog", { name: /^Hide Laminates and its 1 product\?$/ })).toBeDefined();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect((await getAdminCategory("laminates"))?.isActive).toBe(true);

    await user.click(screen.getByRole("switch", { name: "Laminates on the website" }));
    await user.click(screen.getByRole("button", { name: "Hide from website" }));
    await waitFor(async () => expect((await getAdminCategory("laminates"))?.isActive).toBe(false));
  });

  it("hides an empty type without asking", async () => {
    const paints = categories.find((c) => c.id === "paints")!;
    const empty = paints.subcategories.find((s) => s.productCount === 0)!;
    const { user } = renderWithProviders(<AdminCategoryList kind="type" items={typeListItems(paints.subcategories)} />);
    await user.click(screen.getByRole("switch", { name: `${empty.name} on the website` }));
    expect(screen.queryByRole("dialog")).toBeNull();
    await waitFor(async () =>
      expect((await getAdminCategory("paints"))?.subcategories.find((s) => s.id === empty.id)?.isActive).toBe(false),
    );
  });
});
