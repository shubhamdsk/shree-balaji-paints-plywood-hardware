import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { deletePhoto, readPhoto, savePhoto } from "@/server/storage/photos";

const cloudflareContext = Symbol.for("__cloudflare-context__");
const globalScope = globalThis as Record<symbol, unknown>;
const bytes = new Uint8Array([1, 2, 3, 4]);

function fakeBucket() {
  const objects = new Map<string, Uint8Array>();
  return {
    objects,
    put: async (key: string, data: Uint8Array) => {
      objects.set(key, data);
    },
    get: async (key: string) => {
      const data = objects.get(key);
      return data ? { arrayBuffer: async () => data.slice().buffer } : null;
    },
    delete: async (key: string) => {
      objects.delete(key);
    },
  };
}

describe("photo storage", () => {
  let folder: string;

  beforeEach(async () => {
    folder = await mkdtemp(path.join(tmpdir(), "photos-"));
    process.env.PHOTO_STORAGE_DIR = folder;
  });

  afterEach(async () => {
    delete globalScope[cloudflareContext];
    delete process.env.PHOTO_STORAGE_DIR;
    await rm(folder, { recursive: true, force: true });
  });

  it("saves, reads and deletes photos in the local folder outside Cloudflare", async () => {
    const key = await savePhoto(bytes, "image/jpeg");

    expect(key).toMatch(/\.jpg$/);
    expect(new Uint8Array((await readPhoto(key))!)).toEqual(bytes);

    await deletePhoto(key);
    expect(await readPhoto(key)).toBeNull();
  });

  it("uses the R2 bucket bound to the Cloudflare worker", async () => {
    const bucket = fakeBucket();
    globalScope[cloudflareContext] = { env: { PHOTOS_BUCKET: bucket } };

    const key = await savePhoto(bytes, "image/webp");

    expect(bucket.objects.has(key)).toBe(true);
    expect(new Uint8Array((await readPhoto(key))!)).toEqual(bytes);

    await deletePhoto(key);
    expect(bucket.objects.size).toBe(0);
  });

  it("ignores keys that are not photo keys", async () => {
    expect(await readPhoto("../.env.local")).toBeNull();
  });
});
