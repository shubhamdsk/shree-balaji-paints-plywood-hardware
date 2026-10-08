import { describe, expect, test, vi } from "vitest";
import { logIn } from "@/services/auth-service";
import { createCustomerEnquiry, getEnquiryCounts, listAdminEnquiries, updateEnquiryStatus } from "@/services/enquiry-service";
import { setupTestDatabase } from "@/test/db";
import type { AdminUser } from "@/types";

setupTestDatabase();

async function getTestOwner(): Promise<AdminUser> {
  vi.stubEnv("ADMIN_USERNAME", "owner");
  vi.stubEnv("ADMIN_INITIAL_PASSWORD", "owner-password-123");
  const res = await logIn("owner", "owner-password-123");
  if (!res.ok) throw new Error("login failed");
  return res.user;
}

describe("enquiry-service", () => {
  test("creates a customer enquiry and counts it as new", async () => {
    const record = await createCustomerEnquiry({
      name: "Ramesh Patil",
      phone: "9876543210",
      productId: "",
      quantity: "",
      message: "Need 50 litres Royale Luxury Emulsion for house painting",
    });

    expect(record.id).toMatch(/^enq_/);
    expect(record.name).toBe("Ramesh Patil");
    expect(record.status).toBe("new");

    const counts = await getEnquiryCounts();
    expect(counts.total).toBe(1);
    expect(counts.newCount).toBe(1);
  });

  test("lists enquiries by status filter", async () => {
    const owner = await getTestOwner();
    const e1 = await createCustomerEnquiry({
      name: "Suresh",
      phone: "9876543210",
      productId: "",
      quantity: "5 sheets",
      message: "Looking for Marine Plywood sheet rates",
    });
    const e2 = await createCustomerEnquiry({
      name: "Mahesh",
      phone: "9876543211",
      productId: "",
      quantity: "2 cans",
      message: "Asian Paints Apex Ultima required",
    });

    await updateEnquiryStatus(owner, e1.id, "contacted", "Called and sent quote on WhatsApp");

    const all = await listAdminEnquiries("all");
    expect(all.length).toBe(2);

    const newLeads = await listAdminEnquiries("new");
    expect(newLeads.length).toBe(1);
    expect(newLeads[0].id).toBe(e2.id);

    const contactedLeads = await listAdminEnquiries("contacted");
    expect(contactedLeads.length).toBe(1);
    expect(contactedLeads[0].notes).toBe("Called and sent quote on WhatsApp");
  });

  test("updates status to closed with audit logging", async () => {
    const owner = await getTestOwner();
    const e = await createCustomerEnquiry({
      name: "Kiran",
      phone: "9876543212",
      productId: "",
      quantity: "10 pcs",
      message: "Hardware fittings requirement",
    });

    const updated = await updateEnquiryStatus(owner, e.id, "closed", "Order delivered and payment received");
    expect(updated?.status).toBe("closed");
    expect(updated?.notes).toBe("Order delivered and payment received");

    const counts = await getEnquiryCounts();
    expect(counts.closed).toBe(1);
    expect(counts.newCount).toBe(0);
  });
});
