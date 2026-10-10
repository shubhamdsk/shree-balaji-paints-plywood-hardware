"use client";

import { useActionState, type FormEvent } from "react";
import Button from "@/components/ui/Button";
import FormAlert from "@/components/ui/FormAlert";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import { KeyRound } from "@/components/ui/icons";
import { useFormValidation } from "@/hooks/use-form-validation";
import { validateLogin, type LoginInput } from "@/lib/password-rules";
import { logInAction, type LoginState } from "@/server/actions/auth";

const ERROR_ID = "login-error";

function readLogin(form: HTMLFormElement): LoginInput {
  const data = new FormData(form);
  return { username: String(data.get("username") ?? ""), password: String(data.get("password") ?? "") };
}

export default function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(logInAction, {});
  const { errors, clearError, checkField, checkForm } = useFormValidation<keyof LoginInput>((form) =>
    validateLogin(readLogin(form)),
  );

  const fieldProps = (field: keyof LoginInput) => ({
    id: field,
    name: field,
    required: true,
    onChange: () => clearError(field),
    "aria-invalid": errors[field] || state.error ? true : undefined,
    "aria-describedby": errors[field] ? `${field}-error` : state.error ? ERROR_ID : undefined,
    className: fieldClasses,
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    if (!checkForm(event.currentTarget)) event.preventDefault();
  };

  return (
    <form action={formAction} onSubmit={handleSubmit} onBlur={checkField} className="space-y-5" noValidate>
      <FormField label="Username" htmlFor="username" error={errors.username} required>
        <input
          {...fieldProps("username")}
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          defaultValue={state.username}
        />
      </FormField>
      <FormField label="Password" htmlFor="password" error={errors.password} required>
        <input {...fieldProps("password")} type="password" autoComplete="current-password" />
      </FormField>
      <FormAlert id={ERROR_ID}>{state.error}</FormAlert>
      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        <KeyRound className="h-4 w-4" aria-hidden />
        {pending ? "Logging in…" : "Log in"}
      </Button>
    </form>
  );
}
