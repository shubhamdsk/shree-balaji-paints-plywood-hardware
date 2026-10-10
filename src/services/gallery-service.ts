import { asc, desc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { writeAudit } from "@/server/audit";
import { getDb } from "@/server/db/client";
import { gallery, type GalleryRow } from "@/server/db/schema";
import type { AdminUser, GalleryInput, GalleryItem } from "@/types";

function toGalleryItem(row: GalleryRow): GalleryItem {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    caption: row.caption ?? undefined,
    image: row.image,
    sortOrder: row.sortOrder,
    isActive: row.isActive,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const readPublicGallery = unstable_cache(
  async (): Promise<GalleryItem[]> => {
    try {
      const db = await getDb();
      const rows = await db
        .select()
        .from(gallery)
        .where(eq(gallery.isActive, true))
        .orderBy(asc(gallery.sortOrder), desc(gallery.createdAt));
      return rows.map(toGalleryItem);
    } catch {
      return [];
    }
  },
  ["public-gallery"],
  { tags: [CACHE_TAGS.gallery] },
);

export async function getPublicGalleryItems(): Promise<GalleryItem[]> {
  return readPublicGallery();
}

export async function getAdminGalleryItems(): Promise<GalleryItem[]> {
  const db = await getDb();
  const rows = await db.select().from(gallery).orderBy(asc(gallery.sortOrder), desc(gallery.createdAt));
  return rows.map(toGalleryItem);
}

export async function createGalleryItem(actor: AdminUser, input: GalleryInput, image: string): Promise<GalleryItem> {
  const db = await getDb();
  const id = `gal_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date();

  return db.transaction(async (tx) => {
    const [row] = await tx
      .insert(gallery)
      .values({
        id,
        title: input.title.trim(),
        category: input.category.trim(),
        caption: input.caption?.trim() || null,
        image,
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await writeAudit(tx, {
      userId: actor.id,
      action: "gallery_create",
      entity: "gallery",
      entityId: row.id,
      after: row,
    });

    return toGalleryItem(row);
  });
}

export async function updateGalleryItem(
  actor: AdminUser,
  id: string,
  input: GalleryInput,
  image?: string,
): Promise<GalleryItem | null> {
  const db = await getDb();
  const now = new Date();

  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(gallery).where(eq(gallery.id, id));
    if (!before) return null;

    const [after] = await tx
      .update(gallery)
      .set({
        title: input.title.trim(),
        category: input.category.trim(),
        caption: input.caption?.trim() || null,
        ...(image && { image }),
        sortOrder: input.sortOrder ?? 0,
        isActive: input.isActive ?? true,
        updatedAt: now,
      })
      .where(eq(gallery.id, id))
      .returning();

    await writeAudit(tx, {
      userId: actor.id,
      action: "gallery_update",
      entity: "gallery",
      entityId: id,
      before,
      after,
    });

    return toGalleryItem(after);
  });
}

export async function toggleGalleryItemActive(actor: AdminUser, id: string, isActive: boolean): Promise<boolean> {
  const db = await getDb();
  const now = new Date();

  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(gallery).where(eq(gallery.id, id));
    if (!before) return false;

    const [after] = await tx
      .update(gallery)
      .set({ isActive, updatedAt: now })
      .where(eq(gallery.id, id))
      .returning();

    await writeAudit(tx, {
      userId: actor.id,
      action: "gallery_status",
      entity: "gallery",
      entityId: id,
      before: { isActive: before.isActive },
      after: { isActive: after.isActive },
    });

    return true;
  });
}

export async function deleteGalleryItem(actor: AdminUser, id: string): Promise<GalleryItem | null> {
  const db = await getDb();

  return db.transaction(async (tx) => {
    const [before] = await tx.select().from(gallery).where(eq(gallery.id, id));
    if (!before) return null;

    await tx.delete(gallery).where(eq(gallery.id, id));

    await writeAudit(tx, {
      userId: actor.id,
      action: "gallery_delete",
      entity: "gallery",
      entityId: id,
      before,
    });

    return toGalleryItem(before);
  });
}
