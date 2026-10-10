"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PackageSearch, SlidersHorizontal } from "@/components/ui/icons";
import ProductCard from "@/components/products/ProductCard";
import ProductSidebar from "@/components/products/ProductSidebar";
import Button from "@/components/ui/Button";
import { fieldClasses } from "@/components/ui/FormField";
import SelectMenu from "@/components/ui/SelectMenu";
import { compareByPrice, getBrandNames } from "@/lib/catalog";
import { ROUTES } from "@/lib/routes";
import type { CatalogProduct, CategoryFilter, CategoryGroup, ProductSummary, SortOption } from "@/types";

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name", label: "Sort: Name" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

interface ProductCatalogProps {
  products: CatalogProduct[];
  index: ProductSummary[];
  categoryGroups: CategoryGroup[];
  category?: CategoryFilter;
  subtype?: string;
}

export default function ProductCatalog({
  products,
  index,
  categoryGroups,
  category = "all",
  subtype = "",
}: ProductCatalogProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState<SortOption>("name");
  const filterKey = `${category}|${subtype}`;
  const [shown, setShown] = useState({ key: filterKey, count: PAGE_SIZE });
  const shownCount = shown.key === filterKey ? shown.count : PAGE_SIZE;
  const resetShown = () => setShown({ key: filterKey, count: PAGE_SIZE });
  const [mobileFilters, setMobileFilters] = useState(false);

  const inCategory = useMemo(
    () => (category === "all" ? products : products.filter((p) => p.category === category)),
    [products, category],
  );
  const brandOptions = useMemo(
    () => [{ value: "", label: "All Brands" }, ...getBrandNames(products).map((b) => ({ value: b, label: b }))],
    [products],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = inCategory.filter(
      (p) =>
        (!brand || p.brand === brand) &&
        (!subtype || p.type === subtype) &&
        (!q || `${p.name} ${p.brand} ${p.type} ${p.description}`.toLowerCase().includes(q)),
    );
    list = [...list].sort((a, b) => {
      if (sort === "price-asc") return compareByPrice(a, b, "asc");
      if (sort === "price-desc") return compareByPrice(a, b, "desc");
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [inCategory, query, brand, subtype, sort]);

  const pageItems = filtered.slice(0, shownCount);

  const pushFilters = (nextCategory: CategoryFilter, nextSubtype: string) => {
    const href =
      nextCategory === "all" ? ROUTES.products : ROUTES.category(nextCategory, nextSubtype || undefined);
    router.push(href, { scroll: false });
  };

  const sidebarProps = { index, categoryGroups, category, subtype };

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <div className="hidden w-full shrink-0 lg:block lg:w-64 xl:w-72">
        <ProductSidebar {...sidebarProps} onSelect={pushFilters} />
      </div>

      <div className="min-w-0 flex-1 space-y-5">
        <button
          type="button"
          onClick={() => setMobileFilters((v) => !v)}
          aria-expanded={mobileFilters}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-line bg-card text-sm font-semibold text-heading lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Categories
        </button>

        {mobileFilters && (
          <div className="lg:hidden">
            <ProductSidebar
              {...sidebarProps}
              onSelect={(c, t) => {
                pushFilters(c, t);
                setMobileFilters(false);
              }}
            />
          </div>
        )}

        <div className="grid gap-3 rounded-card border border-line bg-card p-3 shadow-card sm:grid-cols-[1fr_170px_170px] sm:p-4">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetShown();
            }}
            placeholder="Search products..."
            aria-label="Search products"
            className={`${fieldClasses} sm:col-span-1`}
          />
          <SelectMenu
            label="Filter by brand"
            value={brand}
            onChange={(value) => {
              setBrand(value);
              resetShown();
            }}
            options={brandOptions}
          />
          <SelectMenu
            label="Sort products"
            value={sort}
            onChange={(value) => {
              setSort(value as SortOption);
              resetShown();
            }}
            options={SORT_OPTIONS}
          />
        </div>

        <p className="text-sm text-muted" aria-live="polite">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-line py-16 text-center">
            <PackageSearch className="h-12 w-12 text-subtle" />
            <p className="mt-4 font-semibold text-ink">No products match your filters</p>
          </div>
        ) : (
          <>
            <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-3">
              {pageItems.map((p) => (
                <li key={p.id}>
                  <ProductCard product={p} />
                </li>
              ))}
            </ul>

            {filtered.length > shownCount && (
              <div className="flex justify-center pt-4">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setShown({ key: filterKey, count: shownCount + PAGE_SIZE })}
                >
                  Show more products
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
