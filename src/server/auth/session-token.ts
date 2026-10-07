import { createHmac, randomBytes } from "node:crypto";

const DEV_SECRET = "development-only-session-secret";

function sessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (secret && secret.length >= 32) return secret;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set to at least 32 characters.");
  return DEV_SECRET;
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string) {
  return createHmac("sha256", sessionSecret()).update(token).digest("hex");
}
