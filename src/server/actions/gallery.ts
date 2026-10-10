"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { photoKeyFromImage, readPhotoUpload } from "@/lib/photo";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { deletePhoto, savePhoto } from "@/server/storage/photos";
import {
  createGalleryItem,
  deleteGalleryItem,
  toggleGalleryItemActive,
  updateGalleryItem,
} from "@/services/gallery-service";

export interface GalleryFormState {
  errors?: {
    title?: string;
    category?: string;
    caption?: string;
    photo?: string;
  };
  message?: string;
}

const inputSchema = z.strictObject({
  title: z.string().min(1, "Title is required").max(120),
  category: z.string().min(1, "Category is required").max(80),
  caption: z.string().max(300).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function saveGalleryItemAction(
  id: string | null,
  _previous: GalleryFormState,
  formData: FormData,
): Promise<GalleryFormState> {
  const owner = await requireOwner();
  const title = String(formData.get("title") ?? "");
  const category = String(formData.get("category") ?? "");
  const caption = String(formData.get("caption") ?? "");

  const parsed = inputSchema.safeParse({ title, category, caption });
  const upload = await readPhotoUpload(formData.get("photo"));

  if (!parsed.success || !upload.ok || (!id && !upload.photo)) {
    const fieldErrors: GalleryFormState["errors"] = {};
    if (!parsed.success) {
      const formatted = parsed.error.format();
      if (formatted.title?._errors[0]) fieldErrors.title = formatted.title._errors[0];
      if (formatted.category?._errors[0]) fieldErrors.category = formatted.category._errors[0];
      if (formatted.caption?._errors[0]) fieldErrors.caption = formatted.caption._errors[0];
    }
    if (!upload.ok) {
      fieldErrors.photo = upload.error;
    } else if (!id && !upload.photo) {
      fieldErrors.photo = "Photo is required for a new gallery item.";
    }
    return { errors: fieldErrors, message: "Please check the highlighted fields." };
  }

  let image: string | undefined;
  if (upload.photo) {
    const photoKey = await savePhoto(upload.photo.bytes, upload.photo.type);
    image = API_ENDPOINTS.photo(photoKey);
  }

  if (id) {
    const updated = await updateGalleryItem(owner, id, parsed.data, image);
    if (!updated) return { message: "Gallery item not found." };
    if (image && updated.image) {
      const oldKey = photoKeyFromImage(updated.image);
      if (oldKey) await deletePhoto(oldKey);
    }
  } else {
    await createGalleryItem(owner, parsed.data, image || "/images/gallery/villa-painting.jpg");
  }

  updateTag(CACHE_TAGS.gallery);
  redirect(ROUTES.adminGallery);
}

export async function toggleGalleryActiveAction(id: string, isActive: boolean) {
  const owner = await requireOwner();
  if (!id) return { ok: false };

  const ok = await toggleGalleryItemActive(owner, id, isActive);
  if (ok) updateTag(CACHE_TAGS.gallery);
  return { ok };
}

export async function deleteGalleryItemAction(id: string) {
  const owner = await requireOwner();
  if (!id) return { ok: false };

  const deleted = await deleteGalleryItem(owner, id);
  if (deleted) {
    const key = photoKeyFromImage(deleted.image);
    if (key) await deletePhoto(key);
    updateTag(CACHE_TAGS.gallery);
    return { ok: true };
  }
  return { ok: false };
}
