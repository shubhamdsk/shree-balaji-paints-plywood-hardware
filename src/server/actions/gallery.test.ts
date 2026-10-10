import { describe, expect, it, vi } from "vitest";
import { deleteGalleryItemAction, toggleGalleryActiveAction } from "@/server/actions/gallery";
import { SESSION_COOKIE } from "@/server/auth/session";
import { createGalleryItem } from "@/services/gallery-service";
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
  return result.user;
}

describe("gallery server actions", () => {
  it("toggleGalleryActiveAction updates item status when authenticated", async () => {
    const ownerUser = await logInAsOwner();
    const item = await createGalleryItem(
      ownerUser,
      { title: "Sample Painting", category: "Painting" },
      "/images/sample.jpg",
    );
    const res = await toggleGalleryActiveAction(item.id, false);
    expect(res.ok).toBe(true);
  });

  it("deleteGalleryItemAction removes item when authenticated", async () => {
    const ownerUser = await logInAsOwner();
    const item = await createGalleryItem(
      ownerUser,
      { title: "Sample Furniture", category: "Plywood" },
      "/images/sample.jpg",
    );
    const res = await deleteGalleryItemAction(item.id);
    expect(res.ok).toBe(true);
  });
});
