import { mkdir, mkdtemp, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { updateTag } from "next/cache";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { ROUTES } from "@/lib/routes";
import { deleteOfferAction, saveOfferAction } from "@/server/actions/offers";
import { SESSION_COOKIE } from "@/server/auth/session";
import { logIn } from "@/services/auth-service";
import { getAdminOffers, getLiveOffers } from "@/services/offer-service";
import { setupTestDatabase } from "@/test/db";
import { cookieJar } from "@/test/mocks/next-headers";
import { RedirectSignal } from "@/test/mocks/next-navigation";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

setupTestDatabase();
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
let photoDir: string;

beforeAll(async () => {
  photoDir = await mkdtemp(path.join(tmpdir(), "offer-photos-"));
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

function offerForm(fields: Record<string, string> = {}, photo?: Blob) {
  const formData = new FormData();
  const values = { title: "Diwali offer", body: "10% off on Royale", startsOn: "2026-10-20", endsOn: "2026-10-27", ...fields };
  for (const [key, value] of Object.entries(values)) formData.set(key, value);
  if (photo) formData.set("photo", photo, "photo.jpg");
  return formData;
}

const save = (formData: FormData, id: string | null = null, copyFrom: string | null = null) =>
  saveOfferAction(id, copyFrom, {}, formData);

describe("saveOfferAction", () => {
  it("sends a visitor without a session to the login", async () => {
    await expect(save(offerForm())).rejects.toEqual(new RedirectSignal(ROUTES.adminLogin));
    expect(await getAdminOffers()).toEqual([]);
  });

  it("returns the field errors without saving", async () => {
    await logInAsOwner();
    const state = await save(offerForm({ title: "", endsOn: "2026-10-01" }));
    expect(state.errors).toEqual({
      title: "Enter the offer title",
      endsOn: "The end date must be on or after the start date",
    });
    expect(await getAdminOffers()).toEqual([]);
  });

  it("creates an offer with a photo, refreshes the offer pages and shows it only on its dates", async () => {
    await logInAsOwner();
    await expect(save(offerForm({}, new Blob([JPEG], { type: "image/jpeg" })))).rejects.toEqual(
      new RedirectSignal(ROUTES.adminOffers),
    );

    const [offer] = await getAdminOffers();
    expect(offer).toMatchObject({ title: "Diwali offer", startsOn: "2026-10-20", endsOn: "2026-10-27" });
    expect(offer.image).toMatch(/^\/api\/photos\//);
    expect(updateTag).toHaveBeenCalledWith(CACHE_TAGS.offers);
    expect(await getLiveOffers("2026-10-19")).toEqual([]);
    expect((await getLiveOffers("2026-10-27")).map((o) => o.id)).toEqual([offer.id]);
  });

  it("asks to try again, without saving, when the photo can't be uploaded", async () => {
    await logInAsOwner();
    vi.stubEnv("AWS_ENDPOINT_URL_S3", "https://storage.example.test");
    vi.stubEnv("AWS_ACCESS_KEY_ID", "test-key");
    vi.stubEnv("AWS_SECRET_ACCESS_KEY", "test-secret");
    vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("fetch failed"))));
    vi.spyOn(console, "error").mockImplementation(() => undefined);

    const state = await save(offerForm({}, new Blob([JPEG], { type: "image/jpeg" })));

    expect(state.message).toMatch(/photo couldn't be saved/);
    expect(await getAdminOffers()).toEqual([]);
  });

  it("edits an offer and deletes the photo it replaced", async () => {
    await logInAsOwner();
    await save(offerForm({}, new Blob([JPEG], { type: "image/jpeg" }))).catch(() => undefined);
    const [offer] = await getAdminOffers();

    await expect(save(offerForm({ title: "Diwali mega offer" }, new Blob([JPEG], { type: "image/jpeg" })), offer.id)).rejects.toEqual(
      new RedirectSignal(ROUTES.adminOffers),
    );

    const [edited] = await getAdminOffers();
    expect(edited.title).toBe("Diwali mega offer");
    expect(edited.image).not.toBe(offer.image);
    expect(await readdir(photoDir)).toHaveLength(1);
  });

  it("copies an offer with its photo, and deleting one copy keeps the shared photo", async () => {
    await logInAsOwner();
    await save(offerForm({}, new Blob([JPEG], { type: "image/jpeg" }))).catch(() => undefined);
    const [original] = await getAdminOffers();

    await save(offerForm({ startsOn: "2027-10-20", endsOn: "2027-10-27" }), null, original.id).catch(() => undefined);
    const copy = (await getAdminOffers()).find((o) => o.id !== original.id);
    expect(copy).toMatchObject({ startsOn: "2027-10-20", image: original.image });

    expect(await deleteOfferAction(original.id)).toEqual({ ok: true });
    expect(await readdir(photoDir)).toHaveLength(1);
    expect(await deleteOfferAction(copy!.id)).toEqual({ ok: true });
    expect(await readdir(photoDir)).toHaveLength(0);
  });
});

describe("deleteOfferAction", () => {
  it("needs a session", async () => {
    await expect(deleteOfferAction("offer-1")).rejects.toEqual(new RedirectSignal(ROUTES.adminLogin));
  });

  it("reports an offer that doesn't exist", async () => {
    await logInAsOwner();
    expect(await deleteOfferAction("offer-missing")).toEqual({ ok: false });
  });
});
