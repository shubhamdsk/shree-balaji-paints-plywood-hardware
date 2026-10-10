"use client";

import { useState, useTransition, type FormEvent } from "react";
import PhotoField from "@/components/admin/PhotoField";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import { X } from "@/components/ui/icons";
import SelectMenu from "@/components/ui/SelectMenu";
import { useFormValidation } from "@/hooks/use-form-validation";
import { usePhotoPicker } from "@/hooks/use-photo-picker";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import {
  GALLERY_CATEGORIES,
  GALLERY_LIMITS,
  validateGalleryInput,
  type GalleryField,
  type GalleryFieldErrors,
  type GalleryFormInput,
} from "@/lib/gallery-input";
import { saveGalleryItemAction, type GalleryFormState } from "@/server/actions/gallery";
import type { GalleryItem } from "@/types";

const categoryOptions = GALLERY_CATEGORIES.map((category) => ({ value: category, label: category }));

interface GalleryFormProps {
  item: GalleryItem | null;
  onClose: () => void;
}

export default function GalleryForm({ item, onClose }: GalleryFormProps) {
  const initial: GalleryFormInput = {
    title: item?.title ?? "",
    category: item?.category ?? GALLERY_CATEGORIES[0],
    caption: item?.caption ?? "",
  };
  const [values, setValues] = useState(initial);
  const { photo, error: photoError, choose: choosePhoto } = usePhotoPicker();
  const [state, setState] = useState<GalleryFormState>({});
  const [pending, startTransition] = useTransition();
  const validation = useFormValidation<GalleryField>(() => {
    const result = validateGalleryInput(values, { needsPhoto: !item && !photo });
    return result.ok ? {} : result.errors;
  });
  const errors: GalleryFieldErrors = { ...state.errors, ...validation.errors, ...(photoError && { photo: photoError }) };

  const isDirty = photo !== null || (Object.keys(values) as (keyof GalleryFormInput)[]).some((key) => values[key] !== initial[key]);
  const { confirmDiscard } = useUnsavedChanges(isDirty && !pending);

  const update = (field: keyof GalleryFormInput, value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    validation.clearError(field);
  };

  const close = async () => {
    if (await confirmDiscard()) onClose();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validation.checkForm(event.currentTarget)) return;
    const formData = new FormData(event.currentTarget);
    if (photo) formData.set("photo", photo.blob, "photo.jpg");
    startTransition(async () => {
      const result = await saveGalleryItemAction(item?.id ?? null, {}, formData);
      if (result?.errors || result?.message) setState(result);
      else onClose();
    });
  };

  const describedBy = (field: GalleryField) => (errors[field] ? `${field}-error` : undefined);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="max-h-full w-full max-w-lg space-y-4 overflow-y-auto rounded-card border border-line bg-card p-6 card-shadow">
        <div className="flex items-center justify-between border-b border-line pb-3">
          <h2 className="text-lg font-bold text-heading">{item ? "Edit photo" : "Add photo"}</h2>
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="rounded-lg p-1 text-muted hover:bg-surface-muted"
          >
            <X className="h-5 w-5" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} onBlur={validation.checkField} noValidate className="space-y-4 text-sm">
          <FormAlert>{validation.summary ?? state.message}</FormAlert>
          <FormField label="Title" htmlFor="title" error={errors.title} required>
            <input
              id="title"
              name="title"
              value={values.title}
              onChange={(e) => update("title", e.target.value)}
              maxLength={GALLERY_LIMITS.title}
              aria-invalid={errors.title ? true : undefined}
              aria-describedby={describedBy("title")}
              className={fieldClasses}
              placeholder="e.g. Living Room Wall Painting at Kotul"
            />
          </FormField>

          <FormField label="Category" htmlFor="category" error={errors.category} required>
            <SelectMenu
              id="category"
              label="Category"
              value={values.category}
              onChange={(value) => update("category", value)}
              options={categoryOptions}
              invalid={Boolean(errors.category)}
              describedBy={describedBy("category")}
            />
            <input type="hidden" name="category" value={values.category} />
          </FormField>

          <FormField
            label="Caption"
            htmlFor="caption"
            error={errors.caption}
            hint={`Optional, up to ${GALLERY_LIMITS.caption} characters`}
          >
            <textarea
              id="caption"
              name="caption"
              rows={3}
              value={values.caption}
              onChange={(e) => update("caption", e.target.value)}
              maxLength={GALLERY_LIMITS.caption}
              aria-invalid={errors.caption ? true : undefined}
              aria-describedby={describedBy("caption")}
              className={`${fieldClasses} resize-y`}
              placeholder="Details about products used, finish quality or customer requirements"
            />
          </FormField>

          <PhotoField
            photo={photo}
            currentImage={item?.image}
            error={errors.photo}
            hint={item ? "Optional. Choose a new photo to replace the current one." : "JPEG, PNG or WebP up to 8 MB."}
            onChoose={(file) => {
              validation.clearError("photo");
              void choosePhoto(file);
            }}
          />

          <div className="flex justify-end gap-2 border-t border-line pt-4">
            <Button variant="secondary" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" variant="cta" disabled={pending}>
              {pending ? "Saving…" : "Save photo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
