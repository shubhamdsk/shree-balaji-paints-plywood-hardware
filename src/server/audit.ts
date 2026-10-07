import type { Database } from "@/server/db/client";
import { auditLog } from "@/server/db/schema";

export type AuditAction =
  | "login"
  | "login_failed"
  | "login_locked"
  | "logout"
  | "password_changed"
  | "password_change_failed"
  | "product_create"
  | "product_update"
  | "product_stock"
  | "product_featured"
  | "product_visibility";

interface AuditEntry {
  userId: number | null;
  action: AuditAction;
  entity: "admin_user" | "product";
  entityId?: string | null;
  before?: unknown;
  after?: unknown;
}

type Writer = Pick<Database, "insert">;

export async function writeAudit(db: Writer, entry: AuditEntry) {
  await db.insert(auditLog).values({ ...entry, entityId: entry.entityId ?? null });
}
