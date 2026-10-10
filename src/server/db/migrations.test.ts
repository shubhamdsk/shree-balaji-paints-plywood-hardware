import { readFile } from "node:fs/promises";
import path from "node:path";
import { eq, inArray, sql } from "drizzle-orm";
import { describe, expect, it } from "vitest";
import { MIGRATIONS_FOLDER } from "@/server/db/client";
import { categories, products, subcategories } from "@/server/db/schema";
import { setupTestDatabase } from "@/test/db";

type Db = ReturnType<ReturnType<typeof setupTestDatabase>>;

async function runMigration(db: Db, file: string) {
  const statements = (await readFile(path.join(MIGRATIONS_FOLDER, file), "utf8")).split("--> statement-breakpoint");
  for (const statement of statements) await db.execute(sql.raw(statement));
}

async function upgrade(db: Db) {
  await runMigration(db, "0006_fix_product_categories.sql");
  await runMigration(db, "0009_restructure_categories.sql");
}

async function placement(db: Db, id: string) {
  const [row] = await db
    .select({ category: products.category, type: products.type, subcategoryId: products.subcategoryId })
    .from(products)
    .where(eq(products.id, id));
  return row;
}

const unsoldProduct = (id: string, category: string, type: string) => ({
  id,
  name: id,
  brand: "Demo",
  category,
  type,
  description: "",
  sizes: ["1"],
  unit: "piece",
});

async function addPlumbingCategory(db: Db) {
  await db.insert(categories).values({ id: "plumbing", name: "Plumbing", slug: "plumbing" });
  await db.insert(subcategories).values({ id: "plumbing-pipes", categoryId: "plumbing", name: "Pipes", slug: "pipes" });
}

describe("upgrading a live catalogue to the 10-category taxonomy", () => {
  const getDb = setupTestDatabase();

  it("moves old categories and types to the new ones and links each product to its subcategory", async () => {
    const db = getDb();
    await db.update(products).set({ subcategoryId: null });
    await db.execute(sql`
      update products set category = old.category, type = old.type
      from (values
        ('ap-royale-luxury', 'paints', 'Interior'),
        ('ap-wall-primer', 'paints', 'Primer'),
        ('ply-laminate', 'plywood', 'Laminate'),
        ('hw-padlock', 'hardware', 'Locks'),
        ('tool-paint-kit', 'tools', 'Tools')
      ) as old(id, category, type)
      where products.id = old.id
    `);

    await upgrade(db);

    expect(await placement(db, "ap-royale-luxury")).toEqual({
      category: "paints",
      type: "Interior Emulsion",
      subcategoryId: "paints-interior-emulsion",
    });
    expect(await placement(db, "ap-wall-primer")).toMatchObject({ subcategoryId: "paint-preparation-wall-primer" });
    expect(await placement(db, "ply-laminate")).toMatchObject({ subcategoryId: "laminates-decorative-laminates" });
    expect(await placement(db, "hw-padlock")).toMatchObject({ subcategoryId: "furniture-hardware-door-locks" });
    expect(await placement(db, "tool-paint-kit")).toMatchObject({ subcategoryId: "painting-tools-paint-brushes" });
  });

  it("deletes the plumbing, electrical and power-tool products and the empty plumbing category", async () => {
    const db = getDb();
    await addPlumbingCategory(db);
    await db
      .insert(products)
      .values([
        unsoldProduct("pl-cpvc-astral", "plumbing", "Plumbing"),
        unsoldProduct("pl-pvc-finolex", "plumbing", "Plumbing"),
        unsoldProduct("el-modular-switch", "electrical", "Electrical"),
        unsoldProduct("tool-bosch-drill", "tools", "Tools"),
      ]);

    await upgrade(db);

    const unsold = ["pl-cpvc-astral", "pl-pvc-finolex", "el-modular-switch", "tool-bosch-drill"];
    expect(await db.select().from(products).where(inArray(products.id, unsold))).toEqual([]);
    expect(await db.select().from(categories).where(eq(categories.id, "plumbing"))).toEqual([]);
    expect(await db.select().from(subcategories).where(eq(subcategories.categoryId, "plumbing"))).toEqual([]);
  });

  it("keeps a category the owner has put products in, and leaves unmatched products unlinked for review", async () => {
    const db = getDb();
    await addPlumbingCategory(db);
    await db.insert(products).values(unsoldProduct("owner-tank", "plumbing", "Water Tanks"));

    await upgrade(db);

    expect(await db.select({ id: categories.id }).from(categories).where(eq(categories.id, "plumbing"))).toHaveLength(1);
    expect(await placement(db, "owner-tank")).toEqual({ category: "plumbing", type: "Water Tanks", subcategoryId: null });
  });

  it("leaves products the owner has already filed under a current type", async () => {
    const db = getDb();
    await db
      .update(products)
      .set({ category: "paints", type: "Texture Paint", subcategoryId: "paints-texture-paint" })
      .where(eq(products.id, "ap-royale-luxury"));

    await upgrade(db);

    expect(await placement(db, "ap-royale-luxury")).toEqual({
      category: "paints",
      type: "Texture Paint",
      subcategoryId: "paints-texture-paint",
    });
  });

  it("replaces unrelated category photos and keeps the owner's own photos", async () => {
    const db = getDb();
    await db.execute(sql`
      update categories set image = old.image
      from (values
        ('laminates', '/images/categories/plywood.jpg'),
        ('doors-door-material', '/images/categories/hardware.jpg'),
        ('screws-fasteners', '/api/photos/owner.jpg')
      ) as old(id, image)
      where categories.id = old.id
    `);

    await upgrade(db);

    const images = Object.fromEntries(
      (await db.select({ id: categories.id, image: categories.image }).from(categories)).map((c) => [c.id, c.image]),
    );
    expect(images.laminates).toBe("/images/categories/laminates.jpg");
    expect(images["doors-door-material"]).toBe("/images/categories/doors.jpg");
    expect(images["screws-fasteners"]).toBe("/api/photos/owner.jpg");
  });
});
