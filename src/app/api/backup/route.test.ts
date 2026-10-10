import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "@/app/api/backup/route";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { BACKUP_TOKEN_HEADER, backupToken } from "@/lib/backup-token";
import { readBackup, saveBackup } from "@/server/storage/photos";
import { setupTestDatabase } from "@/test/db";

setupTestDatabase();
const SECRET = "s".repeat(32);
let folder: string;

beforeEach(async () => {
  folder = await mkdtemp(path.join(tmpdir(), "backups-"));
  vi.stubEnv("PHOTO_STORAGE_DIR", folder);
  vi.stubEnv("SESSION_SECRET", SECRET);
  vi.useFakeTimers({ toFake: ["Date"], now: new Date("2026-10-10T20:30:00Z") });
});

afterEach(async () => {
  vi.useRealTimers();
  await rm(folder, { recursive: true, force: true });
});

const request = (token?: string) =>
  new Request(`http://localhost${API_ENDPOINTS.backup}`, {
    method: "POST",
    headers: token ? { [BACKUP_TOKEN_HEADER]: token } : {},
  });

describe("POST /api/backup", () => {
  it("refuses a request without the right token", async () => {
    expect((await POST(request())).status).toBe(401);
    expect((await POST(request("guess"))).status).toBe(401);
    expect(await readBackup("2026-10-11")).toBeNull();
  });

  it("saves today's backup in India time and removes the one from 30 days ago", async () => {
    await saveBackup("2026-09-11", "{}");

    const response = await POST(request(await backupToken(SECRET)));

    const body = await response.json();
    expect(body).toMatchObject({ ok: true, date: "2026-10-11" });
    expect(body.rows.products).toBeGreaterThan(0);
    const backup = JSON.parse(new TextDecoder().decode((await readBackup("2026-10-11"))!));
    expect(backup.tables.products).toHaveLength(body.rows.products);
    expect(Object.keys(backup.tables)).toEqual(["categories", "subcategories", "products", "offers", "gallery", "enquiries"]);
    expect(await readBackup("2026-09-11")).toBeNull();
  });
});
