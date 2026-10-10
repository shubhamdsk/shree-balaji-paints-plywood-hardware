"use client";

import { useCallback, useState, type FocusEvent } from "react";

export type FieldErrors<F extends string> = Partial<Record<F, string>>;

function errorCount(errors: FieldErrors<string>) {
  return Object.values(errors).filter(Boolean).length;
}

/**
 * Runs a form's shared rules in the browser. Fields are named by their element id.
 * A field is checked when it loses focus once it has a value (or after a save attempt),
 * and the whole form is checked on save, moving focus to the first field with an error.
 */
export function useFormValidation<F extends string>(validate: (form: HTMLFormElement) => FieldErrors<F>) {
  const [errors, setErrors] = useState<FieldErrors<F>>({});
  const [attempted, setAttempted] = useState(false);

  const clearError = useCallback(
    (field: F) => setErrors((current) => (current[field] === undefined ? current : { ...current, [field]: undefined })),
    [],
  );

  const checkField = (event: FocusEvent<HTMLFormElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) || !target.id) return;
    if (target.type === "file" || target.type === "checkbox") return;
    const field = target.id as F;
    if (!target.value && !errors[field] && !attempted) return;
    const message = validate(event.currentTarget)[field];
    setErrors((current) => (current[field] === message ? current : { ...current, [field]: message }));
  };

  const checkForm = (form: HTMLFormElement) => {
    const found = validate(form);
    setErrors(found);
    setAttempted(true);
    if (errorCount(found) === 0) return true;
    Array.from(form.querySelectorAll<HTMLElement>("[id]"))
      .find((element) => found[element.id as F])
      ?.focus();
    return false;
  };

  const reset = useCallback(() => {
    setErrors({});
    setAttempted(false);
  }, []);

  const count = errorCount(errors);
  const summary =
    attempted && count > 0
      ? count === 1
        ? "Fix the highlighted field to continue."
        : `Fix the ${count} highlighted fields to continue.`
      : undefined;

  return { errors, clearError, checkField, checkForm, reset, summary };
}
