"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, PackageSearch, SlidersHorizontal } from "@/components/ui/icons";
import ProductCard from "@/components/products/ProductCard";
import ProductSidebar from "@/components/products/ProductSidebar";
import { fieldClasses } from "@/components/ui/FormField";
import SelectMenu from "@/components/ui/SelectMenu";
import { getBrandNames } from "@/lib/catalog";
import { ROUTES } from "@/lib/routes";
import type { CategoryFilter, CategoryGroup, Product, SortOption } from "@/types";

const PAGE_SIZE = 12;

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "name", label: "Sort: Name" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

interface ProductCatalogProps {
  products: Product[];
  categoryGroups: CategoryGroup[];
  category?: CategoryFilter;
  subtype?: string;
}

export default function ProductCatalog({
  products,
  categoryGroups,
  category = "all",
  subtype = "",
}: ProductCatalogProps) {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const [sort, setSort] = useState<SortOption>("name");
  const filterKey = `${category}|${subtype}`;
  const [pagination, setPagination] = useState({ key: filterKey, page: 1 });
  const page = pagination.key === filterKey ? pagination.page : 1;
  const setPage = (next: number | ((prev: number) => number)) => {
    setPagination((prev) => {
      const currentPage = prev.key === filterKey ? prev.page : 1;
      const newPage = typeof next === "function" ? next(currentPage) : next;
      return { key: filterKey, page: newPage };
    });
  };
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
      if (sort === "price-asc") return a.priceFrom - b.priceFrom;
      if (sort === "price-desc") return b.priceFrom - a.priceFrom;
      return a.name.localeCompare(b.name);
    });
    return list;
  }, [inCategory, query, brand, subtype, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const pageItems = filtered.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE);

  const pushFilters = (nextCategory: CategoryFilter, nextSubtype: string) => {
    const href =
      nextCategory === "all" ? ROUTES.products : ROUTES.category(nextCategory, nextSubtype || undefined);
    router.push(href, { scroll: false });
    setPage(1);
  };

  const sidebarProps = { products, categoryGroups, category, subtype };

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
          Filters & Categories
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
              setPage(1);
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
              setPage(1);
            }}
            options={brandOptions}
          />
          <SelectMenu
            label="Sort products"
            value={sort}
            onChange={(value) => {
              setSort(value as SortOption);
              setPage(1);
            }}
            options={SORT_OPTIONS}
          />
        </div>

        <p className="text-sm text-muted">
          Showing <span className="font-semibold text-heading">{filtered.length}</span> of{" "}
          {inCategory.length} products
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

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  disabled={pageSafe <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-card transition enabled:hover:border-brand-200 disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm font-semibold text-muted">
                  Page {pageSafe} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={pageSafe >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-card transition enabled:hover:border-brand-200 disabled:opacity-40"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
