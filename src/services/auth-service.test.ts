import { asc } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { auditLog } from "@/server/db/schema";
import { findSessionUser, LOCKOUT_MS, logIn, logOut, MAX_FAILED_ATTEMPTS, SESSION_TTL_MS } from "@/services/auth-service";
import { setupTestDatabase } from "@/test/db";

const db = setupTestDatabase();
const PASSWORD = "owner-password-123";
const start = new Date("2026-10-07T10:00:00Z");

beforeEach(() => {
  vi.stubEnv("ADMIN_USERNAME", "owner");
  vi.stubEnv("ADMIN_INITIAL_PASSWORD", PASSWORD);
});

async function auditActions() {
  const rows = await db().select({ action: auditLog.action }).from(auditLog).orderBy(asc(auditLog.id));
  return rows.map((row) => row.action);
}

function minutesLater(minutes: number) {
  return new Date(start.getTime() + minutes * 60 * 1000);
}

describe("logIn", () => {
  it("creates the owner account on first login and opens a 30-day session", async () => {
    const result = await logIn(" owner ", PASSWORD, start);
    expect(result).toMatchObject({ ok: true, user: { username: "owner" } });
    if (!result.ok) return;
    expect(result.expiresAt.getTime()).toBe(start.getTime() + SESSION_TTL_MS);
    expect(await findSessionUser(result.token, start)).toEqual(result.user);
    expect(await auditActions()).toEqual(["login"]);
  });

  it("does not create an account when the starting password is too short", async () => {
    vi.stubEnv("ADMIN_INITIAL_PASSWORD", "short");
    expect(await logIn("owner", "short", start)).toEqual({ ok: false, reason: "invalid" });
  });

  it("keeps the first account when the environment changes later", async () => {
    await logIn("owner", PASSWORD, start);
    vi.stubEnv("ADMIN_USERNAME", "someone-else");
    vi.stubEnv("ADMIN_INITIAL_PASSWORD", "another-password");
    expect(await logIn("someone-else", "another-password", start)).toEqual({ ok: false, reason: "invalid" });
    expect((await logIn("owner", PASSWORD, start)).ok).toBe(true);
  });

  it("gives the same answer for an unknown user and a wrong password", async () => {
    expect(await logIn("nobody", PASSWORD, start)).toEqual({ ok: false, reason: "invalid" });
    expect(await logIn("owner", "wrong-password", start)).toEqual({ ok: false, reason: "invalid" });
    expect(await auditActions()).toEqual(["login_failed", "login_failed"]);
  });

  it("locks the account for 15 minutes after five wrong passwords", async () => {
    for (let attempt = 1; attempt < MAX_FAILED_ATTEMPTS; attempt++) {
      expect(await logIn("owner", "wrong-password", start)).toEqual({ ok: false, reason: "invalid" });
    }
    expect(await logIn("owner", "wrong-password", start)).toEqual({ ok: false, reason: "locked" });
    expect(await logIn("owner", PASSWORD, minutesLater(14))).toEqual({ ok: false, reason: "locked" });

    const unlocked = new Date(start.getTime() + LOCKOUT_MS + 1);
    expect((await logIn("owner", PASSWORD, unlocked)).ok).toBe(true);
    expect((await auditActions()).filter((action) => action === "login_locked")).toHaveLength(2);
  });

  it("resets the count of wrong passwords after a successful login", async () => {
    for (let attempt = 1; attempt < MAX_FAILED_ATTEMPTS; attempt++) await logIn("owner", "wrong-password", start);
    await logIn("owner", PASSWORD, start);
    expect(await logIn("owner", "wrong-password", start)).toEqual({ ok: false, reason: "invalid" });
  });
});

describe("sessions", () => {
  it("expire after 30 days", async () => {
    const result = await logIn("owner", PASSWORD, start);
    if (!result.ok) throw new Error("login failed");
    expect(await findSessionUser(result.token, new Date(start.getTime() + SESSION_TTL_MS - 1))).not.toBeNull();
    expect(await findSessionUser(result.token, new Date(start.getTime() + SESSION_TTL_MS))).toBeNull();
  });

  it("end on logout", async () => {
    const result = await logIn("owner", PASSWORD, start);
    if (!result.ok) throw new Error("login failed");
    await logOut(result.token);
    expect(await findSessionUser(result.token, start)).toBeNull();
    expect(await auditActions()).toEqual(["login", "logout"]);
  });

  it("ignore unknown tokens", async () => {
    expect(await findSessionUser("made-up-token", start)).toBeNull();
  });
});
