import { describe, expect, it } from "vitest";
import { adminUsers } from "@/server/db/schema";
import {
  createGalleryItem,
  deleteGalleryItem,
  getAdminGalleryItems,
  getPublicGalleryItems,
  toggleGalleryItemActive,
  updateGalleryItem,
} from "@/services/gallery-service";
import { setupTestDatabase } from "@/test/db";
import type { AdminUser } from "@/types";

const db = setupTestDatabase();

async function owner(): Promise<AdminUser> {
  const [row] = await db()
    .insert(adminUsers)
    .values({ username: "owner", passwordHash: "unused" })
    .returning({ id: adminUsers.id, username: adminUsers.username });
  return row;
}

describe("gallery-service", () => {
  it("creates, updates, toggles and deletes gallery items", async () => {
    const testOwner = await owner();

    const created = await createGalleryItem(
      testOwner,
      {
        title: "Kotul Villa Exterior Paint Project",
        category: "Painting Works",
        caption: "Asian Paints Apex Ultima exterior finish",
      },
      "/images/gallery/villa-painting.jpg",
    );
    expect(created.id).toBeDefined();
    expect(created.title).toBe("Kotul Villa Exterior Paint Project");

    let adminItems = await getAdminGalleryItems();
    expect(adminItems.some((i) => i.id === created.id)).toBe(true);

    let publicItems = await getPublicGalleryItems();
    expect(publicItems.some((i) => i.id === created.id)).toBe(true);

    const updated = await updateGalleryItem(testOwner, created.id, {
      title: "Updated Villa Paint Title",
      category: "Painting Works",
    });
    expect(updated?.title).toBe("Updated Villa Paint Title");

    const toggled = await toggleGalleryItemActive(testOwner, created.id, false);
    expect(toggled).toBe(true);

    publicItems = await getPublicGalleryItems();
    expect(publicItems.some((i) => i.id === created.id)).toBe(false);

    const deleted = await deleteGalleryItem(testOwner, created.id);
    expect(deleted?.id).toBe(created.id);

    adminItems = await getAdminGalleryItems();
    expect(adminItems.some((i) => i.id === created.id)).toBe(false);
  });
});
