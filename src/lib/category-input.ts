import { z } from "zod";
import type { CategoryInput } from "@/types";

export type CategoryField = keyof CategoryInput | "photo";
export type CategoryFieldErrors = Partial<Record<CategoryField, string>>;

export const SEO_TITLE_MAX = 70;
export const SEO_DESCRIPTION_MAX = 160;

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function readCategoryForm(formData: FormData) {
  return {
    name: text(formData, "name"),
    tagline: text(formData, "tagline"),
    description: text(formData, "description"),
    sortOrder: text(formData, "sortOrder"),
    seoTitle: text(formData, "seoTitle"),
    seoDescription: text(formData, "seoDescription"),
  };
}

const optionalText = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .transform((value) => value || undefined);

const categoryInputSchema = z.strictObject({
  name: z.string().trim().min(2, "Enter the name").max(60, "Keep the name under 60 characters"),
  tagline: optionalText(120, "Keep the tagline under 120 characters"),
  description: optionalText(500, "Keep the description under 500 characters"),
  sortOrder: z
    .string()
    .trim()
    .regex(/^\d{1,4}$/, "Enter a whole number from 0 to 9999")
    .transform(Number),
  seoTitle: optionalText(SEO_TITLE_MAX, `Keep the search title under ${SEO_TITLE_MAX} characters`),
  seoDescription: optionalText(SEO_DESCRIPTION_MAX, `Keep the search description under ${SEO_DESCRIPTION_MAX} characters`),
});

export function validateCategoryInput(
  raw: unknown,
): { ok: true; input: CategoryInput } | { ok: false; errors: CategoryFieldErrors } {
  const result = categoryInputSchema.safeParse(raw);
  if (result.success) return { ok: true, input: result.data };
  const errors: CategoryFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as CategoryField;
    errors[field] ??= issue.message;
  }
  return { ok: false, errors };
}
