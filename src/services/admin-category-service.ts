import { and, asc, count, eq, ne, sql } from "drizzle-orm";
import { LEGACY_CATEGORY_IDS } from "@/lib/legacy-routes";
import { slugify } from "@/lib/slug";
import { writeAudit } from "@/server/audit";
import { getDb } from "@/server/db/client";
import { categories, products, subcategories, type CategoryRow, type SubcategoryRow } from "@/server/db/schema";
import type { AdminCategoryRecord, AdminSubcategoryRecord, AdminUser, CategoryInput } from "@/types";

export type SaveResult = { ok: true; id: string; replacedImage?: string } | { ok: false; reason: "missing" | "taken" };

const optional = (value: string | null) => value ?? undefined;

function seoColumns(input: CategoryInput) {
  return { seoTitle: input.seoTitle ?? null, seoDescription: input.seoDescription ?? null };
}

function toSubcategoryRecord(row: SubcategoryRow, productCount: number): AdminSubcategoryRecord {
  return {
    id: row.id,
    categoryId: row.categoryId,
    name: row.name,
    slug: row.slug,
    description: optional(row.description),
    image: optional(row.image),
    seoTitle: optional(row.seoTitle),
    seoDescription: optional(row.seoDescription),
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    productCount,
  };
}

function toCategoryRecord(row: CategoryRow, subs: AdminSubcategoryRecord[]): AdminCategoryRecord {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: optional(row.tagline),
    description: optional(row.description),
    image: optional(row.image),
    seoTitle: optional(row.seoTitle),
    seoDescription: optional(row.seoDescription),
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    productCount: subs.reduce((total, sub) => total + sub.productCount, 0),
    subcategories: subs,
  };
}

export async function listAdminCategories(categoryId?: string): Promise<AdminCategoryRecord[]> {
  const db = await getDb();
  const [catRows, subRows, countRows] = await Promise.all([
    db
      .select()
      .from(categories)
      .where(categoryId ? eq(categories.id, categoryId) : undefined)
      .orderBy(asc(categories.sortOrder), asc(categories.name)),
    db
      .select()
      .from(subcategories)
      .where(categoryId ? eq(subcategories.categoryId, categoryId) : undefined)
      .orderBy(asc(subcategories.sortOrder), asc(subcategories.name)),
    db
      .select({ subcategoryId: products.subcategoryId, total: count() })
      .from(products)
      .groupBy(products.subcategoryId),
  ]);
  const counts = new Map(countRows.map((row) => [row.subcategoryId, row.total]));

  return catRows.map((cat) =>
    toCategoryRecord(
      cat,
      subRows.filter((sub) => sub.categoryId === cat.id).map((sub) => toSubcategoryRecord(sub, counts.get(sub.id) ?? 0)),
    ),
  );
}

export async function getAdminCategory(id: string): Promise<AdminCategoryRecord | undefined> {
  const [category] = await listAdminCategories(id);
  return category;
}

export async function getAdminSubcategory(id: string): Promise<AdminSubcategoryRecord | undefined> {
  const db = await getDb();
  const [row] = await db.select().from(subcategories).where(eq(subcategories.id, id));
  if (!row) return undefined;
  const [{ total }] = await db.select({ total: count() }).from(products).where(eq(products.subcategoryId, id));
  return toSubcategoryRecord(row, total);
}

async function categoryNameTaken(id: string, name: string, exceptId?: string) {
  if (LEGACY_CATEGORY_IDS.includes(id)) return true;
  const db = await getDb();
  const [clash] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(sql`(${categories.id} = ${id} or lower(${categories.name}) = lower(${name}))`, exceptId ? ne(categories.id, exceptId) : undefined));
  if (clash) return true;
  if (exceptId) return false;
  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, id));
  return Boolean(product);
}

export async function createCategory(actor: AdminUser, input: CategoryInput, image?: string): Promise<SaveResult> {
  const id = slugify(input.name);
  if (!id || (await categoryNameTaken(id, input.name))) return { ok: false, reason: "taken" };
  const db = await getDb();

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(categories)
      .values({
        id,
        slug: id,
        name: input.name,
        tagline: input.tagline ?? null,
        description: input.description ?? null,
        image: image ?? null,
        ...seoColumns(input),
        sortOrder: input.sortOrder,
      })
      .returning();
    await writeAudit(tx, { userId: actor.id, action: "category_create", entity: "category", entityId: id, after: row });
    return { ok: true, id };
  });
}

export async function updateCategory(actor: AdminUser, id: string, input: CategoryInput, image?: string): Promise<SaveResult> {
  const db = await getDb();
  const [before] = await db.select().from(categories).where(eq(categories.id, id));
  if (!before) return { ok: false, reason: "missing" };
  if (input.name.toLowerCase() !== before.name.toLowerCase() && (await categoryNameTaken("", input.name, id))) {
    return { ok: false, reason: "taken" };
  }

  return db.transaction(async (tx) => {
    const [after] = await tx
      .update(categories)
      .set({
        name: input.name,
        tagline: input.tagline ?? null,
        description: input.description ?? null,
        ...(image && { image }),
        ...seoColumns(input),
        sortOrder: input.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(categories.id, id))
      .returning();
    await writeAudit(tx, { userId: actor.id, action: "category_update", entity: "category", entityId: id, before, after });
    return { ok: true, id, ...(image && before.image && before.image !== image && { replacedImage: before.image }) };
  });
}

export async function setCategoryActive(actor: AdminUser, id: string, isActive: boolean) {
  const db = await getDb();
  return db.transaction(async (tx) => {
    const [before] = await tx.select({ isActive: categories.isActive }).from(categories).where(eq(categories.id, id));
    if (!before) return false;
    await tx.update(categories).set({ isActive, updatedAt: new Date() }).where(eq(categories.id, id));
    await writeAudit(tx, {
      userId: actor.id,
      action: "category_status",
      entity: "category",
      entityId: id,
      before,
      after: { isActive },
    });
    return true;
  });
}

async function subcategoryNameTaken(categoryId: string, name: string, exceptId?: string) {
  const db = await getDb();
  const [clash] = await db
    .select({ id: subcategories.id })
    .from(subcategories)
    .where(
      and(
        eq(subcategories.categoryId, categoryId),
        sql`lower(${subcategories.name}) = lower(${name})`,
        exceptId ? ne(subcategories.id, exceptId) : undefined,
      ),
    );
  return Boolean(clash);
}

export async function createSubcategory(
  actor: AdminUser,
  categoryId: string,
  input: CategoryInput,
  image?: string,
): Promise<SaveResult> {
  const db = await getDb();
  const [category] = await db.select({ id: categories.id }).from(categories).where(eq(categories.id, categoryId));
  if (!category) return { ok: false, reason: "missing" };
  const id = `${categoryId}-${slugify(input.name)}`;
  const [idClash] = await db.select({ id: subcategories.id }).from(subcategories).where(eq(subcategories.slug, id));
  if (idClash || (await subcategoryNameTaken(categoryId, input.name))) return { ok: false, reason: "taken" };

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(subcategories)
      .values({
        id,
        slug: id,
        categoryId,
        name: input.name,
        description: input.description ?? null,
        image: image ?? null,
        ...seoColumns(input),
        sortOrder: input.sortOrder,
      })
      .returning();
    await writeAudit(tx, { userId: actor.id, action: "subcategory_create", entity: "subcategory", entityId: id, after: row });
    return { ok: true, id };
  });
}

export async function updateSubcategory(
  actor: AdminUser,
  id: string,
  input: CategoryInput,
  image?: string,
): Promise<SaveResult> {
  const db = await getDb();
  const [before] = await db.select().from(subcategories).where(eq(subcategories.id, id));
  if (!before) return { ok: false, reason: "missing" };
  if (await subcategoryNameTaken(before.categoryId, input.name, id)) return { ok: false, reason: "taken" };

  return db.transaction(async (tx) => {
    const [after] = await tx
      .update(subcategories)
      .set({
        name: input.name,
        description: input.description ?? null,
        ...(image && { image }),
        ...seoColumns(input),
        sortOrder: input.sortOrder,
        updatedAt: new Date(),
      })
      .where(eq(subcategories.id, id))
      .returning();
    await writeAudit(tx, { userId: actor.id, action: "subcategory_update", entity: "subcategory", entityId: id, before, after });
    return { ok: true, id, ...(image && before.image && before.image !== image && { replacedImage: before.image }) };
  });
}

export async function setSubcategoryActive(actor: AdminUser, id: string, isActive: boolean) {
  const db = await getDb();
  return db.transaction(async (tx) => {
    const [before] = await tx.select({ isActive: subcategories.isActive }).from(subcategories).where(eq(subcategories.id, id));
    if (!before) return false;
    await tx.update(subcategories).set({ isActive, updatedAt: new Date() }).where(eq(subcategories.id, id));
    await writeAudit(tx, {
      userId: actor.id,
      action: "subcategory_status",
      entity: "subcategory",
      entityId: id,
      before,
      after: { isActive },
    });
    return true;
  });
}
