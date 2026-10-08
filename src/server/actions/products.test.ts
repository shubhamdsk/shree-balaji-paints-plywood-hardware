import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { updateTag } from "next/cache";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { ROUTES } from "@/lib/routes";
import { saveProductAction, setProductFlagAction } from "@/server/actions/products";
import { SESSION_COOKIE } from "@/server/auth/session";
import { getAdminProduct } from "@/services/admin-product-service";
import { logIn } from "@/services/auth-service";
import { getProducts } from "@/services/catalog-service";
import { setupTestDatabase } from "@/test/db";
import { cookieJar } from "@/test/mocks/next-headers";
import { RedirectSignal } from "@/test/mocks/next-navigation";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

setupTestDatabase();
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
let photoDir: string;

beforeAll(async () => {
  photoDir = await mkdtemp(path.join(tmpdir(), "shop-photos-"));
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

function productForm(fields: Record<string, string> = {}, photo?: Blob) {
  const formData = new FormData();
  const values = {
    name: "Weatherbond Advance",
    brand: "Nippon Paint",
    category: "paints",
    type: "Exterior Emulsion",
    sizes: "1 L, 4 L",
    priceFrom: "295",
    unit: "per litre",
    inStock: "on",
    ...fields,
  };
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  if (photo) formData.set("photo", photo, "photo.jpg");
  return formData;
}

const redirectsTo = (url: string) => new RedirectSignal(url);

describe("without a session", () => {
  it("sends every action to the login page and changes nothing", async () => {
    const [product] = await getProducts();
    await expect(saveProductAction(null, {}, productForm())).rejects.toEqual(redirectsTo(ROUTES.adminLogin));
    await expect(setProductFlagAction(product.id, "inStock", false)).rejects.toEqual(redirectsTo(ROUTES.adminLogin));

    expect(await getAdminProduct("weatherbond-advance")).toBeUndefined();
    expect((await getAdminProduct(product.id))?.inStock).toBe(product.inStock);
    expect(updateTag).not.toHaveBeenCalled();
  });
});

describe("saveProductAction", () => {
  beforeEach(logInAsOwner);

  it("returns field errors without saving", async () => {
    const state = await saveProductAction(null, {}, productForm({ name: "", sizes: "" }));
    expect(state).toEqual({
      message: "Please fix the highlighted fields.",
      errors: { name: "Enter the product name", sizes: "Add at least one size" },
    });
    expect(updateTag).not.toHaveBeenCalled();
  });

  it("rejects a file that is not a photo", async () => {
    const state = await saveProductAction(null, {}, productForm({}, new Blob(["<svg/>"], { type: "image/jpeg" })));
    expect(state.errors).toEqual({ photo: "Choose a JPEG, PNG or WebP photo." });
  });

  it("adds the product with its photo, refreshes the website and returns to the list", async () => {
    await expect(saveProductAction(null, {}, productForm({}, new Blob([JPEG])))).rejects.toEqual(
      redirectsTo(ROUTES.adminProducts),
    );
    expect(updateTag).toHaveBeenCalledWith(CACHE_TAGS.catalog);

    const product = await getAdminProduct("weatherbond-advance");
    expect(product).toMatchObject({ priceFrom: 295, sizes: ["1 L", "4 L"], inStock: true, featured: false });
    expect(product?.image).toMatch(/^\/api\/photos\/[a-f0-9-]{36}\.jpg$/);
    expect(await readdir(photoDir)).toEqual([product!.image!.split("/").pop()]);
  });

  it("replaces the photo and deletes the old file", async () => {
    await saveProductAction(null, {}, productForm({}, new Blob([JPEG]))).catch(() => undefined);
    const [oldFile] = await readdir(photoDir);

    await expect(saveProductAction("weatherbond-advance", {}, productForm({}, new Blob([JPEG])))).rejects.toEqual(
      redirectsTo(ROUTES.adminProducts),
    );
    const files = await readdir(photoDir);
    expect(files).toHaveLength(1);
    expect(files[0]).not.toBe(oldFile);
  });

  it("says when the product being edited no longer exists", async () => {
    expect(await saveProductAction("missing", {}, productForm())).toEqual({ message: "This product no longer exists." });
  });
});

describe("setProductFlagAction", () => {
  beforeEach(logInAsOwner);

  it("updates the flag and refreshes the website", async () => {
    const [product] = await getProducts();
    expect(await setProductFlagAction(product.id, "inStock", false)).toEqual({ ok: true });
    expect((await getAdminProduct(product.id))?.inStock).toBe(false);
    expect(updateTag).toHaveBeenCalledWith(CACHE_TAGS.catalog);
  });

  it("rejects unknown flags and missing products", async () => {
    const [product] = await getProducts();
    expect(await setProductFlagAction(product.id, "sortOrder", true)).toEqual({ ok: false });
    expect(await setProductFlagAction("missing", "inStock", false)).toEqual({ ok: false });
    expect(updateTag).not.toHaveBeenCalled();
  });
});