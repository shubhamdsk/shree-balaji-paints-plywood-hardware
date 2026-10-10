import { sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { seedCatalog } from "@/server/db/seed";
import { setupTestDatabase } from "@/test/db";

describe("seedCatalog", () => {
  const getDb = setupTestDatabase();

  it("reports nothing seeded when the catalogue already has data", async () => {
    expect(await seedCatalog(getDb())).toBe(false);
  });

  it("seeds an empty catalogue and reports it", async () => {
    await getDb().execute(sql`truncate table products, categories, subcategories, gallery restart identity cascade`);

    expect(await seedCatalog(getDb())).toBe(true);
    const [{ total }] = (await getDb().execute(sql`select count(*)::int as total from products`)).rows as { total: number }[];
    expect(total).toBeGreaterThan(0);
  });
});
