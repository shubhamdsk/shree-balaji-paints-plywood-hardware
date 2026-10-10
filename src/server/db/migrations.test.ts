import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq, sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { MIGRATIONS_FOLDER } from "@/server/db/client";
import { categories, products } from "@/server/db/schema";
import { setupTestDatabase } from "@/test/db";

async function runMigration(db: ReturnType<ReturnType<typeof setupTestDatabase>>, file: string) {
  const statements = (await readFile(path.join(MIGRATIONS_FOLDER, file), "utf8")).split("--> statement-breakpoint");
  for (const statement of statements) await db.execute(sql.raw(statement));
}

async function categoryAndType(db: ReturnType<ReturnType<typeof setupTestDatabase>>, id: string) {
  const [row] = await db.select({ category: products.category, type: products.type }).from(products).where(eq(products.id, id));
  return row;
}

describe("0006_fix_product_categories", () => {
  const getDb = setupTestDatabase();

  it("moves products from the old categories and type names to the current ones", async () => {
    const db = getDb();
    await db.delete(categories).where(sql`${categories.id} in ('plumbing', 'electrical')`);
    await db.execute(sql`
      update products set category = old.category, type = old.type
      from (values
        ('ap-royale-luxury', 'paints', 'Interior'),
        ('ap-wall-primer', 'paints', 'Primer'),
        ('ply-laminate', 'plywood', 'Laminate'),
        ('pl-cpvc-astral', 'plumbing', 'Plumbing'),
        ('el-modular-switch', 'electrical', 'Electrical'),
        ('tool-bosch-drill', 'tools', 'Tools'),
        ('hw-padlock', 'hardware', 'Locks')
      ) as old(id, category, type)
      where products.id = old.id
    `);

    await runMigration(db, "0006_fix_product_categories.sql");

    expect(await categoryAndType(db, "ap-royale-luxury")).toEqual({ category: "paints", type: "Interior Emulsion" });
    expect(await categoryAndType(db, "ap-wall-primer")).toEqual({ category: "paint-preparation", type: "Wall Primer" });
    expect(await categoryAndType(db, "ply-laminate")).toEqual({ category: "laminates", type: "Decorative Laminates" });
    expect(await categoryAndType(db, "pl-cpvc-astral")).toEqual({ category: "plumbing", type: "CPVC Pipes & Fittings" });
    expect(await categoryAndType(db, "el-modular-switch")).toEqual({ category: "electrical", type: "Switches & Sockets" });
    expect(await categoryAndType(db, "tool-bosch-drill")).toEqual({ category: "electrical", type: "Power Tools" });
    expect(await categoryAndType(db, "hw-padlock")).toEqual({ category: "furniture-hardware", type: "Door Locks" });
  });

  it("leaves products the owner has already filed under a current type", async () => {
    const db = getDb();
    await db.update(products).set({ category: "paints", type: "Texture Paint" }).where(eq(products.id, "ap-royale-luxury"));

    await runMigration(db, "0006_fix_product_categories.sql");

    expect(await categoryAndType(db, "ap-royale-luxury")).toEqual({ category: "paints", type: "Texture Paint" });
  });

  it("moves an owner's product left in an old category to its new category", async () => {
    const db = getDb();
    await db.insert(products).values({
      id: "owner-cabinet-hinge",
      name: "Cabinet Hinge",
      brand: "Hettich",
      category: "hardware",
      type: "Cabinet Hinges",
      description: "Soft-close cabinet hinge.",
      sizes: ["Pair"],
      unit: "pair",
    });

    await runMigration(db, "0006_fix_product_categories.sql");

    expect(await categoryAndType(db, "owner-cabinet-hinge")).toEqual({ category: "furniture-hardware", type: "Cabinet Hinges" });
  });
});
