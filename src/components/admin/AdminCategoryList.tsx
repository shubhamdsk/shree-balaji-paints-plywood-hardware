"use client";

import { useMemo, useOptimistic, useState, useTransition } from "react";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import CoverImage from "@/components/ui/CoverImage";
import FormField, { fieldClasses } from "@/components/ui/FormField";
import { PackageSearch, Search } from "@/components/ui/icons";
import { useConfirm } from "@/hooks/use-confirm";
import { matchesQuery } from "@/lib/search";
import { setCategoryActiveAction, setSubcategoryActiveAction } from "@/server/actions/categories";

export interface CategoryListItem {
  id: string;
  name: string;
  image?: string;
  isActive: boolean;
  productCount: number;
  detail: string;
  searchText: string;
  editHref: string;
}

interface AdminCategoryListProps {
  kind: "category" | "type";
  items: CategoryListItem[];
}

const COPY = {
  category: {
    search: "Search categories",
    placeholder: "Category or type name",
    noun: "categories",
    hideMessage: "Its types and products disappear from the website. They stay saved here and come back when you show it again.",
  },
  type: {
    search: "Search types",
    placeholder: "Type name",
    noun: "types",
    hideMessage: "Its products disappear from the website. They stay saved here and come back when you show it again.",
  },
};

export default function AdminCategoryList({ kind, items }: AdminCategoryListProps) {
  const copy = COPY[kind];
  const confirm = useConfirm();
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const [list, applyChange] = useOptimistic(items, (current, change: { id: string; isActive: boolean }) =>
    current.map((item) => (item.id === change.id ? { ...item, isActive: change.isActive } : item)),
  );
  const shown = useMemo(() => list.filter((item) => matchesQuery(item.searchText, query)), [list, query]);

  const toggle = async (item: CategoryListItem, isActive: boolean) => {
    if (!isActive && item.productCount > 0) {
      const confirmed = await confirm({
        title: `Hide ${item.name} and its ${item.productCount} product${item.productCount === 1 ? "" : "s"}?`,
        message: copy.hideMessage,
        confirmLabel: "Hide from website",
        tone: "danger",
      });
      if (!confirmed) return;
    }
    setError("");
    startTransition(async () => {
      applyChange({ id: item.id, isActive });
      const action = kind === "category" ? setCategoryActiveAction : setSubcategoryActiveAction;
      try {
        const result = await action(item.id, isActive);
        if (!result.ok) setError(`Couldn't update ${item.name}. Please try again.`);
      } catch {
        setError(`Couldn't update ${item.name}. Please try again.`);
      }
    });
  };

  return (
    <div className="space-y-4">
      <FormField label={copy.search} htmlFor={`${kind}-search`}>
        <div className="relative">
          <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
          <input
            id={`${kind}-search`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={copy.placeholder}
            className={`${fieldClasses} pl-9`}
          />
        </div>
      </FormField>

      <p className="text-sm text-muted" aria-live="polite">
        {query && `${shown.length} of ${list.length} ${copy.noun}`}
      </p>
      {error && (
        <p role="alert" className="rounded-xl bg-accent-50 px-4 py-3 text-sm font-semibold text-accent-700">
          {error}
        </p>
      )}

      {shown.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-card p-10 text-center text-muted">
          <PackageSearch aria-hidden className="mx-auto mb-3 h-8 w-8" />
          No {copy.noun} match.
        </div>
      ) : (
        <ul className="grid gap-3">
          {shown.map((item) => (
            <li
              key={item.id}
              className={`grid grid-cols-[3.5rem_1fr] gap-3 rounded-card border border-line bg-card p-4 shadow-card sm:grid-cols-[3.5rem_1fr_auto] sm:items-center ${
                item.isActive ? "" : "opacity-75"
              }`}
            >
              <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-surface-muted">
                <CoverImage src={item.image} alt="" sizes="56px" />
              </div>
              <div className="min-w-0">
                <h2 className="font-bold text-heading">{item.name}</h2>
                <p className="text-sm text-muted">{item.detail}</p>
                {!item.isActive && (
                  <span className="mt-1 inline-block rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-bold text-muted">
                    Hidden from the website
                  </span>
                )}
              </div>
              <div className="col-span-2 flex flex-wrap items-center gap-x-4 gap-y-1 sm:col-span-1">
                <ToggleSwitch
                  label="On the website"
                  ariaLabel={`${item.name} on the website`}
                  checked={item.isActive}
                  onChange={(value) => toggle(item, value)}
                  disabled={pending}
                />
                <AppLink href={item.editHref} className={buttonClasses("secondary")} aria-label={`Edit ${item.name}`}>
                  Edit
                </AppLink>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
