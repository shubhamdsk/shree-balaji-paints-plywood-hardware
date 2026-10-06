"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, PackageSearch, SlidersHorizontal } from "lucide-react";
import ProductCard from "./ProductCard";
import ProductSidebar, { type CategoryFilter } from "./ProductSidebar";
import { categories, getAllBrands, getTotalProductCount, products } from "@/data/products";
import type { CategoryId, SortOption } from "@/types";

const PAGE_SIZE = 12;

function parseCategory(value: string | null): CategoryFilter {
  return categories.some((c) => c.id === value) ? (value as CategoryId) : "all";
}

export default function ProductCatalog() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const category = parseCategory(searchParams.get("category"));
  const urlType = searchParams.get("type") ?? "";

  const [query, setQuery] = useState("");
  const [brand, setBrand] = useState("");
  const subtype = urlType;
  const [sort, setSort] = useState<SortOption>("name");
  const filterKey = `${category}|${urlType}`;
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
    [category],
  );
  const brands = useMemo(() => getAllBrands(), []);

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
    const params = new URLSearchParams();
    if (nextCategory !== "all") params.set("category", nextCategory);
    if (nextSubtype) params.set("type", nextSubtype);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    setPage(1);
  };

  const selectClass =
    "min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-800 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-orange-100";

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      <div className="hidden w-full shrink-0 lg:block lg:w-64 xl:w-72">
        <ProductSidebar category={category} subtype={subtype} onSelect={pushFilters} />
      </div>

      <div className="min-w-0 flex-1 space-y-5">
        <button
          type="button"
          onClick={() => setMobileFilters((v) => !v)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-stone-200 bg-white py-3 text-sm font-bold text-brand-900 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters & Categories
        </button>

        {mobileFilters && (
          <div className="lg:hidden">
            <ProductSidebar
              category={category}
              subtype={subtype}
              onSelect={(c, t) => {
                pushFilters(c, t);
                setMobileFilters(false);
              }}
            />
          </div>
        )}

        <div className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 card-shadow sm:grid-cols-[1fr_160px_160px]">
          <input
            type="search"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search products..."
            className={`${selectClass} sm:col-span-1`}
          />
          <select
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setPage(1);
            }}
            className={selectClass}
          >
            <option value="name">Sort: Name</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>

        <p className="text-sm text-stone-500">
          Showing <span className="font-semibold text-brand-900">{filtered.length}</span> of{" "}
          {category === "all" ? getTotalProductCount() : inCategory.length} products
        </p>

        {filtered.length === 0 ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-stone-300 py-16 text-center">
            <PackageSearch className="h-12 w-12 text-stone-300" />
            <p className="mt-4 font-semibold text-stone-700">No products match your filters</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {pageItems.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 pt-4">
                <button
                  type="button"
                  disabled={pageSafe <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white disabled:opacity-40"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm font-semibold text-stone-600">
                  Page {pageSafe} of {totalPages}
                </span>
                <button
                  type="button"
                  disabled={pageSafe >= totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className="grid h-10 w-10 place-items-center rounded-full border border-stone-200 bg-white disabled:opacity-40"
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
