import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "cta" | "secondary" | "light" | "danger" | "whatsapp";
export type ButtonSize = "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary: "btn-gloss btn-primary bg-brand-900",
  cta: "btn-gloss btn-cta bg-accent-600",
  secondary: "border border-line bg-card text-heading shadow-card hover:border-heading",
  light: "bg-white text-brand-900 shadow-card hover:bg-white/90",
  danger: "btn-gloss btn-cta bg-accent-600",
  whatsapp: "btn-gloss btn-whatsapp bg-whatsapp-strong",
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
