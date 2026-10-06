import Link from "next/link";
import { LogoMark } from "./LogoMark";
import { shop } from "@/data/shop";

const LOGO_TAGLINE = "Paints · Plywood · Hardware";

type LogoProps = {
  /** Light text for dark backgrounds (footer). */
  light?: boolean;
  /** Mark only — no wordmark or tagline. */
  compact?: boolean;
};

export default function Logo({ light = false, compact = false }: LogoProps) {
  const mark = (
    <LogoMark className="h-10 w-10 shrink-0 shadow-sm sm:h-11 sm:w-11" />
  );

  if (compact) {
    return (
      <Link href="/" className="inline-flex shrink-0" aria-label={shop.shortName}>
        {mark}
      </Link>
    );
  }

  return (
    <Link
      href="/"
      className="flex min-w-0 max-w-[calc(100%-7rem)] items-center gap-2.5 sm:max-w-none sm:gap-3"
    >
      {mark}
      <span className="min-w-0 leading-tight">
        <span
          className={`block truncate text-base font-bold tracking-tight sm:text-lg ${
            light ? "text-white" : "text-brand-900"
          }`}
        >
          {shop.shortName}
        </span>
        <span
          className={`hidden truncate text-[10px] font-medium tracking-[0.12em] uppercase sm:block ${
            light ? "text-stone-400" : "text-muted"
          }`}
        >
          {LOGO_TAGLINE}
        </span>
      </span>
    </Link>
  );
}
