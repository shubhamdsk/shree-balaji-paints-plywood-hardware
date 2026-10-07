"use server";

import { redirect } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { clearSessionCookie, readSessionToken, setSessionCookie } from "@/server/auth/session";
import { logIn, logOut } from "@/services/auth-service";

export interface LoginState {
  error?: string;
  username?: string;
}

const INVALID_LOGIN_MESSAGE = "Incorrect username or password";
const LOCKED_LOGIN_MESSAGE = "Too many wrong tries. Login is locked for 15 minutes.";

export async function logInAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").slice(0, 100);
  const password = String(formData.get("password") ?? "").slice(0, 200);
  if (!username.trim() || !password) return { error: "Enter your username and password.", username };

  const result = await logIn(username, password);
  if (!result.ok) {
    return { error: result.reason === "locked" ? LOCKED_LOGIN_MESSAGE : INVALID_LOGIN_MESSAGE, username };
  }
  await setSessionCookie(result.token, result.expiresAt);
  redirect(ROUTES.admin);
}

export async function logOutAction() {
  const token = await readSessionToken();
  if (token) await logOut(token);
  await clearSessionCookie();
  redirect(ROUTES.adminLogin);
}
