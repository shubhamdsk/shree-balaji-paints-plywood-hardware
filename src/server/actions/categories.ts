"use server";

import { updateTag } from "next/cache";
import { z } from "zod";
import { CACHE_TAGS } from "@/lib/cache-tags";
import { requireOwner } from "@/server/auth/guard";
import {
  createCategory,
  createSubcategory,
  toggleCategoryActive,
  toggleSubcategoryActive,
  updateCategory,
  updateSubcategory,
} from "@/services/admin-category-service";
import type { CategoryInput, SubcategoryInput } from "@/types";

const categorySchema = z.strictObject({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().max(100).optional(),
  tagline: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  image: z.string().max(300).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

const subcategorySchema = z.strictObject({
  categoryId: z.string().min(1, "Category is required"),
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().max(100).optional(),
  description: z.string().max(500).optional(),
  image: z.string().max(300).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function saveCategoryAction(id: string | null, input: CategoryInput) {
  const owner = await requireOwner();
  const parsed = categorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please check the entered values." };
  }

  try {
    if (id) {
      await updateCategory(owner, id, parsed.data);
    } else {
      await createCategory(owner, parsed.data);
    }
    updateTag(CACHE_TAGS.catalog);
    updateTag(CACHE_TAGS.categories);
    return { ok: true };
  } catch (err) {
    console.error("saveCategoryAction error:", err);
    return { ok: false, message: "Could not save category. Please check if it already exists." };
  }
}

export async function toggleCategoryActiveAction(id: string, isActive: boolean) {
  const owner = await requireOwner();
  if (!id) return { ok: false, message: "Invalid category ID." };

  const ok = await toggleCategoryActive(owner, id, isActive);
  if (ok) {
    updateTag(CACHE_TAGS.catalog);
    updateTag(CACHE_TAGS.categories);
  }
  return { ok };
}

export async function saveSubcategoryAction(id: string | null, input: SubcategoryInput) {
  const owner = await requireOwner();
  const parsed = subcategorySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Please check the entered values." };
  }

  try {
    if (id) {
      await updateSubcategory(owner, id, parsed.data);
    } else {
      await createSubcategory(owner, parsed.data);
    }
    updateTag(CACHE_TAGS.catalog);
    updateTag(CACHE_TAGS.categories);
    return { ok: true };
  } catch (err) {
    console.error("saveSubcategoryAction error:", err);
    return { ok: false, message: "Could not save subcategory. Please try again." };
  }
}

export async function toggleSubcategoryActiveAction(id: string, isActive: boolean) {
  const owner = await requireOwner();
  if (!id) return { ok: false, message: "Invalid subcategory ID." };

  const ok = await toggleSubcategoryActive(owner, id, isActive);
  if (ok) {
    updateTag(CACHE_TAGS.catalog);
    updateTag(CACHE_TAGS.categories);
  }
  return { ok };
}
