import type { ReactNode } from "react";

export const fieldClasses =
  "min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-800 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-orange-100";

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
      <label htmlFor={htmlFor} className="block text-sm font-bold text-brand-900">
        {label}
        {required && <span className="text-accent-600"> *</span>}
      </label>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} className="text-xs font-semibold text-red-600">
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-stone-500">{hint}</p>
      )}
    </div>
  );
}
