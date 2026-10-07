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
              className="card-lift flex h-[72px] flex-col items-center justify-center gap-1 rounded-xl border border-line bg-white px-2 py-2 hover:border-brand-200 sm:h-20 sm:px-3"
            >
              <BrandWordmark name={name} variant="card" />
              {countLabel && <span className="text-[11px] font-medium text-slate-600">{countLabel}</span>}
            </AppLink>
          </li>
        );
      })}
    </ul>
  );
}
