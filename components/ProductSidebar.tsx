"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import type { CategoryId } from "@/types";
import { categoryGroups } from "@/data/categoryTree";
import { countProducts, getTotalProductCount } from "@/data/products";

export type CategoryFilter = CategoryId | "all";

interface Props {
  category: CategoryFilter;
  subtype: string;
  onSelect: (category: CategoryFilter, subtype: string) => void;
}

export default function ProductSidebar({ category, subtype, onSelect }: Props) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(categoryGroups.map((g) => [g.id, g.id === category || category === "all"])),
  );

  const toggle = (id: string) => setOpenGroups((o) => ({ ...o, [id]: !o[id] }));

  return (
    <aside className="rounded-2xl border border-stone-200 bg-white p-4 card-shadow">
      <h2 className="text-sm font-bold text-brand-900">Categories</h2>
      <button
        type="button"
        onClick={() => onSelect("all", "")}
        className={`mt-3 flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-semibold ${
          category === "all" && !subtype ? "bg-orange-50 text-accent-600" : "text-stone-700 hover:bg-stone-50"
        }`}
      >
        All Products
        <span className="text-xs text-stone-400">{getTotalProductCount()}</span>
      </button>

      <ul className="mt-2 space-y-1">
        {categoryGroups.map((group) => {
          const total = countProducts(group.id);
          const expanded = openGroups[group.id];
          return (
            <li key={group.id}>
              <button
                type="button"
                onClick={() => toggle(group.id)}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-bold text-brand-900 hover:bg-stone-50"
              >
                <span>{group.name}</span>
                <span className="flex items-center gap-1 text-xs font-medium text-stone-400">
                  ({total}) <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
                </span>
              </button>
              {expanded && (
                <ul className="mb-2 ml-2 border-l border-stone-100 pl-2">
                  <li>
                    <button
                      type="button"
                      onClick={() => onSelect(group.id, "")}
                      className={`block w-full rounded-lg px-2 py-1.5 text-left text-xs font-semibold ${
                        category === group.id && !subtype ? "text-accent-600" : "text-stone-600 hover:text-accent-600"
                      }`}
                    >
                      All {group.name} ({total})
                    </button>
                  </li>
                  {group.subtypes.map((st) => {
                    const n = countProducts(group.id, st);
                    if (n === 0) return null;
                    return (
                      <li key={st}>
                        <button
                          type="button"
                          onClick={() => onSelect(group.id, st)}
                          className={`block w-full rounded-lg px-2 py-1.5 text-left text-xs font-medium ${
                            category === group.id && subtype === st
                              ? "text-accent-600"
                              : "text-stone-600 hover:text-accent-600"
                          }`}
                        >
                          {st} <span className="text-stone-400">({n})</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
