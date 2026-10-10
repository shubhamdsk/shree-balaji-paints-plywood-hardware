"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { photoKeyFromImage, readPhotoUpload } from "@/lib/photo";
import { readProductForm, validateProductInput, type ProductFieldErrors } from "@/lib/product-input";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { deletePhoto, savePhoto } from "@/server/storage/photos";
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

  const image = upload.photo ? API_ENDPOINTS.photo(await savePhoto(upload.photo.bytes, upload.photo.type)) : undefined;
  if (productId) {
    const updated = await updateProduct(owner, productId, validation.input, image);
    if (!updated) return { message: "This product no longer exists." };
    const oldKey = photoKeyFromImage(updated.previousImage);
    if (oldKey) await deletePhoto(oldKey);
  } else {
    await createProduct(owner, validation.input, image);
  }

  updateTag(CACHE_TAGS.catalog);
  redirect(ROUTES.adminProducts);
}

export async function setProductFlagAction(id: string, flag: string, value: boolean) {
  const owner = await requireOwner();
  const parsed = flagSchema.safeParse({ id, flag, value });
  if (!parsed.success) return { ok: false };
  const ok = await setProductFlag(owner, parsed.data.id, parsed.data.flag, parsed.data.value);
  if (ok) updateTag(CACHE_TAGS.catalog);
  return { ok };
}
