import { and, count, eq, notExists, sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { products, subcategories } from "@/server/db/schema";
import { seedCatalog } from "@/server/db/seed";
import { setupTestDatabase } from "@/test/db";

describe("seedCatalog", () => {
  const getDb = setupTestDatabase();

  it("reports nothing seeded when the catalogue already has data", async () => {
    expect(await seedCatalog(getDb())).toBe(false);
  });

  it("files every demo product under a type of its own category", async () => {
    const misfiled = await getDb()
      .select({ id: products.id })
      .from(products)
      .where(
        notExists(
          getDb()
            .select()
            .from(subcategories)
            .where(and(eq(subcategories.categoryId, products.category), eq(subcategories.name, products.type))),
        ),
      );
    expect(misfiled).toEqual([]);
  });

  it("seeds an empty catalogue and reports it", async () => {
    await getDb().execute(sql`truncate table products, categories, subcategories, gallery restart identity cascade`);

    expect(await seedCatalog(getDb())).toBe(true);
    const [{ total }] = await getDb().select({ total: count() }).from(products);
    expect(total).toBeGreaterThan(0);
  });
});
