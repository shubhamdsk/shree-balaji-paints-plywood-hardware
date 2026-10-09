import { describe, expect, it, vi } from "vitest";
import { saveCategoryAction, saveSubcategoryAction, toggleCategoryActiveAction, toggleSubcategoryActiveAction } from "@/server/actions/categories";
import { SESSION_COOKIE } from "@/server/auth/session";
import { logIn } from "@/services/auth-service";
import { setupTestDatabase } from "@/test/db";
import { cookieJar } from "@/test/mocks/next-headers";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

setupTestDatabase();

async function logInAsOwner() {
  vi.stubEnv("ADMIN_USERNAME", "owner");
  vi.stubEnv("ADMIN_INITIAL_PASSWORD", "initial-owner-password");
  const result = await logIn("owner", "initial-owner-password");
  if (!result.ok) throw new Error("login failed");
  cookieJar.set(SESSION_COOKIE, { value: result.token });
}

describe("category server actions", () => {
  it("saveCategoryAction creates a new category when authenticated", async () => {
    await logInAsOwner();
    const res = await saveCategoryAction(null, {
      name: "Plumbing Fittings",
      slug: "plumbing-fittings",
      tagline: "Pipes and Valves",
    });
    expect(res.ok).toBe(true);
  });

  it("toggleCategoryActiveAction updates status when authenticated", async () => {
    await logInAsOwner();
    const res = await toggleCategoryActiveAction("paints", false);
    expect(res.ok).toBe(true);
  });

  it("saveSubcategoryAction creates a subcategory when authenticated", async () => {
    await logInAsOwner();
    const res = await saveSubcategoryAction(null, {
      categoryId: "paints",
      name: "Enamel Paints",
      slug: "enamel-paints",
    });
    expect(res.ok).toBe(true);
  });

  it("toggleSubcategoryActiveAction updates subcategory status when authenticated", async () => {
    await logInAsOwner();
    const res = await toggleSubcategoryActiveAction("paints-interior-emulsion", false);
    expect(res.ok).toBe(true);
  });
});
