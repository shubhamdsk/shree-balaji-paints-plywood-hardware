import { describe, expect, test, vi } from "vitest";
import type { EnquiryInput } from "@/lib/enquiry";
import { enquiries } from "@/server/db/schema";
import { logIn } from "@/services/auth-service";
import {
  createCustomerEnquiry,
  ENQUIRY_LIMITS,
  getEnquiryCounts,
  isEnquiryLimitReached,
  listAdminEnquiries,
  updateEnquiryStatus,
} from "@/services/enquiry-service";
import { setupTestDatabase } from "@/test/db";
import type { AdminUser } from "@/types";

const db = setupTestDatabase();

async function getTestOwner(): Promise<AdminUser> {
  vi.stubEnv("ADMIN_USERNAME", "owner");
  vi.stubEnv("ADMIN_INITIAL_PASSWORD", "owner-password-123");
  const res = await logIn("owner", "owner-password-123");
  if (!res.ok) throw new Error("login failed");
  return res.user;
}

function enquiry(name: string, message: string, extra: Partial<EnquiryInput> = {}): EnquiryInput {
  return { name, phone: "9876543210", productId: "", quantity: "", message, ...extra };
}

async function insertEnquiries(count: number, clientHash: string | null, createdAt = new Date()) {
  await db()
    .insert(enquiries)
    .values(
      Array.from({ length: count }, (_, i) => ({
        id: `enq_bulk_${clientHash}_${i}`,
        name: `Customer ${i}`,
        message: "Bulk enquiry",
        clientHash,
        createdAt,
      })),
    );
}

describe("enquiry-service", () => {
  test("creates a customer enquiry and counts it as new", async () => {
    const record = await createCustomerEnquiry(
      enquiry("Ramesh Patil", "Need 50 litres Royale Luxury Emulsion for house painting"),
    );

    expect(record.id).toMatch(/^enq_/);
    expect(record.name).toBe("Ramesh Patil");
    expect(record.status).toBe("new");
    expect(await getEnquiryCounts()).toEqual({ all: 1, new: 1, contacted: 0, closed: 0 });
  });

  test("lists enquiries by status, newest first", async () => {
    const owner = await getTestOwner();
    const e1 = await createCustomerEnquiry(enquiry("Suresh", "Looking for Marine Plywood sheet rates"));
    await new Promise((resolve) => setTimeout(resolve, 5));
    const e2 = await createCustomerEnquiry(enquiry("Mahesh", "Asian Paints Apex Ultima required"));

    await updateEnquiryStatus(owner, e1.id, "contacted", "Called and sent quote on WhatsApp");

    expect((await listAdminEnquiries()).items.map((e) => e.id)).toEqual([e2.id, e1.id]);
    expect((await listAdminEnquiries({ status: "new" })).items.map((e) => e.id)).toEqual([e2.id]);
    const contacted = await listAdminEnquiries({ status: "contacted" });
    expect(contacted.items.map((e) => e.notes)).toEqual(["Called and sent quote on WhatsApp"]);
    expect(await getEnquiryCounts()).toEqual({ all: 2, new: 1, contacted: 1, closed: 0 });
  });

  test("pages through enquiries without repeating or skipping any", async () => {
    await insertEnquiries(5, "same-time");

    const first = await listAdminEnquiries({}, 2);
    expect(first.items).toHaveLength(2);
    const second = await listAdminEnquiries({ after: first.next! }, 2);
    const third = await listAdminEnquiries({ after: second.next! }, 2);

    expect(third.next).toBeNull();
    const ids = [...first.items, ...second.items, ...third.items].map((e) => e.id);
    expect(new Set(ids).size).toBe(5);
  });

  test("searches every word across name, phone, product, message and notes", async () => {
    const owner = await getTestOwner();
    const plywood = await createCustomerEnquiry(enquiry("Amit Kumar", "Commercial plywood sheet prices?"));
    await createCustomerEnquiry(enquiry("Rajesh Shinde", "Need 20L royale emulsion, 100% acrylic"));
    await updateEnquiryStatus(owner, plywood.id, "contacted", "Quoted per sheet");

    const names = async (search: string) => (await listAdminEnquiries({ search })).items.map((e) => e.name);
    expect(await names("PLYWOOD amit")).toEqual(["Amit Kumar"]);
    expect(await names("quoted")).toEqual(["Amit Kumar"]);
    expect(await names("100%")).toEqual(["Rajesh Shinde"]);
    expect(await names("_")).toEqual([]);
  });

  test("updates status to closed with audit logging", async () => {
    const owner = await getTestOwner();
    const e = await createCustomerEnquiry(enquiry("Kiran", "Hardware fittings requirement", { quantity: "10 pcs" }));

    const updated = await updateEnquiryStatus(owner, e.id, "closed", "Order delivered and payment received");
    expect(updated?.status).toBe("closed");
    expect(updated?.notes).toBe("Order delivered and payment received");
    expect(await getEnquiryCounts()).toMatchObject({ closed: 1, new: 0 });
  });

  test("limits enquiries from one client per hour", async () => {
    await insertEnquiries(ENQUIRY_LIMITS.perClientPerHour, "client-a");

    expect(await isEnquiryLimitReached("client-a")).toBe(true);
    expect(await isEnquiryLimitReached("client-b")).toBe(false);
    expect(await isEnquiryLimitReached(null)).toBe(false);
  });

  test("forgets a client's enquiries after an hour", async () => {
    await insertEnquiries(ENQUIRY_LIMITS.perClientPerHour, "client-a", new Date(Date.now() - 2 * 3_600_000));
    expect(await isEnquiryLimitReached("client-a")).toBe(false);
  });

  test("caps the total enquiries in a day", async () => {
    await insertEnquiries(ENQUIRY_LIMITS.perDay, null);
    expect(await isEnquiryLimitReached("client-b")).toBe(true);
  });
});
