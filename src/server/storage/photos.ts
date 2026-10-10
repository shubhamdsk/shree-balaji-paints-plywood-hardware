import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { PHOTO_KEY_PATTERN, PHOTO_TYPES, type PhotoType } from "@/lib/photo";

interface PhotoStore {
  set(key: string, data: Uint8Array): Promise<void>;
  get(key: string): Promise<ArrayBuffer | null>;
  delete(key: string): Promise<void>;
}

interface R2Bucket {
  put(key: string, data: Uint8Array): Promise<unknown>;
  get(key: string): Promise<{ arrayBuffer(): Promise<ArrayBuffer> } | null>;
  delete(key: string): Promise<void>;
}

function cloudflarePhotoBucket(): R2Bucket | undefined {
  try {
    return (getCloudflareContext().env as { PHOTOS_BUCKET?: R2Bucket }).PHOTOS_BUCKET;
  } catch {
    return undefined;
  }
}

function r2Store(bucket: R2Bucket): PhotoStore {
  return {
    set: async (key, data) => {
      await bucket.put(key, data);
    },
    get: async (key) => (await bucket.get(key))?.arrayBuffer() ?? null,
    delete: (key) => bucket.delete(key),
  };
}

function folderStore(folder: string): PhotoStore {
  return {
    set: async (key, data) => {
      await mkdir(folder, { recursive: true });
      await writeFile(path.join(folder, key), data);
    },
    get: async (key) => {
      try {
        const file = await readFile(path.join(folder, key));
        return file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer;
      } catch {
        return null;
      }
    },
    delete: (key) => rm(path.join(folder, key), { force: true }),
  };
}

function photoStore(): PhotoStore {
  const bucket = cloudflarePhotoBucket();
  if (bucket) return r2Store(bucket);
  return folderStore(process.env.PHOTO_STORAGE_DIR ?? path.join(process.cwd(), ".data/photos"));
}

export async function savePhoto(data: Uint8Array, type: PhotoType) {
  const key = `${randomUUID()}.${PHOTO_TYPES[type]}`;
  await photoStore().set(key, data);
  return key;
}

export async function readPhoto(key: string) {
  if (!PHOTO_KEY_PATTERN.test(key)) return null;
  return photoStore().get(key);
}

export async function deletePhoto(key: string) {
  if (!PHOTO_KEY_PATTERN.test(key)) return;
  await photoStore().delete(key);
}
