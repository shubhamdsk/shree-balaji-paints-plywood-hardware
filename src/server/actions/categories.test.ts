import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { updateTag } from "next/cache";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { ROUTES } from "@/lib/routes";
import {
  saveCategoryAction,
  saveSubcategoryAction,
  setCategoryActiveAction,
  setSubcategoryActiveAction,
} from "@/server/actions/categories";
import { SESSION_COOKIE } from "@/server/auth/session";
import { getAdminCategory, getAdminSubcategory } from "@/services/admin-category-service";
import { logIn } from "@/services/auth-service";
import { getCategories } from "@/services/catalog-service";
import { setupTestDatabase } from "@/test/db";
import { cookieJar } from "@/test/mocks/next-headers";
import { RedirectSignal } from "@/test/mocks/next-navigation";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

setupTestDatabase();
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
let photoDir: string;

beforeAll(async () => {
  photoDir = await mkdtemp(path.join(tmpdir(), "category-photos-"));
});

afterAll(() => rm(photoDir, { recursive: true, force: true }));

beforeEach(async () => {
  vi.stubEnv("PHOTO_STORAGE_DIR", photoDir);
  cookieJar.clear();
  vi.mocked(updateTag).mockClear();
  await rm(photoDir, { recursive: true, force: true });
  await mkdir(photoDir, { recursive: true });
});

async function logInAsOwner() {
  vi.stubEnv("ADMIN_USERNAME", "owner");
  vi.stubEnv("ADMIN_INITIAL_PASSWORD", "owner-password-123");
  const result = await logIn("owner", "owner-password-123");
  if (!result.ok) throw new Error("login failed");
  cookieJar.set(SESSION_COOKIE, { value: result.token });
}

function categoryForm(fields: Record<string, string> = {}, photo?: Blob) {
  const formData = new FormData();
  const values = { name: "Glass & Mirrors", tagline: "", description: "", sortOrder: "11", seoTitle: "", seoDescription: "", ...fields };
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  if (photo) formData.set("photo", photo, "photo.jpg");
  return formData;
}

describe("saveCategoryAction", () => {
  it("sends a visitor without a session to the login", async () => {
    await expect(saveCategoryAction(null, {}, categoryForm())).rejects.toEqual(new RedirectSignal(ROUTES.adminLogin));
    expect(await getAdminCategory("glass-mirrors")).toBeUndefined();
  });

  it("creates the category with its photo, refreshes the site and opens it to add types", async () => {
    await logInAsOwner();
    const photo = new Blob([JPEG], { type: "image/jpeg" });
    await expect(saveCategoryAction(null, {}, categoryForm({}, photo))).rejects.toEqual(
      new RedirectSignal(ROUTES.adminCategory("glass-mirrors")),
    );
    expect((await getAdminCategory("glass-mirrors"))?.image).toMatch(/^\/api\/photos\//);
    expect(await readdir(photoDir)).toHaveLength(1);
    expect(updateTag).toHaveBeenCalledWith(CACHE_TAGS.catalog);
    expect((await getCategories()).map((c) => c.id)).toContain("glass-mirrors");
  });

  it("returns field errors without saving", async () => {
    await logInAsOwner();
    const state = await saveCategoryAction(null, {}, categoryForm({ name: "", sortOrder: "first" }));
    expect(state.errors).toMatchObject({ name: "Enter the name", sortOrder: "Enter a whole number from 0 to 9999" });
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("explains a name clash and removes the photo it uploaded", async () => {
    await logInAsOwner();
    const photo = new Blob([JPEG], { type: "image/jpeg" });
    const state = await saveCategoryAction(null, {}, categoryForm({ name: "Paints" }, photo));
    expect(state.message).toBe("That name is already used. Choose another one.");
    expect(await readdir(photoDir)).toEqual([]);
  });

  it("updates a category and goes back to the list", async () => {
    await logInAsOwner();
    await expect(
      saveCategoryAction("paints", {}, categoryForm({ name: "Paints", seoDescription: "Wall paints in Kotul" })),
    ).rejects.toEqual(new RedirectSignal(ROUTES.adminCategories));
    expect((await getAdminCategory("paints"))?.seoDescription).toBe("Wall paints in Kotul");
  });
});

describe("saveSubcategoryAction", () => {
  it("adds a type and returns to its category", async () => {
    await logInAsOwner();
    await expect(saveSubcategoryAction("paints", null, {}, categoryForm({ name: "Chalk Paint" }))).rejects.toEqual(
      new RedirectSignal(ROUTES.adminCategory("paints")),
    );
    expect((await getAdminSubcategory("paints-chalk-paint"))?.name).toBe("Chalk Paint");
  });
});

describe("visibility actions", () => {
  it("hide and show categories and types for the owner only", async () => {
    await expect(setCategoryActiveAction("paints", false)).rejects.toEqual(new RedirectSignal(ROUTES.adminLogin));
    await logInAsOwner();
    expect(await setCategoryActiveAction("paints", false)).toEqual({ ok: true });
    expect(await setSubcategoryActiveAction("paints-wood-paint", false)).toEqual({ ok: true });
    expect(await setSubcategoryActiveAction("missing", false)).toEqual({ ok: false });
    expect(updateTag).toHaveBeenCalledWith(CACHE_TAGS.catalog);
  });
});
