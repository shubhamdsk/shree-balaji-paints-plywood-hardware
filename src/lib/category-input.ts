import { z } from "zod";
import { labelProblem, longTextProblem, textRule } from "@/lib/text-rules";
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

export const CATEGORY_LIMITS = { name: 60, tagline: 120, description: 500 } as const;

const optionalText = (max: number, message: string, problem: (value: string) => string | undefined) =>
  z
    .string()
    .trim()
    .max(max, message)
    .superRefine(textRule(problem))
    .transform((value) => value || undefined);

const categoryInputSchema = z.strictObject({
  name: z
    .string()
    .trim()
    .min(2, "Enter the name")
    .max(CATEGORY_LIMITS.name, `Keep the name under ${CATEGORY_LIMITS.name} characters`)
    .superRefine(textRule(labelProblem)),
  tagline: optionalText(CATEGORY_LIMITS.tagline, `Keep the tagline under ${CATEGORY_LIMITS.tagline} characters`, labelProblem),
  description: optionalText(
    CATEGORY_LIMITS.description,
    `Keep the description under ${CATEGORY_LIMITS.description} characters`,
    longTextProblem,
  ),
  sortOrder: z
    .string()
    .trim()
    .regex(/^\d{1,4}$/, "Enter a whole number from 0 to 9999")
    .transform(Number),
  seoTitle: optionalText(SEO_TITLE_MAX, `Keep the search title under ${SEO_TITLE_MAX} characters`, labelProblem),
  seoDescription: optionalText(
    SEO_DESCRIPTION_MAX,
    `Keep the search description under ${SEO_DESCRIPTION_MAX} characters`,
    longTextProblem,
  ),
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
