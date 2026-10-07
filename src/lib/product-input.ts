import { z } from "zod";
import { slugify } from "@/lib/slug";
import type { CategoryGroup, CategoryId } from "@/types";

export interface ProductInput {
  name: string;
  brand: string;
  category: CategoryId;
  type: string;
  description: string;
  sizes: string[];
  priceFrom?: number;
  unit: string;
  inStock: boolean;
  featured: boolean;
}

export type ProductField = keyof ProductInput | "photo";
export type ProductFieldErrors = Partial<Record<ProductField, string>>;

const PRICE_PATTERN = /^\d{1,7}$/;

export function parseSizes(text: string) {
  return [...new Set(text.split(/[,\n]/).map((size) => size.trim()).filter(Boolean))];
}

export function parsePrice(text: string) {
  const trimmed = text.trim().replace(/,/g, "");
  if (!trimmed) return undefined;
  return PRICE_PATTERN.test(trimmed) ? Number(trimmed) : Number.NaN;
}

function text(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export function readProductForm(formData: FormData) {
  return {
    name: text(formData, "name"),
    brand: text(formData, "brand"),
    category: text(formData, "category"),
    type: text(formData, "type"),
    description: text(formData, "description"),
    sizes: parseSizes(text(formData, "sizes")),
    priceFrom: parsePrice(text(formData, "priceFrom")),
    unit: text(formData, "unit"),
    inStock: formData.get("inStock") === "on",
    featured: formData.get("featured") === "on",
  };
}

export function productInputSchema(groups: CategoryGroup[]) {
  return z
    .strictObject({
      name: z.string().trim().min(2, "Enter the product name").max(120, "Keep the name under 120 characters"),
      brand: z.string().trim().min(1, "Enter the brand").max(60, "Keep the brand under 60 characters"),
      category: z.custom<CategoryId>((id) => groups.some((group) => group.id === id), "Choose a category"),
      type: z.string().trim().min(1, "Choose a type"),
      description: z.string().trim().max(500, "Keep the description under 500 characters"),
      sizes: z
        .array(z.string().max(30, "Keep each size under 30 characters"))
        .min(1, "Add at least one size")
        .max(20, "Add at most 20 sizes"),
      priceFrom: z
        .number("Enter the price in whole rupees, like 520")
        .int("Enter the price in whole rupees, like 520")
        .positive("Enter a price above zero")
        .optional(),
      unit: z.string().trim().max(30, "Keep the unit under 30 characters"),
      inStock: z.boolean(),
      featured: z.boolean(),
    })
    .superRefine((input, ctx) => {
      const group = groups.find((g) => g.id === input.category);
      if (group && !group.subtypes.includes(input.type)) {
        ctx.addIssue({ code: "custom", path: ["type"], message: "Choose a type from this category" });
      }
    });
}

export function validateProductInput(
  raw: unknown,
  groups: CategoryGroup[],
): { ok: true; input: ProductInput } | { ok: false; errors: ProductFieldErrors } {
  const result = productInputSchema(groups).safeParse(raw);
  if (result.success) return { ok: true, input: result.data };
  const errors: ProductFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as ProductField;
    errors[field] ??= issue.message;
  }
  return { ok: false, errors };
}

export function createProductId(name: string, takenIds: Iterable<string>, reservedIds: Iterable<string>) {
  const unavailable = new Set([...takenIds, ...reservedIds]);
  const base = slugify(name) || "product";
  let id = base;
  for (let n = 2; unavailable.has(id); n++) id = `${base}-${n}`;
  return id;
}
