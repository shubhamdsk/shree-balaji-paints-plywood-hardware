import type { ReactNode } from "react";

interface FormAlertProps {
  id?: string;
  children?: ReactNode;
}

export default function FormAlert({ id, children }: FormAlertProps) {
  if (!children) return null;
  return (
    <p id={id} role="alert" className="rounded-xl bg-accent-50 px-4 py-3 text-sm font-semibold text-accent-700">
      {children}
    </p>
  );
}
