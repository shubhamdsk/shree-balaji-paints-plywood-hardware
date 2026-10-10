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
import { readOfferForm, validateOfferInput, type OfferFieldErrors, type OfferInput } from "@/lib/offer-input";
import { ROUTES } from "@/lib/routes";
import { saveOfferAction, type OfferFormState } from "@/server/actions/offers";
import type { Offer } from "@/types";

interface OfferFormProps {
  offer?: Offer;
  copyFrom?: Offer;
}

type Field = keyof OfferInput;

export default function OfferForm({ offer, copyFrom }: OfferFormProps) {
  const source = offer ?? copyFrom;
  const initial = useMemo<OfferInput>(
    () => ({
      title: source?.title ?? "",
      body: source?.body ?? "",
      startsOn: offer?.startsOn ?? "",
      endsOn: offer?.endsOn ?? "",
    }),
    [source, offer],
  );
  const [values, setValues] = useState(initial);
  const { photo, error: photoError, choose: choosePhoto } = usePhotoPicker();
  const validation = useFormValidation<keyof OfferFieldErrors>((form) => {
    const result = validateOfferInput(readOfferForm(new FormData(form)));
    return result.ok ? {} : result.errors;
  });
  const save = useMemo(
    () => saveOfferAction.bind(null, offer?.id ?? null, copyFrom?.id ?? null),
    [offer?.id, copyFrom?.id],
  );
  const [state, formAction, pending] = useActionState<OfferFormState, FormData>(save, {});
  const errors: OfferFieldErrors = { ...state.errors, ...validation.errors, ...(photoError && { photo: photoError }) };

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
      setValues((current) => ({ ...current, [field]: event.target.value }));
      validation.clearError(field);
    },
    "aria-invalid": errors[field] ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : undefined,
    className: fieldClasses,
  });

  return (
    <form onSubmit={handleSubmit} onBlur={validation.checkField} noValidate className="space-y-6">
      <FormAlert>{validation.summary ?? state.message}</FormAlert>

      <section className="grid gap-5 rounded-card border border-line bg-card p-5 shadow-card sm:grid-cols-2 sm:p-6">
        <div className="sm:col-span-2">
          <FormField label="Offer title" htmlFor="title" error={errors.title} required>
            <input {...fieldProps("title")} autoComplete="off" />
          </FormField>
        </div>
        <div className="sm:col-span-2">
          <FormField label="Offer details" htmlFor="body" error={errors.body} required>
            <textarea {...fieldProps("body")} rows={3} />
          </FormField>
        </div>
        <FormField label="Start date" htmlFor="startsOn" error={errors.startsOn} hint="Shows from the start of this day" required>
          <input {...fieldProps("startsOn")} type="date" />
        </FormField>
        <FormField label="End date" htmlFor="endsOn" error={errors.endsOn} hint="Shows until the end of this day" required>
          <input {...fieldProps("endsOn")} type="date" min={values.startsOn || undefined} />
        </FormField>
      </section>

      <PhotoField
        photo={photo}
        currentImage={source?.image}
        error={errors.photo}
        hint="Optional. JPEG, PNG or WebP up to 8 MB. Without a photo a standard picture is shown."
        onChoose={choosePhoto}
      />

      <div className="flex flex-wrap gap-3">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : "Save offer"}
        </Button>
        <AppLink href={ROUTES.adminOffers} className={buttonClasses("secondary")}>
          Cancel
        </AppLink>
      </div>
    </form>
  );
}
