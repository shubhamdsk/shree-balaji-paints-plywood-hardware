import { and, asc, desc, eq, max } from "drizzle-orm";
import { LEGACY_CATEGORY_IDS } from "@/lib/legacy-routes";
import { createProductId, type ProductInput } from "@/lib/product-input";
import { writeAudit } from "@/server/audit";
import { getDb, type Database } from "@/server/db/client";
import { toAdminProduct } from "@/server/db/product-mapper";
import { products, subcategories, type ProductRow } from "@/server/db/schema";
import { getCategoryGroups } from "@/services/catalog-service";
import type { AdminProduct, AdminUser } from "@/types";

export type ProductFlag = "inStock" | "featured" | "isVisible";

const FLAG_ACTIONS = {
  inStock: "product_stock",
  featured: "product_featured",
  isVisible: "product_visibility",
} as const;

type Reader = Pick<Database, "select">;

async function subcategoryIdFor(db: Reader, input: ProductInput) {
  const [row] = await db
    .select({ id: subcategories.id })
    .from(subcategories)
    .where(and(eq(subcategories.categoryId, input.category), eq(subcategories.name, input.type)));
  if (!row) throw new Error(`No subcategory ${input.type} in ${input.category}`);
  return row.id;
}

function selectWithPlacement(db: Reader) {
  return db
    .select({ product: products, category: subcategories.categoryId, type: subcategories.name })
    .from(products)
    .leftJoin(subcategories, eq(products.subcategoryId, subcategories.id));
}

function toAdmin({ product, category, type }: { product: ProductRow; category: string | null; type: string | null }) {
  return toAdminProduct(product, category !== null && type !== null ? { category, type } : null);
}

function inputColumns(input: ProductInput, subcategoryId: string) {
  return {
    subcategoryId,
    name: input.name,
    brand: input.brand,
    category: input.category,
    type: input.type,
    description: input.description,
    sizes: input.sizes,
    priceFrom: input.priceFrom ?? null,
    unit: input.unit,
    inStock: input.inStock,
    featured: input.featured,
  };
}

function featuredSince(wasFeatured: boolean, featured: boolean, now: Date): Pick<ProductRow, "featuredAt"> | undefined {
  if (!featured) return { featuredAt: null };
  return wasFeatured ? undefined : { featuredAt: now };
}

export async function listAdminProducts(): Promise<AdminProduct[]> {
  const db = await getDb();
  const rows = await selectWithPlacement(db).orderBy(desc(products.updatedAt), asc(products.name));
  return rows.map(toAdmin);
}

export async function getAdminProduct(id: string): Promise<AdminProduct | undefined> {
  const db = await getDb();
  const [row] = await selectWithPlacement(db).where(eq(products.id, id));
  return row && toAdmin(row);
}

export async function getProductCounts() {
  const rows = await listAdminProducts();
  return {
    total: rows.length,
    hidden: rows.filter((p) => !p.isVisible).length,
    outOfStock: rows.filter((p) => p.isVisible && !p.inStock).length,
    featured: rows.filter((p) => p.isVisible && p.featured).length,
  };
}

export async function createProduct(actor: AdminUser, input: ProductInput, image?: string): Promise<string> {
  const db = await getDb();
  const reservedIds = [...(await getCategoryGroups()).map((group) => group.id), ...LEGACY_CATEGORY_IDS];
  return db.transaction(async (tx) => {
    const taken = await tx.select({ id: products.id }).from(products);
    const id = createProductId(input.name, taken.map((row) => row.id), reservedIds);
    const [{ last }] = await tx.select({ last: max(products.sortOrder) }).from(products);
    const [row] = await tx
      .insert(products)
      .values({
        id,
        ...inputColumns(input, await subcategoryIdFor(tx, input)),
        ...featuredSince(false, input.featured, new Date()),
        image: image ?? null,
        sortOrder: (last ?? -1) + 1,
      })
      .returning();
    await writeAudit(tx, { userId: actor.id, action: "product_create", entity: "product", entityId: id, after: row });
    return id;
  });
}

export async function updateProduct(
  actor: AdminUser,
  id: string,
  input: ProductInput,
  image?: string,
): Promise<{ previousImage: string | null } | null> {
  const db = await getDb();
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(products).where(eq(products.id, id));
    if (!before) return null;
    const now = new Date();
    const [after] = await tx
      .update(products)
      .set({
        ...inputColumns(input, await subcategoryIdFor(tx, input)),
        ...featuredSince(before.featured, input.featured, now),
        ...(image && { image }),
        updatedAt: now,
      })
      .where(eq(products.id, id))
      .returning();
    await writeAudit(tx, { userId: actor.id, action: "product_update", entity: "product", entityId: id, before, after });
    return { previousImage: image ? before.image : null };
  });
}

export async function setProductFlag(actor: AdminUser, id: string, flag: ProductFlag, value: boolean) {
  const db = await getDb();
  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(products).where(eq(products.id, id));
    if (!before) return false;
    const now = new Date();
    const changes: Partial<ProductRow> = {
      [flag]: value,
      ...(flag === "featured" && featuredSince(before.featured, value, now)),
      updatedAt: now,
    };
    await tx.update(products).set(changes).where(eq(products.id, id));
    await writeAudit(tx, {
      userId: actor.id,
      action: FLAG_ACTIONS[flag],
      entity: "product",
      entityId: id,
      before: { [flag]: before[flag] },
      after: { [flag]: value },
    });
    return true;
  });
}