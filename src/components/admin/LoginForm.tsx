"use client";

import { useActionState } from "react";
import Button from "@/components/ui/Button";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import { KeyRound } from "@/components/ui/icons";
import { logInAction, type LoginState } from "@/server/actions/auth";

const ERROR_ID = "login-error";

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(logInAction, {});
  const describedBy = state.error ? ERROR_ID : undefined;

  return (
    <form action={formAction} className="space-y-5" noValidate>
      <FormField label="Username" htmlFor="username" required>
        <input
          id="username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          required
          defaultValue={state.username}
          aria-invalid={state.error ? true : undefined}
          aria-describedby={describedBy}
          className={fieldClasses}
        />
      </FormField>
      <FormField label="Password" htmlFor="password" required>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={state.error ? true : undefined}
          aria-describedby={describedBy}
          className={fieldClasses}
        />
      </FormField>
      {state.error && (
        <p id={ERROR_ID} role="alert" className="rounded-xl bg-accent-50 px-4 py-3 text-sm font-semibold text-accent-700">
          {state.error}
        </p>
      )}
      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        <KeyRound className="h-4 w-4" aria-hidden />
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
