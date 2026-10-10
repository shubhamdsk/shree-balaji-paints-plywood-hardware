"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { readCategoryForm, validateCategoryInput, type CategoryFieldErrors } from "@/lib/category-input";
import { photoKeyFromImage, readPhotoUpload } from "@/lib/photo";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { deletePhoto, savePhoto } from "@/server/storage/photos";
import {
  createCategory,
  createSubcategory,
  setCategoryActive,
  setSubcategoryActive,
  updateCategory,
  updateSubcategory,
  type SaveResult,
} from "@/services/admin-category-service";
import type { CategoryInput } from "@/types";

export interface CategoryFormState {
  errors?: CategoryFieldErrors;
  message?: string;
}

type Save = (input: CategoryInput, image?: string) => Promise<SaveResult>;

const idSchema = z.string().min(1).max(160);

const FAILURE_MESSAGES = {
  missing: "This category no longer exists.",
  taken: "That name is already used. Choose another one.",
};

async function saveFromForm(formData: FormData, save: Save): Promise<CategoryFormState | { savedId: string }> {
  const validation = validateCategoryInput(readCategoryForm(formData));
  const upload = await readPhotoUpload(formData.get("photo"));
  if (!validation.ok || !upload.ok) {
    return {
      errors: { ...(!validation.ok && validation.errors), ...(!upload.ok && { photo: upload.error }) },
      message: "Please fix the highlighted fields.",
    };
  }

  const uploaded = upload.photo ? API_ENDPOINTS.photo(await savePhoto(upload.photo.bytes, upload.photo.type)) : undefined;
  const result = await save(validation.input, uploaded);
  const unusedPhoto = result.ok ? result.replacedImage : uploaded;
  const key = photoKeyFromImage(unusedPhoto);
  if (key) await deletePhoto(key);
  if (!result.ok) return { message: FAILURE_MESSAGES[result.reason] };

  updateTag(CACHE_TAGS.structure);
  return { savedId: result.id };
}

export async function saveCategoryAction(
  categoryId: string | null,
  _previous: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const owner = await requireOwner();
  const result = await saveFromForm(formData, (input, image) =>
    categoryId ? updateCategory(owner, categoryId, input, image) : createCategory(owner, input, image),
  );
  if (!("savedId" in result)) return result;
  redirect(categoryId ? ROUTES.adminCategories : ROUTES.adminCategory(result.savedId));
}

export async function saveSubcategoryAction(
  categoryId: string,
  subcategoryId: string | null,
  _previous: CategoryFormState,
  formData: FormData,
): Promise<CategoryFormState> {
  const owner = await requireOwner();
  const result = await saveFromForm(formData, (input, image) =>
    subcategoryId ? updateSubcategory(owner, subcategoryId, input, image) : createSubcategory(owner, categoryId, input, image),
  );
  if (!("savedId" in result)) return result;
  redirect(ROUTES.adminCategory(categoryId));
}

export async function setCategoryActiveAction(id: string, isActive: boolean) {
  const owner = await requireOwner();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success || !(await setCategoryActive(owner, parsed.data, isActive))) return { ok: false };
  updateTag(CACHE_TAGS.structure);
  return { ok: true };
}

export async function setSubcategoryActiveAction(id: string, isActive: boolean) {
  const owner = await requireOwner();
  const parsed = idSchema.safeParse(id);
  if (!parsed.success || !(await setSubcategoryActive(owner, parsed.data, isActive))) return { ok: false };
  updateTag(CACHE_TAGS.structure);
  return { ok: true };
}
