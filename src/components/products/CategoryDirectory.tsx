import { ArrowRight } from "@/components/ui/icons";
import AppLink from "@/components/ui/AppLink";
import CoverImage from "@/components/ui/CoverImage";
import { countProducts } from "@/lib/catalog";
import { ROUTES } from "@/lib/routes";
import type { Category, CategoryGroup, ProductSummary } from "@/types";

interface Props {
  categories: Category[];
  groups: CategoryGroup[];
  products: ProductSummary[];
}

export default function CategoryDirectory({ categories, groups, products }: Props) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3">
      {categories.map((category) => {
        const subtypes = (groups.find((g) => g.id === category.id)?.subtypes ?? []).filter(
          (s) => countProducts(products, category.id, s) > 0,
        );
        const total = countProducts(products, category.id);
        if (total === 0) return null;
        return (
          <li key={category.id} className="flex flex-col overflow-hidden rounded-card border border-line bg-card shadow-card">
            <AppLink href={ROUTES.category(category.id)} className="group relative block aspect-[16/9] overflow-hidden bg-surface-muted">
              <CoverImage
                src={category.image}
                alt=""
                sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="img-zoom object-cover"
              />
              <span aria-hidden className="absolute inset-0 bg-linear-to-t from-brand-950/85 via-brand-950/20 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <span className="block text-xl font-bold text-white sm:text-2xl">{category.name}</span>
                <span className="mt-0.5 flex items-center gap-1.5 text-sm text-brand-100">
                  {total} product{total === 1 ? "" : "s"}
                  <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </span>
            </AppLink>
            <div className="flex flex-1 flex-col p-4 sm:p-5">
              <p className="text-[15px] leading-relaxed text-muted">{category.description}</p>
              {subtypes.length > 1 && (
                <ul aria-label={`${category.name} types`} className="mt-4 flex flex-wrap gap-2">
                  {subtypes.map((s) => (
                    <li key={s}>
                      <AppLink
                        href={ROUTES.category(category.id, s)}
                        className="inline-flex min-h-9 items-center rounded-lg border border-line bg-canvas px-3 text-[13px] font-semibold text-heading transition hover:border-accent-600 hover:text-accent-600"
                      >
                        {s}
                      </AppLink>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
