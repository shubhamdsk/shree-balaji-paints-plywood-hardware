"use client";

import { useEffect, useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { fieldClasses } from "@/components/ui/FormField";
import { Check, ChevronDown, Search } from "@/components/ui/icons";
import { matchesQuery } from "@/lib/search";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectMenuProps {
  /** Names the field for screen readers; the trigger reads as "label: selected option". */
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  id?: string;
  searchable?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

const SEARCH_MIN_OPTIONS = 8;
const MENU_HEIGHT_PX = 330;
const BOTTOM_BAR_PX = 80;

export default function SelectMenu({
  label,
  value,
  options,
  onChange,
  id,
  searchable = options.length > SEARCH_MIN_OPTIONS,
  invalid = false,
  describedBy,
}: SelectMenuProps) {
  const baseId = useId();
  const listId = `${baseId}-list`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [dropUp, setDropUp] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = useMemo(() => options.filter((o) => matchesQuery(o.label, query)), [options, query]);
  const selected = options.find((o) => o.value === value);
  const activeId = filtered[active] ? optionId(active) : undefined;

  const openMenu = () => {
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      const spaceBelow = window.innerHeight - rect.bottom - BOTTOM_BAR_PX;
      setDropUp(spaceBelow < MENU_HEIGHT_PX && rect.top > spaceBelow);
    }
    setQuery("");
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  const choose = (option: SelectOption) => {
    onChange(option.value);
    close();
  };

  useEffect(() => {
    if (!open) return;
    (searchable ? searchRef.current : listRef.current)?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, searchable]);

  useEffect(() => {
    if (open && activeId) document.getElementById(activeId)?.scrollIntoView?.({ block: "nearest" });
  }, [open, activeId]);

  const onMenuKeyDown = (event: KeyboardEvent) => {
    const last = filtered.length - 1;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => Math.min(i + 1, last));
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => Math.max(i - 1, 0));
        break;
      case "PageDown":
        event.preventDefault();
        setActive(last);
        break;
      case "PageUp":
        event.preventDefault();
        setActive(0);
        break;
      case "Enter":
        event.preventDefault();
        if (filtered[active]) choose(filtered[active]);
        break;
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        id={id}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${label}: ${selected?.label ?? "none"}`}
        aria-describedby={describedBy}
        onClick={() => (open ? close() : openMenu())}
        onKeyDown={(event) => {
          if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
            event.preventDefault();
            openMenu();
          }
        }}
        className={`${fieldClasses} flex items-center justify-between gap-2 text-left ${invalid ? "border-accent-600" : ""}`}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          aria-hidden
          className={`h-4 w-4 shrink-0 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div
          className={`absolute inset-x-0 z-30 overflow-hidden ${dropUp ? "bottom-full mb-2" : "top-full mt-2"} rounded-xl border border-line bg-card shadow-card-hover`}
        >
          {searchable && (
            <div className="border-b border-line p-2">
              <div className="relative">
                <Search aria-hidden className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-subtle" />
                <input
                  ref={searchRef}
                  type="search"
                  role="combobox"
                  aria-label={`Search ${label.toLowerCase()}`}
                  aria-expanded
                  aria-controls={listId}
                  aria-autocomplete="list"
                  aria-activedescendant={activeId}
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setActive(0);
                  }}
                  onKeyDown={onMenuKeyDown}
                  placeholder="Search..."
                  autoComplete="off"
                  className="h-10 w-full rounded-lg bg-surface-muted pr-3 pl-9 text-sm font-medium text-ink placeholder:text-subtle focus:ring-2 focus:ring-brand-100 focus:outline-none"
                />
              </div>
            </div>
          )}
          <ul
            ref={listRef}
            id={listId}
            role="listbox"
            aria-label={label}
            tabIndex={-1}
            aria-activedescendant={searchable ? undefined : activeId}
            onKeyDown={searchable ? undefined : onMenuKeyDown}
            className="no-scrollbar max-h-64 overflow-y-auto overscroll-contain p-1.5 focus:outline-none"
          >
            {filtered.length === 0 ? (
              <li role="presentation" className="px-3 py-6 text-center text-sm text-muted">
                No matches for &ldquo;{query}&rdquo;
              </li>
            ) : (
              filtered.map((option, index) => {
                const isSelected = option.value === value;
                return (
                  <li
                    key={option.value}
                    id={optionId(index)}
                    role="option"
                    aria-selected={isSelected}
                    onPointerMove={() => setActive(index)}
                    onClick={() => choose(option)}
                    className={`flex min-h-10 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-[15px] ${
                      index === active ? "bg-surface-muted text-heading" : "text-ink"
                    } ${isSelected ? "font-semibold" : ""}`}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check aria-hidden className="h-4 w-4 shrink-0 text-accent-600" />}
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
