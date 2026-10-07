import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "cta" | "secondary" | "light" | "danger" | "whatsapp";
export type ButtonSize = "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-brand-900 text-white hover:bg-brand-700",
  cta: "bg-accent-600 text-white shadow-card hover:bg-accent-700 hover:shadow-card-hover",
  secondary: "border border-line bg-white text-brand-900 hover:border-brand-900",
  light: "bg-white text-brand-900 hover:bg-surface-muted",
  danger: "bg-accent-600 text-white hover:bg-accent-700",
  whatsapp: "bg-whatsapp-strong text-white hover:brightness-110",
};

const sizeClasses: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-sm",
  lg: "min-h-12 px-6 text-base",
};

export function buttonClasses(variant: ButtonVariant = "primary", className = "", size: ButtonSize = "md") {
  return `inline-flex items-center justify-center gap-2 rounded-xl py-2.5 font-semibold transition duration-200 ease-premium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`;
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export default function Button({ variant = "primary", className, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={buttonClasses(variant, className)} {...props} />;
}
