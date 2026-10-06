"use client";

import { Search, X } from "lucide-react";
import type { Category, CategoryId } from "@/types";

export type CategoryFilter = CategoryId | "all";

interface Props {
  categories: Category[];
  category: CategoryFilter;
  onCategoryChange: (c: CategoryFilter) => void;
  query: string;
  onQueryChange: (q: string) => void;
  brands: string[];
  brand: string;
  onBrandChange: (b: string) => void;
  types: string[];
  type: string;
  onTypeChange: (t: string) => void;
  inStockOnly: boolean;
  onInStockChange: (v: boolean) => void;
  onReset: () => void;
}

const selectClass =
  "w-full min-h-11 rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-100 focus:outline-none";

export default function ProductFilters(props: Props) {
  const tabs: { id: CategoryFilter; name: string }[] = [
    { id: "all", name: "All" },
    ...props.categories.map((c) => ({ id: c.id, name: c.name })),
  ];

  return (
    <div className="space-y-5 rounded-2xl border-2 border-brand-100 bg-gradient-to-br from-white to-brand-50/40 p-4 shadow-[0_8px_30px_-12px_rgba(30,64,175,0.2)] sm:p-5">
      <div className="-mx-1 flex flex-nowrap gap-2 overflow-x-auto pb-1 no-scrollbar scroll-smooth">
        {tabs.map((t) => {
          const active = props.category === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => props.onCategoryChange(t.id)}
              className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-bold transition ${
                active
                  ? "bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-[0_8px_20px_-6px_rgba(30,64,175,0.55)]"
                  : "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-brand-50 hover:text-brand-700"
              }`}
            >
              {t.name}
            </button>
          );
        })}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-[1fr_180px_180px] lg:grid-cols-[1fr_180px_180px_auto]">
        <label className="relative sm:col-span-2 md:col-span-1 lg:col-span-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-brand-500" />
          <input
            type="search"
            value={props.query}
            onChange={(e) => props.onQueryChange(e.target.value)}
            placeholder="Search paints, plywood, locks..."
            className={`${selectClass} pl-9`}
          />
        </label>

        <select value={props.brand} onChange={(e) => props.onBrandChange(e.target.value)} className={selectClass}>
          <option value="">All brands</option>
          {props.brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select value={props.type} onChange={(e) => props.onTypeChange(e.target.value)} className={selectClass}>
          <option value="">All types</option>
          {props.types.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        <div className="flex flex-wrap items-center justify-between gap-4 sm:col-span-2 md:col-span-3 lg:col-span-1">
          <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-medium whitespace-nowrap text-slate-700">
            <input
              type="checkbox"
              checked={props.inStockOnly}
              onChange={(e) => props.onInStockChange(e.target.checked)}
              className="h-4 w-4 accent-brand-600"
            />
            In stock only
          </label>
          <button
            type="button"
            onClick={props.onReset}
            className="inline-flex min-h-11 items-center gap-1 text-sm font-bold text-slate-600 hover:text-accent-600"
          >
            <X className="h-4 w-4" /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
