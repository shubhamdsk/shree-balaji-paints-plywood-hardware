"use client";

import { startTransition, useActionState, useMemo, useState, type ChangeEvent, type FormEvent } from "react";
import PhotoField from "@/components/admin/PhotoField";
import AppLink from "@/components/ui/AppLink";
import Button, { buttonClasses } from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import { useFormValidation } from "@/hooks/use-form-validation";
import { usePhotoPicker } from "@/hooks/use-photo-picker";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import {
  CATEGORY_LIMITS,
  SEO_DESCRIPTION_MAX,
  SEO_TITLE_MAX,
  readCategoryForm,
  validateCategoryInput,
  type CategoryFieldErrors,
} from "@/lib/category-input";
import { keepDigits } from "@/lib/text-rules";
import { saveCategoryAction, saveSubcategoryAction, type CategoryFormState } from "@/server/actions/categories";
import type { AdminCategoryRecord, AdminSubcategoryRecord } from "@/types";

type CategoryFormProps = { cancelHref: string; defaultSortOrder: number } & (
  | { kind: "category"; record?: AdminCategoryRecord }
  | { kind: "type"; categoryId: string; record?: AdminSubcategoryRecord }
);

type Values = ReturnType<typeof readCategoryForm>;
type Field = keyof Values;

const MORE_FIELDS = ["sortOrder", "seoTitle", "seoDescription"] as const;

export default function CategoryForm(props: CategoryFormProps) {
  const { kind, record, cancelHref, defaultSortOrder } = props;
  const categoryId = props.kind === "type" ? props.categoryId : null;
  const noun = kind === "category" ? "category" : "type";
  const initial = useMemo<Values>(
    () => ({
      name: record?.name ?? "",
      tagline: (record && "tagline" in record && record.tagline) || "",
      description: record?.description ?? "",
      sortOrder: String(record?.sortOrder ?? defaultSortOrder),
      seoTitle: record?.seoTitle ?? "",
      seoDescription: record?.seoDescription ?? "",
    }),
    [record, defaultSortOrder],
  );
  const [values, setValues] = useState(initial);
  const { photo, error: photoError, choose: choosePhoto } = usePhotoPicker();
  const validation = useFormValidation<keyof CategoryFieldErrors>((form) => {
    const result = validateCategoryInput(readCategoryForm(new FormData(form)));
    return result.ok ? {} : result.errors;
  });
  const save = useMemo(
    () =>
      categoryId === null
        ? saveCategoryAction.bind(null, record?.id ?? null)
        : saveSubcategoryAction.bind(null, categoryId, record?.id ?? null),
    [categoryId, record?.id],
  );
  const [state, formAction, pending] = useActionState<CategoryFormState, FormData>(save, {});
  const errors: CategoryFieldErrors = { ...state.errors, ...validation.errors, ...(photoError && { photo: photoError }) };
  const [moreOpen, setMoreOpen] = useState(false);
  const showMore = moreOpen || MORE_FIELDS.some((field) => errors[field]);

  const isDirty = photo !== null || (Object.keys(values) as Field[]).some((key) => values[key] !== initial[key]);
  useUnsavedChanges(isDirty && !pending);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validation.checkForm(event.currentTarget)) return;
    const formData = new FormData(event.currentTarget);
    if (photo) formData.set("photo", photo.blob, "photo.jpg");
    startTransition(() => formAction(formData));
  };

  const fieldProps = (field: Field) => ({
    id: field,
    name: field,
    value: values[field],
    onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const value = field === "sortOrder" ? keepDigits(event.target.value) : event.target.value;
      setValues((current) => ({ ...current, [field]: value }));
      validation.clearError(field);
    },
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
    className: fieldClasses,
  });

  return (
    <form onSubmit={handleSubmit} onBlur={validation.checkField} noValidate className="space-y-6">
      <FormAlert>{validation.summary ?? state.message}</FormAlert>

      <section className="grid gap-5 rounded-card border border-line bg-card p-5 shadow-card sm:p-6">
        <FormField
          label={kind === "category" ? "Category name" : "Type name"}
          htmlFor="name"
          error={errors.name}
          hint={record ? "Products stay linked when you rename it." : undefined}
          required
        >
          <input {...fieldProps("name")} autoComplete="off" maxLength={CATEGORY_LIMITS.name} />
        </FormField>
        {kind === "category" && (
          <FormField label="Tagline" htmlFor="tagline" error={errors.tagline} hint="One short line shown on the home page">
            <input {...fieldProps("tagline")} autoComplete="off" maxLength={CATEGORY_LIMITS.tagline} />
          </FormField>
        )}
        <FormField label="Description" htmlFor="description" error={errors.description}>
          <textarea {...fieldProps("description")} rows={3} maxLength={CATEGORY_LIMITS.description} />
        </FormField>
      </section>

      <PhotoField
        photo={photo}
        currentImage={record?.image}
        error={errors.photo}
        hint={`Optional. JPEG, PNG or WebP up to 8 MB. Without a photo the ${noun} shows a plain placeholder.`}
        onChoose={choosePhoto}
      />

      <details
        open={showMore}
        onToggle={(event) => setMoreOpen(event.currentTarget.open)}
        className="group rounded-card border border-line bg-card shadow-card"
      >
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-bold text-heading sm:px-6">
          More options
          <span className="text-sm font-semibold text-muted group-open:hidden">Position and Google search</span>
        </summary>
        <div className="grid gap-5 border-t border-line p-5 sm:p-6">
          <FormField label="Position" htmlFor="sortOrder" error={errors.sortOrder} hint="Lower numbers show first" required>
            <input {...fieldProps("sortOrder")} inputMode="numeric" autoComplete="off" maxLength={4} />
          </FormField>
          <FormField
            label="Search title"
            htmlFor="seoTitle"
            error={errors.seoTitle}
            hint={`Optional, up to ${SEO_TITLE_MAX} characters. The shop name is added after it. Leave empty to use the name.`}
          >
            <input {...fieldProps("seoTitle")} autoComplete="off" maxLength={SEO_TITLE_MAX} />
          </FormField>
          <FormField
            label="Search description"
            htmlFor="seoDescription"
            error={errors.seoDescription}
            hint={`Optional, up to ${SEO_DESCRIPTION_MAX} characters. Leave empty to use the description.`}
          >
            <textarea {...fieldProps("seoDescription")} rows={2} maxLength={SEO_DESCRIPTION_MAX} />
          </FormField>
        </div>
      </details>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : `Save ${noun}`}
        </Button>
        <AppLink href={cancelHref} className={buttonClasses("secondary")}>
          Cancel
        </AppLink>
      </div>
    </form>
  );
}
