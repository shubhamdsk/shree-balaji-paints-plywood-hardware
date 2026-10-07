import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";
import { logIn } from "@/services/auth-service";
import { SESSION_COOKIE } from "@/server/auth/session";
import { setupTestDatabase } from "@/test/db";
import { cookieJar } from "@/test/mocks/next-headers";
import { renderWithProviders } from "@/test/render";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

setupTestDatabase();
const PASSWORD = "owner-password-123";
const NEW_PASSWORD = "green door 42 lamp";

beforeEach(async () => {
  cookieJar.clear();
  vi.stubEnv("ADMIN_USERNAME", "owner");
  vi.stubEnv("ADMIN_INITIAL_PASSWORD", PASSWORD);
  const result = await logIn("owner", PASSWORD);
  if (!result.ok) throw new Error("login failed");
  cookieJar.set(SESSION_COOKIE, { value: result.token });
});

describe("ChangePasswordForm", () => {
  it("tells password managers which field is which", () => {
    renderWithProviders(<ChangePasswordForm />);
    expect(screen.getByLabelText(/Current password/).getAttribute("autocomplete")).toBe("current-password");
    expect(screen.getByLabelText(/^New password/).getAttribute("autocomplete")).toBe("new-password");
    expect(screen.getByLabelText(/Type the new password again/).getAttribute("autocomplete")).toBe("new-password");
  });

  it("links each error to its field", async () => {
    const { user } = renderWithProviders(<ChangePasswordForm />);
    await user.type(screen.getByLabelText(/Current password/), PASSWORD);
    await user.type(screen.getByLabelText(/^New password/), NEW_PASSWORD);
    await user.type(screen.getByLabelText(/Type the new password again/), "green door 42 lamb");
    await user.click(screen.getByRole("button", { name: "Change password" }));

    const confirm = screen.getByLabelText(/Type the new password again/);
    expect(await screen.findByText("The two new passwords don't match")).toHaveProperty("id", "confirmPassword-error");
    expect(confirm.getAttribute("aria-describedby")).toBe("confirmPassword-error");
    expect(confirm.getAttribute("aria-invalid")).toBe("true");
  });

  it("says when the current password is wrong", async () => {
    const { user } = renderWithProviders(<ChangePasswordForm />);
    await user.type(screen.getByLabelText(/Current password/), "wrong-password");
    await user.type(screen.getByLabelText(/^New password/), NEW_PASSWORD);
    await user.type(screen.getByLabelText(/Type the new password again/), NEW_PASSWORD);
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect(await screen.findByText("Your current password is not correct")).toBeTruthy();
  });

  it("confirms the change and clears the fields", async () => {
    const { user } = renderWithProviders(<ChangePasswordForm />);
    await user.type(screen.getByLabelText(/Current password/), PASSWORD);
    await user.type(screen.getByLabelText(/^New password/), NEW_PASSWORD);
    await user.type(screen.getByLabelText(/Type the new password again/), NEW_PASSWORD);
    await user.click(screen.getByRole("button", { name: "Change password" }));

    expect((await screen.findByRole("status")).textContent).toContain("Password changed");
    expect(screen.getByLabelText(/Current password/)).toHaveProperty("value", "");
    expect((await logIn("owner", NEW_PASSWORD)).ok).toBe(true);
  });
});
