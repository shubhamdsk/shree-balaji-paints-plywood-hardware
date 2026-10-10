"use server";

import { redirect } from "next/navigation";
import { MAX_PASSWORD_LENGTH, MAX_USERNAME_LENGTH, validatePasswordChange, type PasswordChangeErrors } from "@/lib/password-rules";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { clearSessionCookie, readSessionToken, setSessionCookie } from "@/server/auth/session";
import { changePassword, logIn, logOut } from "@/services/auth-service";

export interface LoginState {
  error?: string;
  username?: string;
}

export interface PasswordChangeState {
  errors?: PasswordChangeErrors;
  changed?: boolean;
}

const INVALID_LOGIN_MESSAGE = "Incorrect username or password";
const LOCKED_LOGIN_MESSAGE = "Too many wrong tries. Login is locked for 15 minutes.";

export async function logInAction(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").slice(0, MAX_USERNAME_LENGTH);
  const password = String(formData.get("password") ?? "").slice(0, MAX_PASSWORD_LENGTH);
  if (!username.trim() || !password) return { error: "Enter your username and password.", username };

  const result = await logIn(username, password);
  if (!result.ok) {
    return { error: result.reason === "locked" ? LOCKED_LOGIN_MESSAGE : INVALID_LOGIN_MESSAGE, username };
  }
  await setSessionCookie(result.token, result.expiresAt);
  redirect(ROUTES.admin);
}

export async function changePasswordAction(
  _previous: PasswordChangeState,
  formData: FormData,
): Promise<PasswordChangeState> {
  await requireOwner();
  const input = {
    currentPassword: String(formData.get("currentPassword") ?? ""),
    newPassword: String(formData.get("newPassword") ?? ""),
    confirmPassword: String(formData.get("confirmPassword") ?? ""),
  };
  const errors = validatePasswordChange(input);
  if (Object.keys(errors).length > 0) return { errors };

  const token = await readSessionToken();
  if (!token) redirect(ROUTES.adminLogin);
  const result = await changePassword(token, input.currentPassword, input.newPassword);
  if (result.ok) return { changed: true };
  if (result.reason === "signed_out") {
    await clearSessionCookie();
    redirect(ROUTES.adminLogin);
  }
  return {
    errors: {
      currentPassword:
        result.reason === "locked" ? LOCKED_LOGIN_MESSAGE : "Your current password is not correct",
    },
  };
}

export async function logOutAction() {
  const token = await readSessionToken();
  if (token) await logOut(token);
  await clearSessionCookie();
  redirect(ROUTES.adminLogin);
}
