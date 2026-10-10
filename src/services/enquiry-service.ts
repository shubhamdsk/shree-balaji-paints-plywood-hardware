import { desc, eq } from "drizzle-orm";
import type { EnquiryInput } from "@/lib/enquiry";
import { writeAudit } from "@/server/audit";
import { getDb, withTransaction } from "@/server/db/client";
import { enquiries, type EnquiryRow } from "@/server/db/schema";
import { getAdminProduct } from "@/services/admin-product-service";
import type { AdminUser, EnquiryRecord, EnquiryStatus } from "@/types";

function toEnquiryRecord(row: EnquiryRow): EnquiryRecord {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? undefined,
    productId: row.productId ?? undefined,
    productName: row.productName ?? undefined,
    quantity: row.quantity ?? undefined,
    message: row.message,
    status: (row.status as EnquiryStatus) ?? "new",
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function createCustomerEnquiry(input: EnquiryInput): Promise<EnquiryRecord> {
  const db = await getDb();
  let productName: string | undefined;

  if (input.productId) {
    const product = await getAdminProduct(input.productId);
    if (product) productName = product.name;
  }

  const id = `enq_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();

  const [row] = await db
    .insert(enquiries)
    .values({
      id,
      name: input.name.trim(),
      phone: input.phone ? input.phone.trim() : null,
      productId: input.productId ? input.productId.trim() : null,
      productName: productName ?? null,
      quantity: input.quantity ? input.quantity.trim() : null,
      message: input.message.trim(),
      status: "new",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return toEnquiryRecord(row);
}

export async function listAdminEnquiries(statusFilter?: EnquiryStatus | "all"): Promise<EnquiryRecord[]> {
  const db = await getDb();
  const rows = await db.select().from(enquiries).orderBy(desc(enquiries.createdAt));
  const records = rows.map(toEnquiryRecord);

  if (!statusFilter || statusFilter === "all") {
    return records;
  }
  return records.filter((r) => r.status === statusFilter);
}

export async function getEnquiryCounts() {
  const records = await listAdminEnquiries("all");
  return {
    total: records.length,
    newCount: records.filter((r) => r.status === "new").length,
    contacted: records.filter((r) => r.status === "contacted").length,
    closed: records.filter((r) => r.status === "closed").length,
  };
}

export async function updateEnquiryStatus(
  actor: AdminUser,
  id: string,
  status: EnquiryStatus,
  notes?: string,
): Promise<EnquiryRecord | null> {
  return withTransaction(async (tx) => {
    const [before] = await tx.select().from(enquiries).where(eq(enquiries.id, id));
    if (!before) return null;

    const now = new Date();
    const [after] = await tx
      .update(enquiries)
      .set({
        status,
        ...(notes !== undefined && { notes }),
        updatedAt: now,
      })
      .where(eq(enquiries.id, id))
      .returning();

    await writeAudit(tx, {
      userId: actor.id,
      action: "enquiry_update_status",
      entity: "enquiry",
      entityId: id,
      before: { status: before.status, notes: before.notes },
      after: { status: after.status, notes: after.notes },
    });

    return toEnquiryRecord(after);
  });
}
