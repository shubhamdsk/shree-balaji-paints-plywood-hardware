import { API_ENDPOINTS } from "@/lib/api/endpoints";

export const PHOTO_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
} as const;

export type PhotoType = keyof typeof PHOTO_TYPES;

export const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
export const MAX_UPLOAD_BYTES = 3 * 1024 * 1024;
export const PHOTO_ACCEPT = Object.keys(PHOTO_TYPES).join(",");
export const PHOTO_KEY_PATTERN = /^[a-f0-9-]{36}\.(jpg|png|webp)$/;

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

export function detectPhotoType(bytes: Uint8Array): PhotoType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) && startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  return null;
}

export type PhotoUpload =
  | { ok: true; photo: { bytes: Uint8Array; type: PhotoType } | null }
  | { ok: false; error: string };

export async function readPhotoUpload(entry: FormDataEntryValue | null): Promise<PhotoUpload> {
  if (!(entry instanceof Blob) || entry.size === 0) return { ok: true, photo: null };
  if (entry.size > MAX_UPLOAD_BYTES) return { ok: false, error: "This photo is too large. Choose a smaller one." };
  const bytes = new Uint8Array(await entry.arrayBuffer());
  const type = detectPhotoType(bytes);
  if (!type) return { ok: false, error: "Choose a JPEG, PNG or WebP photo." };
  return { ok: true, photo: { bytes, type } };
}

export function photoKeyFromImage(image: string | null | undefined) {
  const prefix = API_ENDPOINTS.photo("");
  if (!image?.startsWith(prefix)) return null;
  const key = decodeURIComponent(image.slice(prefix.length));
  return PHOTO_KEY_PATTERN.test(key) ? key : null;
}

export function photoTypeFromKey(key: string): PhotoType {
  const extension = key.split(".").pop();
  const entry = Object.entries(PHOTO_TYPES).find(([, ext]) => ext === extension);
  return (entry?.[0] as PhotoType | undefined) ?? "image/jpeg";
}
