import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "whatsapp";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-900 text-white hover:bg-stone-800",
  secondary: "border-2 border-stone-300 bg-white text-brand-900 hover:border-accent-400",
  danger: "bg-red-600 text-white hover:bg-red-700",
  whatsapp: "bg-[#25D366] text-white hover:brightness-95",
};

export function buttonClasses(variant: ButtonVariant = "primary", className = "") {
  return `inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${className}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export default function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}
