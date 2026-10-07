import { randomBytes, scrypt, timingSafeEqual, type BinaryLike } from "node:crypto";

const KEY_LENGTH = 64;
export const MIN_PASSWORD_LENGTH = 10;

function deriveKey(password: string, salt: BinaryLike): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, (error, key) => (error ? reject(error) : resolve(key)));
  });
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const key = await deriveKey(password, salt);
  return `scrypt$${salt.toString("base64")}$${key.toString("base64")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [scheme, salt, expected] = stored.split("$");
  if (scheme !== "scrypt" || !salt || !expected) return false;
  const expectedKey = Buffer.from(expected, "base64");
  const key = await deriveKey(password, Buffer.from(salt, "base64"));
  return key.length === expectedKey.length && timingSafeEqual(key, expectedKey);
}
