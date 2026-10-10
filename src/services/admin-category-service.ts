import { asc, eq } from "drizzle-orm";
import { slugify } from "@/lib/slug";
import { writeAudit } from "@/server/audit";
import { getDb } from "@/server/db/client";
import { categories, products, subcategories } from "@/server/db/schema";
import type { AdminCategoryRecord, AdminUser, CategoryInput, SubcategoryInput } from "@/types";

export async function listAdminCategoriesWithCounts(): Promise<AdminCategoryRecord[]> {
  const db = await getDb();
  const [catRows, subRows, prodRows] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name)),
    db.select().from(subcategories).orderBy(asc(subcategories.sortOrder), asc(subcategories.name)),
    db.select({ id: products.id, category: products.category, type: products.type }).from(products),
  ]);

  return catRows.map((cat) => {
    const catProds = prodRows.filter((p) => p.category === cat.id || p.category === cat.slug);

    const catSubs = subRows
      .filter((s) => s.categoryId === cat.id)
      .map((sub) => {
        const subProdCount = catProds.filter(
          (p) => p.type.toLowerCase() === sub.name.toLowerCase() || slugify(p.type) === sub.slug,
        ).length;

        return {
          id: sub.id,
          categoryId: sub.categoryId,
          name: sub.name,
          slug: sub.slug,
          description: sub.description ?? undefined,
          image: sub.image ?? undefined,
          sortOrder: sub.sortOrder,
          isActive: sub.isActive,
          productCount: subProdCount,
        };
      });

    return {
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      tagline: cat.tagline ?? undefined,
      description: cat.description ?? undefined,
      image: cat.image ?? "/images/categories/plywood.jpg",
      sortOrder: cat.sortOrder,
      isActive: cat.isActive,
      productCount: catProds.length,
      subcategories: catSubs,
    };
  });
}

export async function createCategory(actor: AdminUser, input: CategoryInput): Promise<AdminCategoryRecord> {
  const db = await getDb();
  const slug = slugify(input.slug || input.name);
  const id = input.slug ? slugify(input.slug) : slug;
  const now = new Date();

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(categories)
      .values({
        id,
        name: input.name.trim(),
        slug,
        tagline: input.tagline?.trim() || null,
        description: input.description?.trim() || null,
        image: input.image?.trim() || "/images/categories/plywood.jpg",
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await writeAudit(tx, {
      userId: actor.id,
      action: "category_create",
      entity: "category",
      entityId: row.id,
      after: row,
    });

    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      tagline: row.tagline ?? undefined,
      description: row.description ?? undefined,
      image: row.image ?? "/images/categories/plywood.jpg",
      sortOrder: row.sortOrder,
      isActive: row.isActive,
      productCount: 0,
      subcategories: [],
    };
  });
}

export async function updateCategory(actor: AdminUser, id: string, input: CategoryInput) {
  const db = await getDb();
  const slug = slugify(input.slug || input.name);
  const now = new Date();

  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(categories).where(eq(categories.id, id));
    if (!before) return null;

    const [after] = await tx
      .update(categories)
      .set({
        name: input.name.trim(),
        slug,
        tagline: input.tagline?.trim() || null,
        description: input.description?.trim() || null,
        image: input.image?.trim() || "/images/categories/plywood.jpg",
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
        updatedAt: now,
      })
      .where(eq(categories.id, id))
      .returning();

    await writeAudit(tx, {
      userId: actor.id,
      action: "category_update",
      entity: "category",
      entityId: id,
      before,
      after,
    });

    return after;
  });
}

export async function toggleCategoryActive(actor: AdminUser, id: string, isActive: boolean) {
  const db = await getDb();
  const now = new Date();

  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(categories).where(eq(categories.id, id));
    if (!before) return false;

    const [after] = await tx
      .update(categories)
      .set({ isActive, updatedAt: now })
      .where(eq(categories.id, id))
      .returning();

    await writeAudit(tx, {
      userId: actor.id,
      action: "category_status",
      entity: "category",
      entityId: id,
      before: { isActive: before.isActive },
      after: { isActive: after.isActive },
    });

    return true;
  });
}

export async function createSubcategory(actor: AdminUser, input: SubcategoryInput) {
  const db = await getDb();
  const slug = slugify(input.slug || input.name);
  const id = `${input.categoryId}-${slug}`;
  const now = new Date();

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(subcategories)
      .values({
        id,
        categoryId: input.categoryId,
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || null,
        image: input.image?.trim() || null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await writeAudit(tx, {
      userId: actor.id,
      action: "subcategory_create",
      entity: "subcategory",
      entityId: row.id,
      after: row,
    });

    return row;
  });
}

export async function updateSubcategory(actor: AdminUser, id: string, input: SubcategoryInput) {
  const db = await getDb();
  const slug = slugify(input.slug || input.name);
  const now = new Date();

  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(subcategories).where(eq(subcategories.id, id));
    if (!before) return null;

    const [after] = await tx
      .update(subcategories)
      .set({
        categoryId: input.categoryId,
        name: input.name.trim(),
        slug,
        description: input.description?.trim() || null,
        image: input.image?.trim() || null,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
        updatedAt: now,
      })
      .where(eq(subcategories.id, id))
      .returning();

    await writeAudit(tx, {
      userId: actor.id,
      action: "subcategory_update",
      entity: "subcategory",
      entityId: id,
      before,
      after,
    });

    return after;
  });
}

export async function toggleSubcategoryActive(actor: AdminUser, id: string, isActive: boolean) {
  const db = await getDb();
  const now = new Date();

  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(subcategories).where(eq(subcategories.id, id));
    if (!before) return false;

    const [after] = await tx
      .update(subcategories)
      .set({ isActive, updatedAt: now })
      .where(eq(subcategories.id, id))
      .returning();

    await writeAudit(tx, {
      userId: actor.id,
      action: "subcategory_status",
      entity: "subcategory",
      entityId: id,
      before: { isActive: before.isActive },
      after: { isActive: after.isActive },
    });

    return true;
  });
}

export const getAdminCategoriesWithCounts = listAdminCategoriesWithCounts;
