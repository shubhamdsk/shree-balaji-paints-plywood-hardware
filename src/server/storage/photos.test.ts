import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  deleteBackup,
  deletePhoto,
  readBackup,
  readPhoto,
  saveBackup,
  savePhoto,
  uploadPhoto,
} from "@/server/storage/photos";

const ENDPOINT = "https://storage.example.test";
const bytes = new Uint8Array([1, 2, 3, 4]);

function fakeBucket() {
  const objects = new Map<string, Uint8Array>();
  const requests: { method: string; url: string; signed: boolean; contentType: string | null }[] = [];
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = new Request(input, init);
    const key = new URL(request.url).pathname;
    requests.push({
      method: request.method,
      url: request.url,
      signed: request.headers.get("authorization")?.startsWith("AWS4-HMAC-SHA256") ?? false,
      contentType: request.headers.get("content-type"),
    });
    if (request.method === "PUT") {
      objects.set(key, new Uint8Array(await request.arrayBuffer()));
      return new Response(null, { status: 200 });
    }
    if (request.method === "DELETE") {
      objects.delete(key);
      return new Response(null, { status: 204 });
    }
    const object = objects.get(key);
    return object ? new Response(object.slice()) : new Response(null, { status: 404 });
  });
  return { objects, requests, fetchMock };
}

describe("photo storage", () => {
  let folder: string;

  beforeEach(async () => {
    folder = await mkdtemp(path.join(tmpdir(), "photos-"));
    vi.stubEnv("PHOTO_STORAGE_DIR", folder);
  });

  afterEach(async () => {
    await rm(folder, { recursive: true, force: true });
  });

  it("saves, reads and deletes photos in the local folder without bucket credentials", async () => {
    const key = await savePhoto(bytes, "image/jpeg");

    expect(key).toMatch(/\.jpg$/);
    expect(new Uint8Array((await readPhoto(key))!)).toEqual(bytes);

    await deletePhoto(key);
    expect(await readPhoto(key)).toBeNull();
  });

  describe("with Neon Object Storage credentials", () => {
    beforeEach(() => {
      vi.stubEnv("AWS_ENDPOINT_URL_S3", ENDPOINT);
      vi.stubEnv("AWS_ACCESS_KEY_ID", "test-key");
      vi.stubEnv("AWS_SECRET_ACCESS_KEY", "test-secret");
      vi.stubEnv("AWS_REGION", "us-east-2");
    });

    it("stores photos in the product-photos bucket with signed requests", async () => {
      const bucket = fakeBucket();
      vi.stubGlobal("fetch", bucket.fetchMock);

      const key = await savePhoto(bytes, "image/webp");

      expect(bucket.requests[0]).toEqual({
        method: "PUT",
        url: `${ENDPOINT}/product-photos/${key}`,
        signed: true,
        contentType: "image/webp",
      });
      expect(new Uint8Array((await readPhoto(key))!)).toEqual(bytes);

      await deletePhoto(key);
      expect(bucket.objects.size).toBe(0);
    });

    it("returns null for a photo that is not in the bucket", async () => {
      vi.stubGlobal("fetch", fakeBucket().fetchMock);

      expect(await readPhoto("00000000-0000-0000-0000-000000000000.jpg")).toBeNull();
    });

    it("fails the upload when the bucket rejects it", async () => {
      vi.stubGlobal("fetch", vi.fn(async () => new Response(null, { status: 403 })));

      await expect(savePhoto(bytes, "image/png")).rejects.toThrow("Storage upload failed with status 403");
    });

    it("reports a failed upload instead of throwing when the bucket can't be reached", async () => {
      vi.stubGlobal("fetch", vi.fn(async () => Promise.reject(new TypeError("fetch failed"))));
      vi.spyOn(console, "error").mockImplementation(() => undefined);

      expect(await uploadPhoto({ bytes, type: "image/jpeg" })).toEqual({ ok: false });
      expect(await uploadPhoto(null)).toEqual({ ok: true, image: undefined });
    });

    it("stores backups as JSON under backups/ in the same bucket", async () => {
      const bucket = fakeBucket();
      vi.stubGlobal("fetch", bucket.fetchMock);

      await saveBackup("2026-10-10", '{"ok":true}');

      expect(bucket.requests[0]).toMatchObject({
        method: "PUT",
        url: `${ENDPOINT}/product-photos/backups/2026-10-10.json`,
        signed: true,
        contentType: "application/json",
      });
    });
  });

  it("ignores keys that are not photo keys, so backups can't be read through the photo route", async () => {
    await saveBackup("2026-10-10", "{}");
    expect(await readPhoto("../.env.local")).toBeNull();
    expect(await readPhoto("backups/2026-10-10.json")).toBeNull();
  });

  it("saves, reads and deletes backups by date, and refuses other names", async () => {
    await saveBackup("2026-10-10", '{"ok":true}');
    expect(new TextDecoder().decode((await readBackup("2026-10-10"))!)).toBe('{"ok":true}');

    await deleteBackup("2026-10-10");
    expect(await readBackup("2026-10-10")).toBeNull();
    await expect(saveBackup("../secrets", "{}")).rejects.toThrow("Invalid backup date");
  });
});
