import BrandWordmark from "@/components/brand/BrandWordmark";
import AppLink from "@/components/ui/AppLink";
import { ROUTES } from "@/lib/routes";

interface BrandGridProps {
  brands: string[];
  counts?: Record<string, number>;
}

export default function BrandGrid({ brands, counts }: BrandGridProps) {
  return (
    <ul className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:grid-cols-5">
      {brands.map((name) => {
        const count = counts?.[name];
        const countLabel = count === undefined ? "" : `${count} ${count === 1 ? "product" : "products"}`;
        return (
          <li key={name}>
            <AppLink
              href={ROUTES.brand(name)}
              aria-label={countLabel ? `${name}, ${countLabel}` : `${name} products`}
              className="flex h-[68px] flex-col items-center justify-center gap-1 rounded-xl border border-stone-200/90 bg-white px-2 py-2 shadow-[0_2px_12px_-4px_rgba(28,25,23,0.1)] transition hover:border-accent-400 sm:h-[76px] sm:rounded-2xl sm:px-3"
            >
              <BrandWordmark name={name} variant="card" />
              {countLabel && <span className="text-[11px] font-medium text-muted">{countLabel}</span>}
            </AppLink>
          </li>
        );
      })}
    </ul>
  );
}
