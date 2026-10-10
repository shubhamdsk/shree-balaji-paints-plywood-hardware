import { and, count, desc, eq, gt, ilike, lt, or, sql } from "drizzle-orm";
import type { EnquiryInput } from "@/lib/enquiry";
import { writeAudit } from "@/server/audit";
import { getDb, withTransaction } from "@/server/db/client";
import { enquiries, type EnquiryRow } from "@/server/db/schema";
import { getAdminProduct } from "@/services/admin-product-service";
import type {
  AdminUser,
  EnquiryCounts,
  EnquiryCursor,
  EnquiryPage,
  EnquiryQuery,
  EnquiryRecord,
  EnquiryStatus,
} from "@/types";

export const ENQUIRY_PAGE_SIZE = 50;
export const ENQUIRY_LIMITS = { perClientPerHour: 5, perDay: 200 } as const;
const HOUR_MS = 3_600_000;
const DAY_MS = 24 * HOUR_MS;

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

export async function createCustomerEnquiry(input: EnquiryInput, clientHash?: string | null): Promise<EnquiryRecord> {
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
      clientHash: clientHash ?? null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  return toEnquiryRecord(row);
}

const SEARCHED_COLUMNS = [enquiries.name, enquiries.phone, enquiries.productName, enquiries.message, enquiries.notes];

function matchesEveryWord(search: string) {
  const words = search.toLowerCase().split(/\s+/).filter(Boolean);
  return words.map((word) => {
    const pattern = `%${word.replace(/[\\%_]/g, "\\$&")}%`;
    return or(...SEARCHED_COLUMNS.map((column) => ilike(column, pattern)));
  });
}

function olderThan(cursor: EnquiryCursor) {
  const createdAt = new Date(cursor.createdAt);
  return or(lt(enquiries.createdAt, createdAt), and(eq(enquiries.createdAt, createdAt), lt(enquiries.id, cursor.id)));
}

export async function listAdminEnquiries(
  { status = "all", search = "", after }: EnquiryQuery = {},
  pageSize = ENQUIRY_PAGE_SIZE,
): Promise<EnquiryPage> {
  const db = await getDb();
  const rows = await db
    .select()
    .from(enquiries)
    .where(
      and(
        status === "all" ? undefined : eq(enquiries.status, status),
        ...matchesEveryWord(search),
        after && olderThan(after),
      ),
    )
    .orderBy(desc(enquiries.createdAt), desc(enquiries.id))
    .limit(pageSize + 1);
  const items = rows.slice(0, pageSize).map(toEnquiryRecord);
  const last = items.at(-1);
  return { items, next: rows.length > pageSize && last ? { createdAt: last.createdAt, id: last.id } : null };
}

export async function getEnquiryCounts(): Promise<EnquiryCounts> {
  const db = await getDb();
  const rows = await db.select({ status: enquiries.status, total: count() }).from(enquiries).groupBy(enquiries.status);
  const counts: EnquiryCounts = { all: 0, new: 0, contacted: 0, closed: 0 };
  for (const row of rows) {
    counts.all += row.total;
    if (row.status in counts) counts[row.status as EnquiryStatus] += row.total;
  }
  return counts;
}

export async function isEnquiryLimitReached(clientHash: string | null, now = new Date()): Promise<boolean> {
  const db = await getDb();
  const hourAgo = new Date(now.getTime() - HOUR_MS);
  const [row] = await db
    .select({
      today: count(),
      fromClient: clientHash
        ? count(sql`case when ${enquiries.clientHash} = ${clientHash} and ${enquiries.createdAt} > ${hourAgo.toISOString()} then 1 end`)
        : sql<number>`0`.mapWith(Number),
    })
    .from(enquiries)
    .where(gt(enquiries.createdAt, new Date(now.getTime() - DAY_MS)));
  return row.today >= ENQUIRY_LIMITS.perDay || row.fromClient >= ENQUIRY_LIMITS.perClientPerHour;
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
