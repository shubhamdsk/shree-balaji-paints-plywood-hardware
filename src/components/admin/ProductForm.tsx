"use client";

import Image from "next/image";
import { startTransition, useActionState, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import AppLink from "@/components/ui/AppLink";
import Button, { buttonClasses } from "@/components/ui/Button";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import SelectMenu from "@/components/ui/SelectMenu";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { HOME_FEATURED_LIMIT } from "@/lib/catalog";
import { MAX_PHOTO_BYTES, PHOTO_ACCEPT, PHOTO_TYPES } from "@/lib/photo";
import { readProductForm, validateProductInput, type ProductField, type ProductFieldErrors } from "@/lib/product-input";
import { resizePhoto } from "@/lib/resize-photo";
import { ROUTES } from "@/lib/routes";
import { saveProductAction, type ProductFormState } from "@/server/actions/products";
import type { AdminProduct, CategoryGroup } from "@/types";

interface ProductFormProps {
  product?: AdminProduct;
  categoryGroups: CategoryGroup[];
}

interface FormValues {
  name: string;
  brand: string;
  category: string;
  type: string;
  description: string;
  sizes: string;
  priceFrom: string;
  unit: string;
  inStock: boolean;
  featured: boolean;
}

type TextField = Exclude<keyof FormValues, "inStock" | "featured">;

function initialValues(product?: AdminProduct): FormValues {
  return {
    name: product?.name ?? "",
    brand: product?.brand ?? "",
    category: product?.category ?? "",
    type: product?.type ?? "",
    description: product?.description ?? "",
    sizes: product?.sizes.join(", ") ?? "",
    priceFrom: product?.priceFrom?.toString() ?? "",
    unit: product?.unit ?? "",
    inStock: product?.inStock ?? true,
    featured: product?.featured ?? false,
  };
}

export default function ProductForm({ product, categoryGroups }: ProductFormProps) {
  const initial = useMemo(() => initialValues(product), [product]);
  const [values, setValues] = useState(initial);
  const [photo, setPhoto] = useState<{ blob: Blob; preview: string } | null>(null);
  const [clientErrors, setClientErrors] = useState<ProductFieldErrors>({});
  const save = useMemo(() => saveProductAction.bind(null, product?.id ?? null), [product?.id]);
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(save, {});
  const errors: ProductFieldErrors = { ...state.errors, ...clientErrors };

  const isDirty = photo !== null || (Object.keys(values) as (keyof FormValues)[]).some((key) => values[key] !== initial[key]);
  useUnsavedChanges(isDirty && !pending);

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.preview);
  }, [photo]);

  const group = categoryGroups.find((g) => g.id === values.category);
  const categoryOptions = [
    { value: "", label: "Choose a category" },
    ...categoryGroups.map((g) => ({ value: g.id, label: g.name })),
  ];
  const typeOptions = [
    { value: "", label: group ? "Choose a type" : "Choose a category first" },
    ...(group?.subtypes ?? []).map((subtype) => ({ value: subtype, label: subtype })),
  ];

  const clearError = (field: ProductField) => setClientErrors((current) => ({ ...current, [field]: undefined }));

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "category" && !categoryGroups.find((g) => g.id === value)?.subtypes.includes(current.type)) next.type = "";
      return next;
    });
    clearError(key);
  };

  const handlePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    clearError("photo");
    if (!file) return;
    if (!(file.type in PHOTO_TYPES)) {
      setClientErrors((current) => ({ ...current, photo: "Choose a JPEG, PNG or WebP photo." }));
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setClientErrors((current) => ({ ...current, photo: "This photo is over 8 MB. Choose a smaller one." }));
      return;
    }
    try {
      const blob = await resizePhoto(file);
      setPhoto({ blob, preview: URL.createObjectURL(blob) });
    } catch {
      setClientErrors((current) => ({ ...current, photo: "This photo couldn't be read. Try another one." }));
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const validation = validateProductInput(readProductForm(formData), categoryGroups);
    if (!validation.ok) {
      setClientErrors(validation.errors);
      return;
    }
    if (photo) formData.set("photo", photo.blob, "photo.jpg");
    startTransition(() => formAction(formData));
  };

  const fieldProps = (field: TextField) => ({
    id: field,
    name: field,
    value: values[field],
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => update(field, event.target.value),
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
    className: fieldClasses,
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {state.message && (
        <p role="alert" className="rounded-xl bg-accent-50 px-4 py-3 text-sm font-semibold text-accent-700">
          {state.message}
        </p>
      )}

      <section className="grid gap-5 rounded-card border border-line bg-card p-5 shadow-card sm:grid-cols-2 sm:p-6">
        <div className="sm:col-span-2">
          <FormField label="Product name" htmlFor="name" error={errors.name} required>
            <input {...fieldProps("name")} autoComplete="off" />
          </FormField>
        </div>
        <FormField label="Brand" htmlFor="brand" error={errors.brand} required>
          <input {...fieldProps("brand")} autoComplete="off" />
        </FormField>
        <FormField label="Category" htmlFor="category" error={errors.category} required>
          <SelectMenu
            id="category"
            label="Category"
            value={values.category}
            options={categoryOptions}
            onChange={(value) => update("category", value)}
            invalid={Boolean(errors.category)}
            describedBy={errors.category ? "category-error" : undefined}
          />
          <input type="hidden" name="category" value={values.category} />
        </FormField>
        <FormField label="Type" htmlFor="type" error={errors.type} required>
          <SelectMenu
            id="type"
            label="Type"
            value={values.type}
            options={typeOptions}
            onChange={(value) => update("type", value)}
            invalid={Boolean(errors.type)}
            describedBy={errors.type ? "type-error" : undefined}
          />
          <input type="hidden" name="type" value={values.type} />
        </FormField>
        <FormField label="Sizes" htmlFor="sizes" error={errors.sizes} hint="Separate with commas, for example 1 L, 4 L, 10 L" required>
          <input {...fieldProps("sizes")} autoComplete="off" />
        </FormField>
        <FormField
          label="Starting price (₹)"
          htmlFor="priceFrom"
          error={errors.priceFrom}
          hint="Whole rupees. Leave empty to show Ask for price"
        >
          <input {...fieldProps("priceFrom")} inputMode="numeric" autoComplete="off" />
        </FormField>
        <FormField label="Price unit" htmlFor="unit" error={errors.unit} hint="For example per litre or per sheet">
          <input {...fieldProps("unit")} autoComplete="off" />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Short description" htmlFor="description" error={errors.description}>
            <textarea {...fieldProps("description")} rows={3} />
          </FormField>
        </div>
      </section>

      <section className="grid gap-5 rounded-card border border-line bg-card p-5 shadow-card sm:grid-cols-[1fr_auto] sm:p-6">
        <FormField
          label="Photo"
          htmlFor="photo"
          error={errors.photo}
          hint="Take a photo with your phone or choose one. JPEG, PNG or WebP up to 8 MB."
        >
          <input
            id="photo"
            type="file"
            accept={PHOTO_ACCEPT}
            onChange={handlePhoto}
            aria-invalid={errors.photo ? true : undefined}
            aria-describedby={errors.photo ? "photo-error" : undefined}
            className="block w-full text-sm text-muted file:mr-3 file:min-h-11 file:rounded-xl file:border-0 file:bg-surface-muted file:px-4 file:font-semibold file:text-heading"
          />
        </FormField>
        {(photo || product?.image) && (
          <figure className="w-32">
            <div className="relative h-32 w-32 overflow-hidden rounded-xl border border-line bg-surface-muted">
              <Image
                src={photo?.preview ?? product?.image ?? ""}
                alt={photo ? "New photo" : "Current photo"}
                fill
                sizes="128px"
                unoptimized={Boolean(photo)}
                className="object-cover"
              />
            </div>
            <figcaption className="mt-1 text-center text-xs text-muted">{photo ? "New photo" : "Current photo"}</figcaption>
          </figure>
        )}
      </section>

      <section className="flex flex-wrap gap-x-8 gap-y-3 rounded-card border border-line bg-card p-5 shadow-card sm:p-6">
        <label className="inline-flex min-h-11 items-center gap-3 font-semibold text-heading">
          <input
            type="checkbox"
            name="inStock"
            checked={values.inStock}
            onChange={(e) => update("inStock", e.target.checked)}
            className="h-5 w-5 accent-success"
          />
          In stock
        </label>
        <label className="inline-flex min-h-11 items-center gap-3 font-semibold text-heading">
          <input
            type="checkbox"
            name="featured"
            checked={values.featured}
            onChange={(e) => update("featured", e.target.checked)}
            aria-describedby="featured-hint"
            className="h-5 w-5 accent-success"
          />
          Show on the home page
        </label>
        <p id="featured-hint" className="basis-full text-sm text-muted">
          The home page shows the {HOME_FEATURED_LIMIT} products added to it most recently.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save product"}
        </Button>
        <AppLink href={ROUTES.adminProducts} className={buttonClasses("secondary")}>
          Cancel
        </AppLink>
      </div>
    </form>
  );
}
