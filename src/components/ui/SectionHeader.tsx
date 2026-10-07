import AppLink from "@/components/ui/AppLink";
import { ArrowRight } from "@/components/ui/icons";
import Reveal from "@/components/ui/Reveal";

interface SectionHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  href?: string;
  linkLabel?: string;
  tone?: "light" | "dark";
  align?: "start" | "center";
}

export default function SectionHeader({
  title,
  description,
  eyebrow,
  href,
  linkLabel,
  tone = "light",
  align = "start",
}: SectionHeaderProps) {
  const dark = tone === "dark";
  const centered = align === "center";

  return (
    <Reveal
      className={`mb-8 flex flex-wrap items-end gap-4 sm:mb-10 ${centered ? "justify-center text-center" : "justify-between"}`}
    >
      <div className={centered ? "max-w-2xl" : "max-w-3xl"}>
        {eyebrow && (
          <p className={`text-[13px] font-bold tracking-[0.14em] uppercase ${dark ? "text-gold-300" : "text-accent-600"}`}>
            {eyebrow}
          </p>
        )}
        <h2
          className={`mt-1 text-[1.65rem] leading-tight font-extrabold sm:text-3xl lg:text-[2.25rem] ${
            dark ? "text-white" : "text-brand-900"
          }`}
        >
          {title}
        </h2>
        {description && (
          <p className={`mt-2 text-[15px] leading-relaxed sm:text-base ${dark ? "text-brand-100" : "text-muted"}`}>
            {description}
          </p>
        )}
      </div>
      {href && linkLabel && (
        <AppLink
          href={href}
          className={`inline-flex min-h-11 items-center gap-1.5 text-[15px] font-semibold ${
            dark ? "text-gold-300 hover:text-white" : "text-accent-600 hover:text-accent-700"
          }`}
        >
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </AppLink>
      )}
    </Reveal>
  );
}
