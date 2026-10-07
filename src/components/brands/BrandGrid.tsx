import BrandWordmark from "@/components/brand/BrandWordmark";
import AppLink from "@/components/ui/AppLink";
import { ROUTES } from "@/lib/routes";

interface BrandGridProps {
  brands: string[];
  counts?: Record<string, number>;
}

export default function BrandGrid({ brands, counts }: BrandGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-2.5 min-[400px]:grid-cols-3 sm:gap-3 lg:grid-cols-5">
      {brands.map((name) => {
        const count = counts?.[name];
        const countLabel = count === undefined ? "" : `${count} ${count === 1 ? "product" : "products"}`;
        return (
          <li key={name}>
            <AppLink
              href={ROUTES.brand(name)}
              aria-label={countLabel ? `${name}, ${countLabel}` : `${name} products`}
              className="group flex h-[82px] flex-col items-center justify-center gap-1 rounded-card border border-line bg-card px-3 py-2.5 shadow-card transition-all duration-200 ease-premium hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover sm:h-24"
            >
              <BrandWordmark name={name} variant="card" darkTile />
              {countLabel && <span className="text-[11px] font-medium text-muted">{countLabel}</span>}
            </AppLink>
          </li>
        );
      })}
    </ul>
  );
}
