import { and, count, eq, gt, sql } from "drizzle-orm";
import { writeAudit } from "@/server/audit";
import { hashPassword, MIN_PASSWORD_LENGTH, verifyPassword } from "@/server/auth/password";
import { createSessionToken, hashSessionToken } from "@/server/auth/session-token";
import { getDb, type Database } from "@/server/db/client";
import { adminUsers, sessions } from "@/server/db/schema";
import type { AdminUser } from "@/types";

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000;
export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export type LoginResult =
  | { ok: true; user: AdminUser; token: string; expiresAt: Date }
  | { ok: false; reason: "invalid" | "locked" };

let dummyHash: Promise<string> | undefined;

async function ensureOwnerAccount(db: Database) {
  const [{ total }] = await db.select({ total: count() }).from(adminUsers);
  if (total > 0) return;
  const username = process.env.ADMIN_USERNAME?.trim();
  const password = process.env.ADMIN_INITIAL_PASSWORD ?? "";
  if (!username || password.length < MIN_PASSWORD_LENGTH) return;
  await db
    .insert(adminUsers)
    .values({ username, passwordHash: await hashPassword(password) })
    .onConflictDoNothing();
}

export async function logIn(username: string, password: string, now = new Date()): Promise<LoginResult> {
  const db = await getDb();
  await ensureOwnerAccount(db);
  const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username.trim()));

  if (!user) {
    dummyHash ??= hashPassword("timing-equaliser");
    await verifyPassword(password, await dummyHash);
    await writeAudit(db, { userId: null, action: "login_failed", entity: "admin_user" });
    return { ok: false, reason: "invalid" };
  }

  if (user.lockedUntil && user.lockedUntil > now) {
    await writeAudit(db, { userId: user.id, action: "login_locked", entity: "admin_user", entityId: String(user.id) });
    return { ok: false, reason: "locked" };
  }

  if (!(await verifyPassword(password, user.passwordHash))) {
    const [{ failedAttempts }] = await db
      .update(adminUsers)
      .set({ failedAttempts: sql`${adminUsers.failedAttempts} + 1` })
      .where(eq(adminUsers.id, user.id))
      .returning({ failedAttempts: adminUsers.failedAttempts });
    const locked = failedAttempts >= MAX_FAILED_ATTEMPTS;
    if (locked) {
      await db
        .update(adminUsers)
        .set({ failedAttempts: 0, lockedUntil: new Date(now.getTime() + LOCKOUT_MS) })
        .where(eq(adminUsers.id, user.id));
    }
    await writeAudit(db, {
      userId: user.id,
      action: locked ? "login_locked" : "login_failed",
      entity: "admin_user",
      entityId: String(user.id),
    });
    return { ok: false, reason: locked ? "locked" : "invalid" };
  }

  const token = createSessionToken();
  const expiresAt = new Date(now.getTime() + SESSION_TTL_MS);
  await db.update(adminUsers).set({ failedAttempts: 0, lockedUntil: null }).where(eq(adminUsers.id, user.id));
  await db.insert(sessions).values({ tokenHash: hashSessionToken(token), userId: user.id, expiresAt });
  await writeAudit(db, { userId: user.id, action: "login", entity: "admin_user", entityId: String(user.id) });
  return { ok: true, user: { id: user.id, username: user.username }, token, expiresAt };
}

export async function findSessionUser(token: string, now = new Date()): Promise<AdminUser | null> {
  const db = await getDb();
  const [row] = await db
    .select({ id: adminUsers.id, username: adminUsers.username })
    .from(sessions)
    .innerJoin(adminUsers, eq(sessions.userId, adminUsers.id))
    .where(and(eq(sessions.tokenHash, hashSessionToken(token)), gt(sessions.expiresAt, now)));
  return row ?? null;
}

export async function logOut(token: string) {
  const db = await getDb();
  const [session] = await db
    .delete(sessions)
    .where(eq(sessions.tokenHash, hashSessionToken(token)))
    .returning({ userId: sessions.userId });
  if (session) {
    await writeAudit(db, { userId: session.userId, action: "logout", entity: "admin_user", entityId: String(session.userId) });
  }
}
