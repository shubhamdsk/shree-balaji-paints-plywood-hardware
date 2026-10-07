import type { ReactNode } from "react";

export const fieldClasses =
  "min-h-11 w-full rounded-xl border border-line bg-card px-3 py-2 text-[15px] font-medium text-ink placeholder:text-subtle focus:border-heading focus:outline-none focus:ring-2 focus:ring-brand-100";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
}

export default function FormField({ label, htmlFor, error, hint, required, children }: FormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="block text-sm font-bold text-heading">
        {label}
        {required && <span className="text-accent-600"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-[13px] font-semibold text-accent-600">
          {error}
        </p>
      ) : (
        hint && <p className="text-[13px] text-muted">{hint}</p>
      )}
    </div>
  );
}
