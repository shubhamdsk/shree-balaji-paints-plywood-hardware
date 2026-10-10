// Cloudflare cron runs in UTC: 20:30 UTC is 2:00 AM in India. Must match triggers.crons in wrangler.jsonc.
export const DAILY_BACKUP_CRON = "30 20 * * *";
export const BACKUP_TOKEN_HEADER = "x-backup-token";

export async function backupToken(secret: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, [
    "sign",
  ]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("daily-backup"));
  return Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
