import { describe, expect, it } from "vitest";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, validateLogin, validatePasswordChange } from "@/lib/password-rules";

describe("validateLogin", () => {
  it("asks for both details and accepts any filled-in pair", () => {
    expect(validateLogin({ username: " ", password: "" })).toEqual({
      username: "Enter your username",
      password: "Enter your password",
    });
    expect(validateLogin({ username: "owner", password: "x" })).toEqual({});
  });
});

const valid = { currentPassword: "old-password-1", newPassword: "green door 42 lamp", confirmPassword: "green door 42 lamp" };

describe("validatePasswordChange", () => {
  it("accepts a new password that is long enough and typed the same twice", () => {
    expect(validatePasswordChange(valid)).toEqual({});
  });

  it("asks for the current password", () => {
    expect(validatePasswordChange({ ...valid, currentPassword: "" })).toEqual({
      currentPassword: "Enter your current password",
    });
  });

  it("enforces the length limits", () => {
    const short = "a".repeat(MIN_PASSWORD_LENGTH - 1);
    expect(validatePasswordChange({ ...valid, newPassword: short, confirmPassword: short })).toEqual({
      newPassword: `Use at least ${MIN_PASSWORD_LENGTH} characters`,
    });
    const long = "a".repeat(MAX_PASSWORD_LENGTH + 1);
    expect(validatePasswordChange({ ...valid, newPassword: long, confirmPassword: long })).toEqual({
      newPassword: `Use at most ${MAX_PASSWORD_LENGTH} characters`,
    });
  });

  it("rejects reusing the current password", () => {
    expect(validatePasswordChange({ ...valid, newPassword: valid.currentPassword, confirmPassword: valid.currentPassword })).toEqual({
      newPassword: "Choose a password different from the current one",
    });
  });

  it("asks for the same new password twice", () => {
    expect(validatePasswordChange({ ...valid, confirmPassword: "green door 42 lamb" })).toEqual({
      confirmPassword: "The two new passwords don't match",
    });
  });
});
