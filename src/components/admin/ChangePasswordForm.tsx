"use client";

import { useActionState, useState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import { CheckCircle2, KeyRound } from "@/components/ui/icons";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import { MIN_PASSWORD_LENGTH, type PasswordChangeInput } from "@/lib/password-rules";
import { changePasswordAction, type PasswordChangeState } from "@/server/actions/auth";

const FIELDS: { name: keyof PasswordChangeInput; label: string; autoComplete: string; hint?: string }[] = [
  { name: "currentPassword", label: "Current password", autoComplete: "current-password" },
  {
    name: "newPassword",
    label: "New password",
    autoComplete: "new-password",
    hint: `At least ${MIN_PASSWORD_LENGTH} characters. A few unrelated words with a number are easy to type and hard to guess.`,
  },
  { name: "confirmPassword", label: "Type the new password again", autoComplete: "new-password" },
];

export default function ChangePasswordForm() {
  const [isDirty, setIsDirty] = useState(false);
  const [state, formAction, pending] = useActionState<PasswordChangeState, FormData>(async (previous, formData) => {
    const next = await changePasswordAction(previous, formData);
    setIsDirty(false);
    return next;
  }, {});
  useUnsavedChanges(isDirty && !pending);

  function handleChange(event: FormEvent<HTMLFormElement>) {
    setIsDirty(FIELDS.some(({ name }) => new FormData(event.currentTarget).get(name) !== ""));
  }

  return (
    <form action={formAction} onChange={handleChange} className="space-y-5" noValidate>
      {state.changed && (
        <p role="status" className="flex items-center gap-2 rounded-xl bg-surface-muted px-4 py-3 text-sm font-semibold text-success">
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden />
          Password changed. Any other phone or computer that was logged in has been logged out.
        </p>
      )}
      {FIELDS.map(({ name, label, autoComplete, hint }) => {
        const error = state.errors?.[name];
        return (
          <FormField key={name} label={label} htmlFor={name} error={error} hint={hint} required>
            <input
              id={name}
              name={name}
              type="password"
              autoComplete={autoComplete}
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? `${name}-error` : undefined}
              className={fieldClasses}
            />
          </FormField>
        );
      })}
      <Button type="submit" variant="primary" disabled={pending}>
        <KeyRound className="h-4 w-4" aria-hidden />
        {pending ? "Changing…" : "Change password"}
      </Button>
    </form>
  );
}
