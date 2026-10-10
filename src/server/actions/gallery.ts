"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { readGalleryForm, validateGalleryInput, type GalleryFieldErrors } from "@/lib/gallery-input";
import { photoKeyFromImage, readPhotoUpload } from "@/lib/photo";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { deletePhoto, PHOTO_UPLOAD_FAILED, uploadPhoto } from "@/server/storage/photos";
import {
  createGalleryItem,
  deleteGalleryItem,
  toggleGalleryItemActive,
  updateGalleryItem,
} from "@/services/gallery-service";

export interface GalleryFormState {
  errors?: GalleryFieldErrors;
  message?: string;
}

export async function saveGalleryItemAction(
  id: string | null,
  _previous: GalleryFormState,
  formData: FormData,
): Promise<GalleryFormState> {
  const owner = await requireOwner();
  const upload = await readPhotoUpload(formData.get("photo"));
  const parsed = validateGalleryInput(readGalleryForm(formData), { needsPhoto: !id && upload.ok && !upload.photo });

  if (!parsed.ok || !upload.ok) {
    return {
      errors: { ...(!parsed.ok && parsed.errors), ...(!upload.ok && { photo: upload.error }) },
      message: "Please fix the highlighted fields.",
    };
  }

  const photo = await uploadPhoto(upload.photo);
  if (!photo.ok) return { message: PHOTO_UPLOAD_FAILED };
  const image = photo.image;

  if (id) {
    const updated = await updateGalleryItem(owner, id, parsed.input, image);
    if (!updated) return { message: "Gallery item not found." };
    if (image && updated.image) {
      const oldKey = photoKeyFromImage(updated.image);
      if (oldKey) await deletePhoto(oldKey);
    }
  } else {
    await createGalleryItem(owner, parsed.input, image || "/images/gallery/villa-painting.jpg");
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
