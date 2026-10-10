import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { AwsClient } from "aws4fetch";
import { PHOTO_KEY_PATTERN, PHOTO_TYPES, photoTypeFromKey, type PhotoType } from "@/lib/photo";

const BUCKET = "product-photos";

interface PhotoStore {
  set(key: string, data: Uint8Array): Promise<void>;
  get(key: string): Promise<ArrayBuffer | null>;
  delete(key: string): Promise<void>;
}

async function expectOk(response: Response, action: string) {
  if (!response.ok) throw new Error(`Photo ${action} failed with status ${response.status}`);
}

function bucketStore(endpoint: string, client: AwsClient): PhotoStore {
  const objectUrl = (key: string) => `${endpoint.replace(/\/+$/, "")}/${BUCKET}/${key}`;
  return {
    set: async (key, data) => {
      const response = await client.fetch(objectUrl(key), {
        method: "PUT",
        body: data.slice(),
        headers: { "Content-Type": photoTypeFromKey(key) },
      });
      await expectOk(response, "upload");
    },
    get: async (key) => {
      const response = await client.fetch(objectUrl(key));
      if (response.status === 404) return null;
      await expectOk(response, "download");
      return response.arrayBuffer();
    },
    delete: async (key) => {
      const response = await client.fetch(objectUrl(key), { method: "DELETE" });
      if (response.status !== 404) await expectOk(response, "delete");
    },
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
  const { AWS_ENDPOINT_URL_S3, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = process.env;
  if (AWS_ENDPOINT_URL_S3 && AWS_ACCESS_KEY_ID && AWS_SECRET_ACCESS_KEY) {
    const client = new AwsClient({
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
      region: AWS_REGION || "us-east-2",
      service: "s3",
    });
    return bucketStore(AWS_ENDPOINT_URL_S3, client);
  }
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
