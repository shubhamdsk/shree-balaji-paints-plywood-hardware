import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import type { EnquiryInput } from "@/lib/enquiry";
import { setupTestDatabase } from "@/test/db";
import { cookieJar, requestHeaders } from "@/test/mocks/next-headers";
import { loadEnquiriesAction, submitEnquiryAction, updateEnquiryStatusAction } from "@/server/actions/enquiry";
import { SESSION_COOKIE } from "@/server/auth/session";
import { logIn } from "@/services/auth-service";
import { ENQUIRY_LIMITS, listAdminEnquiries } from "@/services/enquiry-service";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

setupTestDatabase();

const enquiry = (name: string, message: string): EnquiryInput => ({
  name,
  phone: "9876500000",
  productId: "",
  quantity: "",
  message,
});

describe("enquiry server actions", () => {
  beforeEach(() => {
    cookieJar.clear();
  });

  afterEach(() => {
    requestHeaders.delete("cf-connecting-ip");
  });

  async function logInAsOwner() {
    vi.stubEnv("ADMIN_USERNAME", "owner");
    vi.stubEnv("ADMIN_INITIAL_PASSWORD", "owner-password-123");
    const result = await logIn("owner", "owner-password-123");
    if (!result.ok) throw new Error("login failed");
    cookieJar.set(SESSION_COOKIE, { value: result.token });
  }

  test("submitEnquiryAction validates and creates a lead", async () => {
    const res = await submitEnquiryAction(enquiry("Anil", "Required primer paint cans"));

    expect(res.ok).toBe(true);
    const { items } = await listAdminEnquiries();
    expect(items.map((e) => e.name)).toEqual(["Anil"]);
  });

  test("pretends to accept an enquiry with the hidden website field filled, without saving it", async () => {
    expect(await submitEnquiryAction(enquiry("Bot", "Cheap backlinks for sale"), "https://spam.example")).toEqual({
      ok: true,
    });
    expect((await listAdminEnquiries()).items).toEqual([]);
  });

  test("stops one visitor from sending too many enquiries in an hour", async () => {
    requestHeaders.set("cf-connecting-ip", "203.0.113.7");
    for (let i = 0; i < ENQUIRY_LIMITS.perClientPerHour; i++) {
      expect((await submitEnquiryAction(enquiry("Anil", `Enquiry number ${i}`))).ok).toBe(true);
    }

    const blocked = await submitEnquiryAction(enquiry("Anil", "One more enquiry"));
    expect(blocked).toEqual({ ok: false, message: expect.stringMatching(/call or WhatsApp/) });

    requestHeaders.set("cf-connecting-ip", "203.0.113.8");
    expect((await submitEnquiryAction(enquiry("Sunita", "Another customer"))).ok).toBe(true);
    const stored = (await listAdminEnquiries()).items;
    expect(stored).toHaveLength(ENQUIRY_LIMITS.perClientPerHour + 1);
    expect(JSON.stringify(stored)).not.toContain("203.0.113");
  });

  test("updateEnquiryStatusAction requires owner login and updates status", async () => {
    const { id } = await submitEnquiryAction(enquiry("Prakash", "Plywood quote requested"));

    await expect(updateEnquiryStatusAction(id!, "contacted")).rejects.toThrow();

    await logInAsOwner();
    expect((await updateEnquiryStatusAction(id!, "contacted", "WhatsApp message sent")).ok).toBe(true);

    const { items } = await listAdminEnquiries({ status: "contacted" });
    expect(items.map((e) => e.notes)).toEqual(["WhatsApp message sent"]);
  });

  test("updateEnquiryStatusAction rejects notes with hidden characters or over the limit", async () => {
    const { id } = await submitEnquiryAction(enquiry("Prakash", "Plywood quote requested"));
    await logInAsOwner();

    expect((await updateEnquiryStatusAction(id!, "contacted", "Called\u200B back")).ok).toBe(false);
    expect((await updateEnquiryStatusAction(id!, "contacted", "x".repeat(501))).ok).toBe(false);
    expect((await updateEnquiryStatusAction(id!, "contacted", "Quote sent 👍")).ok).toBe(true);
  });

  test("loadEnquiriesAction requires owner login and checks the filter", async () => {
    await submitEnquiryAction(enquiry("Prakash", "Plywood quote requested"));
    await expect(loadEnquiriesAction({ status: "new" })).rejects.toThrow();

    await logInAsOwner();
    const page = await loadEnquiriesAction({ status: "new", search: "plywood" });
    expect(page?.items.map((e) => e.name)).toEqual(["Prakash"]);
    expect(await loadEnquiriesAction({ status: "spam" as "new" })).toBeNull();
  });
});
