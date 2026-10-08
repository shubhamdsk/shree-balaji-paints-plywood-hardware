"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { slugify } from "@/lib/slug";
import { requireOwner } from "@/server/auth/guard";
import { getDb } from "@/server/db/client";
import { categories, subcategories } from "@/server/db/schema";
import { writeAudit } from "@/server/audit";
import { eq } from "drizzle-orm";

const categorySchema = z.strictObject({
  id: z.string().min(1).max(60),
  name: z.string().trim().min(2).max(100),
  tagline: z.string().trim().max(150).optional(),
  description: z.string().trim().max(500).optional(),
});

const subcategorySchema = z.strictObject({
  categoryId: z.string().min(1).max(60),
  name: z.string().trim().min(2).max(100),
  description: z.string().trim().max(500).optional(),
});

export async function createCategoryAction(name: string, tagline?: string, description?: string) {
  const owner = await requireOwner();
  const slug = slugify(name);
  const id = slug || `cat-${Date.now()}`;
  const parsed = categorySchema.safeParse({ id, name, tagline, description });
  if (!parsed.success) return { ok: false, error: "Invalid category details" };

  const db = await getDb();
  await db.insert(categories).values({
    id: parsed.data.id,
    name: parsed.data.name,
    slug: parsed.data.id,
    tagline: parsed.data.tagline,
    description: parsed.data.description,
    sortOrder: 100,
    isActive: true,
  });

  await writeAudit(db, {
    userId: owner.id,
    action: "category_create",
    entity: "category",
    entityId: parsed.data.id,
    after: parsed.data,
  });

  updateTag(CACHE_TAGS.catalog);
  return { ok: true, id: parsed.data.id };
}

export async function createSubcategoryAction(categoryId: string, name: string, description?: string) {
  const owner = await requireOwner();
  const parsed = subcategorySchema.safeParse({ categoryId, name, description });
  if (!parsed.success) return { ok: false, error: "Invalid subcategory details" };

  const slug = slugify(name);
  const id = `${categoryId}-${slug}`;
  const db = await getDb();

  await db.insert(subcategories).values({
    id,
    categoryId: parsed.data.categoryId,
    name: parsed.data.name,
    slug,
    description: parsed.data.description,
    sortOrder: 100,
    isActive: true,
  });

  await writeAudit(db, {
    userId: owner.id,
    action: "subcategory_create",
    entity: "subcategory",
    entityId: id,
    after: parsed.data,
  });

  updateTag(CACHE_TAGS.catalog);
  return { ok: true, id };
}

export async function toggleCategoryStatusAction(id: string, isActive: boolean) {
  const owner = await requireOwner();
  const db = await getDb();
  await db.update(categories).set({ isActive, updatedAt: new Date() }).where(eq(categories.id, id));
  await writeAudit(db, {
    userId: owner.id,
    action: "category_status",
    entity: "category",
    entityId: id,
    before: { isActive: !isActive },
    after: { isActive },
  });

  updateTag(CACHE_TAGS.catalog);
  return { ok: true };
}
