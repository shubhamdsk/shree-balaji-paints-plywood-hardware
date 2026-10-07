import "server-only";
import { cookies } from "next/headers";
import { ROUTES } from "@/lib/routes";

export const SESSION_COOKIE = "sb_owner_session";

export async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: ROUTES.admin,
    expires: expiresAt,
  });
}

export async function readSessionToken() {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

export async function clearSessionCookie() {
  (await cookies()).delete({ name: SESSION_COOKIE, path: ROUTES.admin });
}
