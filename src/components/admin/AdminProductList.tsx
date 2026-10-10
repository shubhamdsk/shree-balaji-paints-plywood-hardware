"use client";

import Image from "next/image";
import { useMemo, useOptimistic, useRef, useState, useTransition } from "react";
import FilterButtons from "@/components/admin/FilterButtons";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import { PackageSearch, Search } from "@/components/ui/icons";
import { useConfirm } from "@/hooks/use-confirm";
import { formatPrice } from "@/lib/price";
import { ROUTES } from "@/lib/routes";
import { matchesQuery } from "@/lib/search";
import { setProductFlagAction } from "@/server/actions/products";
import type { AdminProduct } from "@/types";

type Filter = "all" | "out-of-stock" | "hidden" | "needs-category";
type Flag = "inStock" | "featured" | "isVisible";

const FILTERS: { value: Filter; label: string; test: (p: AdminProduct) => boolean }[] = [
  { value: "all", label: "All", test: () => true },
  { value: "out-of-stock", label: "Out of stock", test: (p) => !p.inStock },
  { value: "hidden", label: "Hidden", test: (p) => !p.isVisible },
  { value: "needs-category", label: "Needs a category", test: (p) => p.needsCategory },
];

export default function AdminProductList({ products }: { products: AdminProduct[] }) {
  const confirm = useConfirm();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [error, setError] = useState("");
  const pendingProductIds = useRef(new Set<string>());
  const [pendingProducts, setPendingProducts] = useState<Set<string>>(new Set());
  const [, startTransition] = useTransition();
  const [list, applyChange] = useOptimistic(
    products,
    (current, change: { id: string; flag: Flag; value: boolean }) =>
      current.map((p) => (p.id === change.id ? { ...p, [change.flag]: change.value } : p)),
  );

  const filters = FILTERS.map(({ value, label, test }) => ({ value, label, count: list.filter(test).length })).filter(
    (f) => f.value !== "needs-category" || f.count > 0 || filter === f.value,
  );
  const visible = useMemo(() => {
    const test = FILTERS.find((f) => f.value === filter)?.test ?? (() => true);
    return list.filter((p) => test(p) && matchesQuery(`${p.name} ${p.brand} ${p.type}`, query));
  }, [list, filter, query]);

  const change = (product: AdminProduct, flag: Flag, value: boolean) => {
    if (pendingProductIds.current.has(product.id)) return;
    pendingProductIds.current.add(product.id);
    setPendingProducts(new Set(pendingProductIds.current));
    setError("");
    startTransition(async () => {
      applyChange({ id: product.id, flag, value });
      try {
        const result = await setProductFlagAction(product.id, flag, value);
        if (!result.ok) setError(`Couldn't update ${product.name}. Please try again.`);
      } catch {
        setError(`Couldn't update ${product.name}. Please try again.`);
      } finally {
        pendingProductIds.current.delete(product.id);
        setPendingProducts(new Set(pendingProductIds.current));
      }
    });
  };

  const toggleVisibility = async (product: AdminProduct) => {
    if (product.isVisible) {
      const confirmed = await confirm({
        title: `Hide ${product.name}?`,
        message: "It disappears from the website, search and brand pages. You can show it again at any time.",
        confirmLabel: "Hide product",
        tone: "danger",
      });
      if (!confirmed) return;
    }
    change(product, "isVisible", !product.isVisible);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <FormField label="Search products" htmlFor="product-search">
          <div className="relative">
            <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
            <input
              id="product-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, brand or type"
              className={`${fieldClasses} pl-9`}
            />
          </div>
        </FormField>
        <FilterButtons filters={filters} value={filter} onChange={setFilter} />
      </div>

      {error && (
        <p role="alert" className="rounded-xl bg-accent-50 px-4 py-3 text-sm font-semibold text-accent-700">
          {error}
        </p>
      )}

      {visible.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-card p-10 text-center text-muted">
          <PackageSearch aria-hidden className="mx-auto mb-3 h-8 w-8" />
          No products match.
        </div>
      ) : (
        <ul className="grid gap-3">
          {visible.map((product) => {
            const pending = pendingProducts.has(product.id);
            return (
              <li
                key={product.id}
                className={`grid gap-3 rounded-card border border-line bg-card p-4 shadow-card sm:grid-cols-[4rem_1fr_auto] sm:items-center ${
                  product.isVisible ? "" : "opacity-75"
                }`}
              >
              <div className="relative hidden h-16 w-16 overflow-hidden rounded-xl bg-surface-muted sm:block">
                {product.image && <Image src={product.image} alt="" fill sizes="64px" className="object-cover" />}
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-heading">{product.name}</h2>
                <p className="text-sm text-muted">
                  {product.brand} · {product.type} · {formatPrice(product.priceFrom, product.unit)}
                </p>
                {!product.isVisible && (
                  <span className="mt-1 inline-block rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-bold text-muted">
                    Hidden from the website
                  </span>
                )}
                {product.needsCategory && (
                  <span className="mt-1 ml-1 inline-block rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-bold text-accent-700">
                    Needs a category — not on the website
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <ToggleSwitch
                  label="In stock"
                  ariaLabel={`${product.name} in stock`}
                  checked={product.inStock}
                  onChange={(value) => change(product, "inStock", value)}
                  disabled={pending}
                />
                <ToggleSwitch
                  label="Home page"
                  ariaLabel={`${product.name} on the home page`}
                  checked={product.featured === true}
                  onChange={(value) => change(product, "featured", value)}
                  disabled={pending}
                />
                <AppLink
                  href={ROUTES.adminProduct(product.id)}
                  className={buttonClasses("secondary")}
                  aria-label={`Edit ${product.name}`}
                >
                  Edit
                </AppLink>
                <button
                  type="button"
                  onClick={() => toggleVisibility(product)}
                  className={buttonClasses("secondary")}
                  aria-label={`${product.isVisible ? "Hide" : "Show"} ${product.name}`}
                  disabled={pending}
                >
                  {product.isVisible ? "Hide" : "Show"}
                </button>
              </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
