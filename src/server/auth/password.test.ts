import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "@/server/auth/password";

describe("password hashing", () => {
  it("verifies the right password and rejects a wrong one", async () => {
    const stored = await hashPassword("shop-owner-secret");
    expect(stored).toMatch(/^scrypt\$[^$]+\$[^$]+$/);
    expect(await verifyPassword("shop-owner-secret", stored)).toBe(true);
    expect(await verifyPassword("shop-owner-Secret", stored)).toBe(false);
  });

  it("salts every hash", async () => {
    expect(await hashPassword("same-password")).not.toBe(await hashPassword("same-password"));
  });

  it("rejects stored values in an unknown format", async () => {
    expect(await verifyPassword("anything", "plain-text")).toBe(false);
    expect(await verifyPassword("anything", "bcrypt$abc$def")).toBe(false);
  });
});
