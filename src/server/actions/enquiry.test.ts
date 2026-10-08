import { beforeEach, describe, expect, test, vi } from "vitest";
import { setupTestDatabase } from "@/test/db";
import { cookieJar } from "@/test/mocks/next-headers";
import { submitEnquiryAction, updateEnquiryStatusAction } from "@/server/actions/enquiry";
import { SESSION_COOKIE } from "@/server/auth/session";
import { logIn } from "@/services/auth-service";
import { listAdminEnquiries } from "@/services/enquiry-service";

vi.mock("next/headers", () => import("@/test/mocks/next-headers"));
vi.mock("next/navigation", () => import("@/test/mocks/next-navigation"));

setupTestDatabase();

describe("enquiry server actions", () => {
  beforeEach(async () => {
    cookieJar.clear();
  });

  async function logInAsOwner() {
    vi.stubEnv("ADMIN_USERNAME", "owner");
    vi.stubEnv("ADMIN_INITIAL_PASSWORD", "owner-password-123");
    const result = await logIn("owner", "owner-password-123");
    if (!result.ok) throw new Error("login failed");
    cookieJar.set(SESSION_COOKIE, { value: result.token });
  }

  test("submitEnquiryAction validates and creates a lead", async () => {
    const res = await submitEnquiryAction({
      name: "Anil",
      phone: "9876500000",
      productId: "",
      quantity: "",
      message: "Required primer paint cans",
    });

    expect(res.ok).toBe(true);
    const list = await listAdminEnquiries("all");
    expect(list.length).toBe(1);
    expect(list[0].name).toBe("Anil");
  });

  test("updateEnquiryStatusAction requires owner login and updates status", async () => {
    const submitRes = await submitEnquiryAction({
      name: "Prakash",
      phone: "9876511111",
      productId: "",
      quantity: "",
      message: "Plywood quote requested",
    });
    const id = submitRes.id!;

    // Unauthorized without session throws RedirectSignal
    await expect(updateEnquiryStatusAction(id, "contacted")).rejects.toThrow();

    // Log in owner
    await logInAsOwner();

    const updateRes = await updateEnquiryStatusAction(id, "contacted", "WhatsApp message sent");
    expect(updateRes.ok).toBe(true);

    const list = await listAdminEnquiries("contacted");
    expect(list.length).toBe(1);
    expect(list[0].notes).toBe("WhatsApp message sent");
  });
});
