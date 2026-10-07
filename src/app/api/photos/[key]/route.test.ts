import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/photos/[key]/route";
import { savePhoto } from "@/server/storage/photos";

const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
let photoDir: string;

beforeAll(async () => {
  photoDir = await mkdtemp(path.join(tmpdir(), "shop-photos-"));
});

beforeEach(() => {
  vi.stubEnv("PHOTO_STORAGE_DIR", photoDir);
});

afterAll(() => rm(photoDir, { recursive: true, force: true }));

function get(key: string) {
  return GET(new Request("http://localhost"), { params: Promise.resolve({ key }) });
}

describe("GET /api/photos/[key]", () => {
  it("serves a stored photo with its type and a long cache", async () => {
    const response = await get(await savePhoto(JPEG, "image/jpeg"));
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("image/jpeg");
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=31536000, immutable");
    expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(new Uint8Array(await response.arrayBuffer())).toEqual(JPEG);
  });

  it("returns 404 for unknown keys and for anything that is not a photo key", async () => {
    for (const key of ["0e1bdb7f-7d13-4936-a592-6ce659a91c0a.jpg", "../.env", "photo.svg"]) {
      const response = await get(key);
      expect(response.status).toBe(404);
      expect(await response.json()).toEqual({ error: "Photo not found" });
    }
  });
});
