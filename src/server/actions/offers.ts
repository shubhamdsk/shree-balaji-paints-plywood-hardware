"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { readOfferForm, validateOfferInput, type OfferFieldErrors } from "@/lib/offer-input";
import { photoKeyFromImage, readPhotoUpload } from "@/lib/photo";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { deletePhoto, savePhoto } from "@/server/storage/photos";
import {
  createOffer,
  deleteOffer,
  getAdminOffer,
  isOfferImageShared,
  updateOffer,
} from "@/services/offer-service";

export interface OfferFormState {
  errors?: OfferFieldErrors;
  message?: string;
}

const idSchema = z.string().min(1).max(120);

async function deleteUnusedPhoto(image: string | undefined, offerId: string) {
  const key = photoKeyFromImage(image);
  if (key && image && !(await isOfferImageShared(image, offerId))) await deletePhoto(key);
}

export async function saveOfferAction(
  offerId: string | null,
  copyFromId: string | null,
  _previous: OfferFormState,
  formData: FormData,
): Promise<OfferFormState> {
  const owner = await requireOwner();
  const validation = validateOfferInput(readOfferForm(formData));
  const upload = await readPhotoUpload(formData.get("photo"));
  if (!validation.ok || !upload.ok) {
    return {
      errors: { ...(!validation.ok && validation.errors), ...(!upload.ok && { photo: upload.error }) },
      message: "Please fix the highlighted fields.",
    };
  }

  const uploaded = upload.photo ? API_ENDPOINTS.photo(await savePhoto(upload.photo.bytes, upload.photo.type)) : undefined;
  if (offerId) {
    const updated = await updateOffer(owner, offerId, validation.input, uploaded);
    if (!updated) return { message: "This offer no longer exists." };
    await deleteUnusedPhoto(updated.replacedImage, offerId);
  } else {
    const copiedImage = copyFromId && !uploaded ? (await getAdminOffer(copyFromId))?.image : undefined;
    await createOffer(owner, validation.input, uploaded ?? copiedImage);
  }

  updateTag(CACHE_TAGS.offers);
  redirect(ROUTES.adminOffers);
}

export async function deleteOfferAction(id: string) {
  const owner = await requireOwner();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success) return { ok: false };
  const deleted = await deleteOffer(owner, parsed.data);
  if (!deleted) return { ok: false };
  await deleteUnusedPhoto(deleted.image, deleted.id);
  updateTag(CACHE_TAGS.offers);
  return { ok: true };
}
