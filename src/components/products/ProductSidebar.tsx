"use client";

import { ChevronDown } from "@/components/ui/icons";
import { useState } from "react";
import { countProducts } from "@/lib/catalog";
import type { CategoryFilter, CategoryGroup, ProductSummary } from "@/types";

interface ProductSidebarProps {
  index: ProductSummary[];
  categoryGroups: CategoryGroup[];
  category: CategoryFilter;
  subtype: string;
  onSelect: (category: CategoryFilter, subtype: string) => void;
}

export default function ProductSidebar({ index, categoryGroups, category, subtype, onSelect }: ProductSidebarProps) {
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(categoryGroups.map((g) => [g.id, g.id === category || category === "all"])),
  );

  const toggle = (id: string) => setOpenGroups((o) => ({ ...o, [id]: !o[id] }));

  return (
    <aside className="rounded-card border border-line bg-card p-4 shadow-card">
      <h2 className="text-[13px] font-bold tracking-wider text-subtle uppercase">Categories</h2>
      <button
        type="button"
        onClick={() => onSelect("all", "")}
        className={`mt-3 flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-left text-[15px] font-semibold ${
          category === "all" && !subtype ? "bg-accent-50 text-accent-600" : "text-ink hover:bg-surface-muted"
        }`}
      >
        All Products
        <span className="text-xs text-subtle">{index.length}</span>
      </button>

      <ul className="mt-2 space-y-1">
        {categoryGroups.map((group) => {
          const total = countProducts(index, group.id);
          const expanded = openGroups[group.id];
          return (
            <li key={group.id}>
              <button
                type="button"
                onClick={() => toggle(group.id)}
                aria-expanded={expanded}
                className="flex min-h-11 w-full items-center justify-between rounded-lg px-3 text-[15px] font-semibold text-heading hover:bg-surface-muted"
              >
                <span>{group.name}</span>
                <span className="flex items-center gap-1 text-xs font-medium text-subtle">
                  ({total}) <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
                </span>
              </button>
              {expanded && (
                <ul className="mb-2 ml-2 border-l border-line pl-2">
                  <li>
                    <button
                      type="button"
                      onClick={() => onSelect(group.id, "")}
                      className={`flex min-h-10 w-full items-center rounded-lg px-2.5 text-left text-sm font-semibold ${
                        category === group.id && !subtype
                          ? "bg-accent-50 text-accent-600"
                          : "text-muted hover:text-accent-600"
                      }`}
                    >
                      All {group.name} ({total})
                    </button>
                  </li>
                  {group.subtypes.map((st) => {
                    const n = countProducts(index, group.id, st);
                    if (n === 0) return null;
                    return (
                      <li key={st}>
                        <button
                          type="button"
                          onClick={() => onSelect(group.id, st)}
                          className={`flex min-h-10 w-full items-center gap-1 rounded-lg px-2.5 text-left text-sm font-medium ${
                            category === group.id && subtype === st
                              ? "bg-accent-50 font-semibold text-accent-600"
                              : "text-muted hover:text-accent-600"
                          }`}
                        >
                          {st} <span className="text-subtle">({n})</span>
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
