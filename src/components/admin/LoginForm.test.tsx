import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginForm from "@/components/admin/LoginForm";
import { setupTestDatabase } from "@/test/db";
import { renderWithProviders } from "@/test/render";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/link", () => import("@/test/mocks/next-link"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

setupTestDatabase();

beforeEach(() => {
  vi.stubEnv("ADMIN_USERNAME", "owner");
  vi.stubEnv("ADMIN_INITIAL_PASSWORD", "owner-password-123");
});

describe("LoginForm", () => {
  it("labels both fields for password managers", () => {
    renderWithProviders(<LoginForm />);
    expect(screen.getByLabelText(/Username/).getAttribute("autocomplete")).toBe("username");
    expect(screen.getByLabelText(/Password/).getAttribute("autocomplete")).toBe("current-password");
  });

  it("asks for the missing details next to each field before sending anything", async () => {
    const { user } = renderWithProviders(<LoginForm />);
    await user.click(screen.getByRole("button", { name: "Log in" }));

    const username = screen.getByLabelText(/Username/);
    const password = screen.getByLabelText(/Password/);
    expect(document.getElementById(username.getAttribute("aria-describedby")!)?.textContent).toBe("Enter your username");
    expect(document.getElementById(password.getAttribute("aria-describedby")!)?.textContent).toBe("Enter your password");
    expect(password.getAttribute("aria-invalid")).toBe("true");
    expect(document.activeElement).toBe(username);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("keeps the username after a wrong password", async () => {
    const { user } = renderWithProviders(<LoginForm />);
    await user.type(screen.getByLabelText(/Username/), "owner");
    await user.type(screen.getByLabelText(/Password/), "wrong-password");
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect((await screen.findByRole("alert")).textContent).toBe("Incorrect username or password");
    expect(screen.getByLabelText(/Username/)).toHaveProperty("value", "owner");
    expect(screen.getByLabelText(/Password/)).toHaveProperty("value", "");
  });
});
