import { LogoMark } from "@/components/brand/LogoMark";
import { Namam } from "@/components/brand/Namam";
import AppLink from "@/components/ui/AppLink";
import { shop } from "@/config/shop";

type LogoProps = {
  /** Light text for dark backgrounds (footer). */
  light?: boolean;
  /** Mark only — no wordmark or tagline. */
  compact?: boolean;
};

export default function Logo({ light = false, compact = false }: LogoProps) {
  const mark = (
    <LogoMark
      className={`h-11 w-11 shrink-0 sm:h-13 sm:w-13 ${light ? "rounded-xl bg-white p-1" : ""}`}
    />
  );

  if (compact) {
    return (
      <AppLink href="/" className="inline-flex shrink-0" aria-label={shop.shortName}>
        {mark}
      </AppLink>
    );
  }

  return (
    <AppLink
      href="/"
      aria-label={shop.name}
      className="flex min-w-0 max-w-[calc(100%-7rem)] items-center gap-2 sm:max-w-none"
    >
      {mark}
      <span className="min-w-0 font-display leading-none">
        <span className="flex items-end gap-1">
          <span className={`text-sm font-semibold ${light ? "text-logo-gold" : "text-logo-navy"}`}>
            {shop.marathi.prefix}
          </span>
          <span className={`text-2xl font-extrabold sm:text-[1.7rem] ${light ? "text-white" : "text-logo-red"}`}>
            {shop.marathi.name}
          </span>
          <Namam className="mb-1 h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
        </span>
        <span
          className={`mt-0.5 block truncate text-[11px] font-semibold sm:text-[13px] ${
            light ? "text-stone-300" : "text-logo-navy"
          }`}
        >
          {shop.marathi.tagline}
        </span>
      </span>
    </AppLink>
  );
}
