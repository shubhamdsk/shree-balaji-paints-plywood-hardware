import { describe, expect, it, vi } from "vitest";
import { createSessionToken, hashSessionToken } from "@/server/auth/session-token";

describe("session tokens", () => {
  it("creates long random tokens", () => {
    const token = createSessionToken();
    expect(token).toMatch(/^[\w-]{43}$/);
    expect(createSessionToken()).not.toBe(token);
  });

  it("stores a keyed hash, never the token itself", () => {
    vi.stubEnv("SESSION_SECRET", "a".repeat(32));
    const hash = hashSessionToken("token");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
    expect(hashSessionToken("token")).toBe(hash);

    vi.stubEnv("SESSION_SECRET", "b".repeat(32));
    expect(hashSessionToken("token")).not.toBe(hash);
  });

  it("refuses to run in production without a strong secret", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("SESSION_SECRET", "short");
    expect(() => hashSessionToken("token")).toThrow("SESSION_SECRET");
  });
});
