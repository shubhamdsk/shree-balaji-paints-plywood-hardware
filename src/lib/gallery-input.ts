import { z } from "zod";
import { labelProblem, longTextProblem, textRule } from "@/lib/text-rules";

export const GALLERY_CATEGORIES = [
  "Painting Works",
  "Plywood & Interior",
  "Laminates & Finish",
  "Hardware & Fittings",
  "General Work",
] as const;

export const GALLERY_LIMITS = { title: 120, caption: 300 } as const;

export interface GalleryFormInput {
  title: string;
  category: string;
  caption: string;
}

export type GalleryField = keyof GalleryFormInput | "photo";
export type GalleryFieldErrors = Partial<Record<GalleryField, string>>;

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function readGalleryForm(formData: FormData): GalleryFormInput {
  return { title: text(formData, "title"), category: text(formData, "category"), caption: text(formData, "caption") };
}

const gallerySchema = z.strictObject({
  title: z
    .string()
    .trim()
    .min(2, "Enter a project title")
    .max(GALLERY_LIMITS.title, `Keep the title under ${GALLERY_LIMITS.title} characters`)
    .superRefine(textRule(labelProblem)),
  category: z.enum(GALLERY_CATEGORIES, "Choose a category"),
  caption: z
    .string()
    .trim()
    .max(GALLERY_LIMITS.caption, `Keep the caption under ${GALLERY_LIMITS.caption} characters`)
    .superRefine(textRule(longTextProblem)),
});

/** A new gallery item needs a photo; an edit keeps the current one unless a new one is chosen. */
export function validateGalleryInput(
  raw: unknown,
  { needsPhoto }: { needsPhoto: boolean },
): { ok: true; input: GalleryFormInput } | { ok: false; errors: GalleryFieldErrors } {
  const result = gallerySchema.safeParse(raw);
  const errors: GalleryFieldErrors = {};
  if (!result.success) {
    for (const issue of result.error.issues) errors[issue.path[0] as GalleryField] ??= issue.message;
  }
  if (needsPhoto) errors.photo = "Choose a photo of the finished work";
  if (result.success && !needsPhoto) return { ok: true, input: result.data };
  return { ok: false, errors };
}
