import { sql } from "drizzle-orm";
import { beforeAll, beforeEach } from "vitest";
import { createLocalDatabase, setDatabase, type Database } from "@/server/db/client";
import { seedCatalog } from "@/server/db/seed";

export function setupTestDatabase() {
  let db: Database;

  beforeAll(async () => {
    db = await createLocalDatabase();
  }, 30_000);

  beforeEach(async () => {
    await db.execute(
      sql`truncate table products, enquiries, categories, subcategories, gallery, audit_log, sessions, admin_users restart identity cascade`,
    );
    await seedCatalog(db);
    setDatabase(db);
  });

  return () => db;
}
