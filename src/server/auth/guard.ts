import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { ROUTES } from "@/lib/routes";
import { readSessionToken } from "@/server/auth/session";
import { findSessionUser } from "@/services/auth-service";
import type { AdminUser } from "@/types";

export const getOwner = cache(async (): Promise<AdminUser | null> => {
  const token = await readSessionToken();
  return token ? findSessionUser(token) : null;
});

export async function requireOwner(): Promise<AdminUser> {
  const owner = await getOwner();
  if (!owner) redirect(ROUTES.adminLogin);
  return owner;
}
