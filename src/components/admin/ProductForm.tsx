"use client";

import { startTransition, useActionState, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import PhotoField from "@/components/admin/PhotoField";
import AppLink from "@/components/ui/AppLink";
import Button, { buttonClasses } from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import SelectMenu from "@/components/ui/SelectMenu";
import { useFormValidation } from "@/hooks/use-form-validation";
import { usePhotoPicker } from "@/hooks/use-photo-picker";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { HOME_FEATURED_LIMIT } from "@/lib/catalog";
import { formatPrice } from "@/lib/price";
import { sizesForUnit, unitOptions } from "@/lib/price-units";
import { readProductForm, validateProductInput, type ProductField, type ProductFieldErrors } from "@/lib/product-input";
import { ROUTES } from "@/lib/routes";
import { keepDigits } from "@/lib/text-rules";
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
  sizes: string[];
  priceFrom: string;
  unit: string;
  inStock: boolean;
  featured: boolean;
}

type TextField = "name" | "brand" | "description" | "priceFrom";

function initialValues(product?: AdminProduct): FormValues {
  return {
    name: product?.name ?? "",
    brand: product?.brand ?? "",
    category: product?.category ?? "",
    type: product?.type ?? "",
    description: product?.description ?? "",
    sizes: product?.sizes ?? [],
    priceFrom: product?.priceFrom?.toString() ?? "",
    unit: product?.unit ?? "",
    inStock: product?.inStock ?? true,
    featured: product?.featured ?? false,
  };
}

export default function ProductForm({ product, categoryGroups }: ProductFormProps) {
  const initial = useMemo(() => initialValues(product), [product]);
  const saved = useMemo(() => product && { unit: product.unit, sizes: product.sizes }, [product]);
  const [values, setValues] = useState(initial);
  const { photo, error: photoError, choose: choosePhoto } = usePhotoPicker();
  const validation = useFormValidation<ProductField>((form) => {
    const result = validateProductInput(readProductForm(new FormData(form)), categoryGroups, saved);
    return result.ok ? {} : result.errors;
  });
  const save = useMemo(() => saveProductAction.bind(null, product?.id ?? null), [product?.id]);
  const [state, formAction, pending] = useActionState<ProductFormState, FormData>(save, {});
  const errors: ProductFieldErrors = { ...state.errors, ...validation.errors, ...(photoError && { photo: photoError }) };

  const isDirty =
    photo !== null ||
    (Object.keys(values) as (keyof FormValues)[]).some((key) => String(values[key]) !== String(initial[key]));
  useUnsavedChanges(isDirty && !pending);

  const group = categoryGroups.find((g) => g.id === values.category);
  const categoryOptions = [
    { value: "", label: "Choose a category" },
    ...categoryGroups.map((g) => ({ value: g.id, label: g.name })),
  ];
  const typeOptions = [
    { value: "", label: group ? "Choose a type" : "Choose a category first" },
    ...(group?.subtypes ?? []).map((subtype) => ({ value: subtype, label: subtype })),
  ];
  const sizeOptions = sizesForUnit(values.unit, saved).map((size) => ({ value: size, label: size }));
  const pricePreview = values.unit && /^\d+$/.test(values.priceFrom) ? formatPrice(Number(values.priceFrom), values.unit) : "";

  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => {
    setValues((current) => {
      const next = { ...current, [key]: value };
      if (key === "category" && !categoryGroups.find((g) => g.id === value)?.subtypes.includes(current.type)) next.type = "";
      if (key === "unit") {
        const offered = sizesForUnit(value as string, saved);
        next.sizes = current.sizes.filter((size) => offered.includes(size));
      }
      return next;
    });
    validation.clearError(key);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validation.checkForm(event.currentTarget)) return;
    const formData = new FormData(event.currentTarget);
    if (photo) formData.set("photo", photo.blob, "photo.jpg");
    startTransition(() => formAction(formData));
  };

  const fieldProps = (field: TextField) => ({
    id: field,
    name: field,
    value: values[field],
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      update(field, field === "priceFrom" ? keepDigits(event.target.value) : event.target.value),
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
    className: fieldClasses,
  });

  const menuProps = (field: "category" | "type" | "unit" | "sizes") => ({
    id: field,
    invalid: Boolean(errors[field]),
    describedBy: errors[field] ? `${field}-error` : undefined,
  });

  return (
    <form onSubmit={handleSubmit} onBlur={validation.checkField} noValidate className="space-y-6">
      {product?.needsCategory && (
        <p className="rounded-xl bg-gold-100 px-4 py-3 text-sm font-semibold text-heading">
          The type this product was in has been removed, so it isn&apos;t on the website. Choose a category and type, then
          save.
        </p>
      )}
      <FormAlert>{validation.summary ?? state.message}</FormAlert>

      <section className="grid gap-5 rounded-card border border-line bg-card p-5 shadow-card sm:grid-cols-2 sm:p-6">
        <div className="sm:col-span-2">
          <FormField label="Product name" htmlFor="name" error={errors.name} required>
            <input {...fieldProps("name")} autoComplete="off" maxLength={120} />
          </FormField>
        </div>
        <FormField label="Brand" htmlFor="brand" error={errors.brand} required>
          <input {...fieldProps("brand")} autoComplete="off" maxLength={60} />
        </FormField>
        <FormField label="Category" htmlFor="category" error={errors.category} required>
          <SelectMenu
            {...menuProps("category")}
            label="Category"
            value={values.category}
            options={categoryOptions}
            onChange={(value) => update("category", value)}
          />
          <input type="hidden" name="category" value={values.category} />
        </FormField>
        <FormField label="Type" htmlFor="type" error={errors.type} required>
          <SelectMenu
            {...menuProps("type")}
            label="Type"
            value={values.type}
            options={typeOptions}
            onChange={(value) => update("type", value)}
          />
          <input type="hidden" name="type" value={values.type} />
        </FormField>
        <FormField
          label="Price unit"
          htmlFor="unit"
          error={errors.unit}
          hint="How the product is priced and sold"
          required
        >
          <SelectMenu
            {...menuProps("unit")}
            label="Price unit"
            value={values.unit}
            options={unitOptions(saved)}
            placeholder="Choose a price unit"
            onChange={(value) => update("unit", value)}
          />
          <input type="hidden" name="unit" value={values.unit} />
        </FormField>
        <FormField
          label="Sizes"
          htmlFor="sizes"
          error={errors.sizes}
          hint={values.unit ? "Tick every size you sell" : "Choose a price unit to see its sizes"}
          required
        >
          <SelectMenu
            {...menuProps("sizes")}
            label="Sizes"
            multiple
            value={values.sizes}
            options={sizeOptions}
            placeholder={values.unit ? "Choose sizes" : "Choose a price unit first"}
            disabled={!values.unit}
            onChange={(value) => update("sizes", value)}
          />
          {values.sizes.map((size) => (
            <input key={size} type="hidden" name="sizes" value={size} />
          ))}
        </FormField>
        <FormField
          label="Starting price (₹)"
          htmlFor="priceFrom"
          error={errors.priceFrom}
          hint={pricePreview ? `Shows as "${pricePreview}"` : "Whole rupees. Leave empty to show Ask for price"}
        >
          <input {...fieldProps("priceFrom")} inputMode="numeric" autoComplete="off" maxLength={7} />
        </FormField>
        <div className="sm:col-span-2">
          <FormField label="Short description" htmlFor="description" error={errors.description} hint="Up to 500 characters">
            <textarea {...fieldProps("description")} rows={3} maxLength={500} />
          </FormField>
        </div>
      </section>

      <PhotoField
        photo={photo}
        currentImage={product?.image}
        error={errors.photo}
        hint="Take a photo with your phone or choose one. JPEG, PNG or WebP up to 8 MB."
        onChoose={choosePhoto}
      />

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
