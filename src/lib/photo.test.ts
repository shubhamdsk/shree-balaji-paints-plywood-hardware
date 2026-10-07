import { describe, expect, it } from "vitest";
import { detectPhotoType, MAX_UPLOAD_BYTES, photoKeyFromImage, photoTypeFromKey, readPhotoUpload } from "@/lib/photo";

const JPEG = [0xff, 0xd8, 0xff, 0xe0];
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const WEBP = [0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50];
const KEY = "0e1bdb7f-7d13-4936-a592-6ce659a91c0a.jpg";

describe("detectPhotoType", () => {
  it("recognises JPEG, PNG and WebP from their first bytes", () => {
    expect(detectPhotoType(new Uint8Array(JPEG))).toBe("image/jpeg");
    expect(detectPhotoType(new Uint8Array(PNG))).toBe("image/png");
    expect(detectPhotoType(new Uint8Array(WEBP))).toBe("image/webp");
  });

  it("rejects other files, whatever their name says", () => {
    expect(detectPhotoType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(detectPhotoType(new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x41, 0x56, 0x49, 0x20]))).toBeNull();
  });
});

describe("readPhotoUpload", () => {
  it("treats a missing or empty file as no new photo", async () => {
    expect(await readPhotoUpload(null)).toEqual({ ok: true, photo: null });
    expect(await readPhotoUpload(new File([], "photo.jpg"))).toEqual({ ok: true, photo: null });
  });

  it("returns the bytes and the detected type", async () => {
    const result = await readPhotoUpload(new File([new Uint8Array(JPEG)], "photo.png", { type: "image/png" }));
    expect(result).toEqual({ ok: true, photo: { bytes: new Uint8Array(JPEG), type: "image/jpeg" } });
  });

  it("rejects files that are too large or not photos", async () => {
    const large = new File([new Uint8Array(MAX_UPLOAD_BYTES + 1)], "photo.jpg");
    expect(await readPhotoUpload(large)).toEqual({ ok: false, error: "This photo is too large. Choose a smaller one." });
    expect(await readPhotoUpload(new File(["hello"], "photo.jpg"))).toEqual({
      ok: false,
      error: "Choose a JPEG, PNG or WebP photo.",
    });
  });
});

describe("photoKeyFromImage", () => {
  it("returns the storage key of an uploaded photo", () => {
    expect(photoKeyFromImage(`/api/photos/${KEY}`)).toBe(KEY);
  });

  it("ignores static images and anything that is not a valid key", () => {
    expect(photoKeyFromImage("/images/products/royale.jpg")).toBeNull();
    expect(photoKeyFromImage("/api/photos/..%2F.env")).toBeNull();
    expect(photoKeyFromImage(null)).toBeNull();
  });
});

describe("photoTypeFromKey", () => {
  it("maps the extension back to its type", () => {
    expect(photoTypeFromKey(KEY)).toBe("image/jpeg");
    expect(photoTypeFromKey(KEY.replace(".jpg", ".webp"))).toBe("image/webp");
  });
});
