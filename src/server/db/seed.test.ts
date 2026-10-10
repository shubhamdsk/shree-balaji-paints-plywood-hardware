import { count, sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { products } from "@/server/db/schema";
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
    const [{ total }] = await getDb().select({ total: count() }).from(products);
    expect(total).toBeGreaterThan(0);
  });
});
