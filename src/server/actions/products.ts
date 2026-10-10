"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { productChangeTags } from "@/lib/cache-tags";
import { photoKeyFromImage, readPhotoUpload } from "@/lib/photo";
import { readProductForm, validateProductInput, type ProductFieldErrors } from "@/lib/product-input";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { deletePhoto, PHOTO_UPLOAD_FAILED, uploadPhoto } from "@/server/storage/photos";
import { createProduct, getAdminProduct, setProductFlag, updateProduct } from "@/services/admin-product-service";
import { getCategoryGroups } from "@/services/catalog-service";

export interface ProductFormState {
  errors?: ProductFieldErrors;
  message?: string;
}

const flagSchema = z.strictObject({
  id: z.string().min(1).max(120),
  flag: z.enum(["inStock", "featured", "isVisible"]),
  value: z.boolean(),
});

export async function saveProductAction(
  productId: string | null,
  _previous: ProductFormState,
  formData: FormData,
): Promise<ProductFormState> {
  const owner = await requireOwner();
  const saved = productId ? await getAdminProduct(productId) : undefined;
  const validation = validateProductInput(readProductForm(formData), await getCategoryGroups(), saved);
  const upload = await readPhotoUpload(formData.get("photo"));
  if (!validation.ok || !upload.ok) {
    return {
      errors: { ...(!validation.ok && validation.errors), ...(!upload.ok && { photo: upload.error }) },
      message: "Please fix the highlighted fields.",
    };
  }

  const photo = await uploadPhoto(upload.photo);
  if (!photo.ok) return { message: PHOTO_UPLOAD_FAILED };
  const image = photo.image;
  if (saved) {
    const updated = await updateProduct(owner, saved.id, validation.input, image);
    if (!updated) return { message: "This product no longer exists." };
    const oldKey = photoKeyFromImage(updated.previousImage);
    if (oldKey) await deletePhoto(oldKey);
    refreshTags(productChangeTags(saved, { ...saved, ...validation.input }));
  } else if (productId) {
    return { message: "This product no longer exists." };
  } else {
    const id = await createProduct(owner, validation.input, image);
    refreshTags(productChangeTags(undefined, { id, ...validation.input, isVisible: true }));
  }

  redirect(ROUTES.adminProducts);
}

export async function setProductFlagAction(id: string, flag: string, value: boolean) {
  const owner = await requireOwner();
  const parsed = flagSchema.safeParse({ id, flag, value });
  if (!parsed.success) return { ok: false };
  const { id: productId, flag: changed, value: next } = parsed.data;
  const before = await setProductFlag(owner, productId, changed, next);
  if (before) refreshTags(productChangeTags(before, { ...before, [changed]: next }));
  return { ok: before !== null };
}

function refreshTags(tags: string[]) {
  for (const tag of tags) updateTag(tag);
}
