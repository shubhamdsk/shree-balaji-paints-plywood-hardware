import { screen } from "@testing-library/react";
import type { FormEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import FormAlert from "@/components/ui/FormAlert";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import { useFormValidation, type FieldErrors } from "@/hooks/use-form-validation";
import { renderWithProviders } from "@/test/render";

type Field = "name" | "phone";

function rules(form: HTMLFormElement): FieldErrors<Field> {
  const data = new FormData(form);
  const errors: FieldErrors<Field> = {};
  if (!String(data.get("name")).trim()) errors.name = "Enter your name";
  if (!/^\d{10}$/.test(String(data.get("phone")))) errors.phone = "Enter a 10-digit mobile number";
  return errors;
}

function Harness({ onValid }: { onValid: () => void }) {
  const { errors, clearError, checkField, checkForm, summary } = useFormValidation(rules);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (checkForm(event.currentTarget)) onValid();
  };
  return (
    <form onSubmit={submit} onBlur={checkField} noValidate>
      <FormAlert>{summary}</FormAlert>
      {(["name", "phone"] as const).map((field) => (
        <FormField key={field} label={field === "name" ? "Name" : "Phone"} htmlFor={field} error={errors[field]}>
          <input
            id={field}
            name={field}
            onChange={() => clearError(field)}
            aria-describedby={errors[field] ? `${field}-error` : undefined}
            className={fieldClasses}
          />
        </FormField>
      ))}
      <button type="submit">Save</button>
    </form>
  );
}

describe("useFormValidation", () => {
  it("lists every error on save, focuses the first field and stops the save", async () => {
    const onValid = vi.fn();
    const { user } = renderWithProviders(<Harness onValid={onValid} />);
    await user.click(screen.getByRole("button", { name: "Save" }));

    expect(screen.getByRole("alert").textContent).toBe("Fix the 2 highlighted fields to continue.");
    expect(screen.getByText("Enter your name")).toBeDefined();
    expect(screen.getByText("Enter a 10-digit mobile number")).toBeDefined();
    expect(document.activeElement).toBe(screen.getByLabelText("Name"));
    expect(onValid).not.toHaveBeenCalled();
  });

  it("checks a field when it loses focus, but not while it is still empty", async () => {
    const { user } = renderWithProviders(<Harness onValid={vi.fn()} />);
    await user.click(screen.getByLabelText("Name"));
    await user.tab();
    expect(screen.queryByText("Enter your name")).toBeNull();

    await user.type(screen.getByLabelText("Phone"), "98765");
    await user.tab();
    expect(screen.getByText("Enter a 10-digit mobile number")).toBeDefined();
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("clears an error as the field is corrected and saves once everything is valid", async () => {
    const onValid = vi.fn();
    const { user } = renderWithProviders(<Harness onValid={onValid} />);
    await user.click(screen.getByRole("button", { name: "Save" }));
    await user.type(screen.getByLabelText("Name"), "Ravi");
    expect(screen.queryByText("Enter your name")).toBeNull();
    expect(screen.getByRole("alert").textContent).toBe("Fix the highlighted field to continue.");

    await user.type(screen.getByLabelText("Phone"), "9876543210");
    await user.click(screen.getByRole("button", { name: "Save" }));
    expect(onValid).toHaveBeenCalledOnce();
    expect(screen.queryByRole("alert")).toBeNull();
  });
});
