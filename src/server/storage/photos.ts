import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { AwsClient } from "aws4fetch";
import { PHOTO_KEY_PATTERN, PHOTO_TYPES, photoTypeFromKey, type PhotoType } from "@/lib/photo";

const BUCKET = "product-photos";
const BACKUP_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

interface FileStore {
  set(key: string, data: Uint8Array, contentType: string): Promise<void>;
  get(key: string): Promise<ArrayBuffer | null>;
  delete(key: string): Promise<void>;
}

async function expectOk(response: Response, action: string) {
  if (!response.ok) throw new Error(`Storage ${action} failed with status ${response.status}`);
}

function bucketStore(endpoint: string, client: AwsClient): FileStore {
  const objectUrl = (key: string) => `${endpoint.replace(/\/+$/, "")}/${BUCKET}/${key}`;
  return {
    set: async (key, data, contentType) => {
      const response = await client.fetch(objectUrl(key), {
        method: "PUT",
        body: data.slice(),
        headers: { "Content-Type": contentType },
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

function folderStore(folder: string): FileStore {
  return {
    set: async (key, data) => {
      const file = path.join(folder, key);
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, data);
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

function fileStore(): FileStore {
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
  await fileStore().set(key, data, photoTypeFromKey(key));
  return key;
}

export async function readPhoto(key: string) {
  if (!PHOTO_KEY_PATTERN.test(key)) return null;
  return fileStore().get(key);
}

export async function deletePhoto(key: string) {
  if (!PHOTO_KEY_PATTERN.test(key)) return;
  await fileStore().delete(key);
}

function backupKey(date: string) {
  if (!BACKUP_DATE_PATTERN.test(date)) throw new Error(`Invalid backup date: ${date}`);
  return `backups/${date}.json`;
}

export async function saveBackup(date: string, json: string) {
  const key = backupKey(date);
  await fileStore().set(key, new TextEncoder().encode(json), "application/json");
  return key;
}

export async function readBackup(date: string) {
  return fileStore().get(backupKey(date));
}

export async function deleteBackup(date: string) {
  await fileStore().delete(backupKey(date));
}
