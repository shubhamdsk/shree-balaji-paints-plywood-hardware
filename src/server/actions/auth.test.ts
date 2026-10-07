import { beforeEach, describe, expect, it, vi } from "vitest";
import { ROUTES } from "@/lib/routes";
import { logInAction, logOutAction } from "@/server/actions/auth";
import { SESSION_COOKIE } from "@/server/auth/session";
import { findSessionUser } from "@/services/auth-service";
import { setupTestDatabase } from "@/test/db";
import { cookieJar } from "@/test/mocks/next-headers";
import { RedirectSignal } from "@/test/mocks/next-navigation";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

setupTestDatabase();
const PASSWORD = "owner-password-123";

beforeEach(() => {
  cookieJar.clear();
  vi.stubEnv("ADMIN_USERNAME", "owner");
  vi.stubEnv("ADMIN_INITIAL_PASSWORD", PASSWORD);
});

function loginForm(username: string, password: string) {
  const formData = new FormData();
  formData.set("username", username);
  formData.set("password", password);
  return formData;
}

describe("logInAction", () => {
  it("asks for both fields", async () => {
    expect(await logInAction({}, loginForm(" ", ""))).toEqual({ error: "Enter your username and password.", username: " " });
  });

  it("keeps the username and gives one message for any wrong login", async () => {
    expect(await logInAction({}, loginForm("owner", "wrong-password"))).toEqual({
      error: "Incorrect username or password",
      username: "owner",
    });
    expect(await logInAction({}, loginForm("nobody", PASSWORD))).toEqual({
      error: "Incorrect username or password",
      username: "nobody",
    });
  });

  it("says when the login is locked", async () => {
    for (let attempt = 0; attempt < 4; attempt++) await logInAction({}, loginForm("owner", "wrong-password"));
    expect(await logInAction({}, loginForm("owner", "wrong-password"))).toEqual({
      error: "Too many wrong tries. Login is locked for 15 minutes.",
      username: "owner",
    });
  });

  it("sets a secure session cookie for the owner panel and opens the dashboard", async () => {
    await expect(logInAction({}, loginForm("owner", PASSWORD))).rejects.toEqual(new RedirectSignal(ROUTES.admin));

    const cookie = cookieJar.get(SESSION_COOKIE);
    expect(cookie?.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: ROUTES.admin });
    expect(await findSessionUser(cookie!.value)).toMatchObject({ username: "owner" });
  });
});

describe("logOutAction", () => {
  it("ends the session, clears the cookie and returns to the login page", async () => {
    await logInAction({}, loginForm("owner", PASSWORD)).catch(() => undefined);
    const token = cookieJar.get(SESSION_COOKIE)!.value;

    await expect(logOutAction()).rejects.toEqual(new RedirectSignal(ROUTES.adminLogin));
    expect(cookieJar.has(SESSION_COOKIE)).toBe(false);
    expect(await findSessionUser(token)).toBeNull();
  });
});
