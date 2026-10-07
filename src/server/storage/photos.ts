import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { PHOTO_KEY_PATTERN, PHOTO_TYPES, type PhotoType } from "@/lib/photo";

const STORE_NAME = "product-photos";

interface PhotoStore {
  set(key: string, data: Uint8Array): Promise<void>;
  get(key: string): Promise<ArrayBuffer | null>;
  delete(key: string): Promise<void>;
}

function isOnNetlify() {
  return Boolean(process.env.NETLIFY_BLOBS_CONTEXT || (globalThis as { netlifyBlobsContext?: unknown }).netlifyBlobsContext);
}

async function netlifyStore(): Promise<PhotoStore> {
  const { getStore } = await import("@netlify/blobs");
  const store = getStore({ name: STORE_NAME, consistency: "strong" });
  return {
    set: async (key, data) => {
      await store.set(key, data.slice().buffer);
    },
    get: (key) => store.get(key, { type: "arrayBuffer" }),
    delete: (key) => store.delete(key),
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

function photoStore() {
  if (isOnNetlify()) return netlifyStore();
  return Promise.resolve(folderStore(process.env.PHOTO_STORAGE_DIR ?? path.join(process.cwd(), ".data/photos")));
}

export async function savePhoto(data: Uint8Array, type: PhotoType) {
  const key = `${randomUUID()}.${PHOTO_TYPES[type]}`;
  await (await photoStore()).set(key, data);
  return key;
}

export async function readPhoto(key: string) {
  if (!PHOTO_KEY_PATTERN.test(key)) return null;
  return (await photoStore()).get(key);
}

export async function deletePhoto(key: string) {
  if (!PHOTO_KEY_PATTERN.test(key)) return;
  await (await photoStore()).delete(key);
}
