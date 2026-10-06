"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icons";
import CategoryTile from "@/components/home/CategoryTile";
import type { Category } from "@/types";

export default function CategoryScroller({ categories }: { categories: Category[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const syncEdges = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const max = el.scrollWidth - el.clientWidth;
    setAtStart(el.scrollLeft <= 4);
    setAtEnd(max <= 4 || el.scrollLeft >= max - 4);
  }, []);

  useEffect(() => {
    syncEdges();
    window.addEventListener("resize", syncEdges);
    return () => window.removeEventListener("resize", syncEdges);
  }, [syncEdges]);

  const scrollBy = (dir: -1 | 1) => {
    const el = railRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.75), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={railRef}
        onScroll={syncEdges}
        className="-mx-1 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 pr-6 no-scrollbar sm:pr-10"
      >
        {categories.map((c) => (
          <div key={c.id} className="snap-start">
            <CategoryTile category={c} />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-10 bg-gradient-to-l from-panel to-transparent sm:block" />
      <div className="pointer-events-none absolute inset-y-0 left-0 hidden w-6 bg-gradient-to-r from-panel to-transparent sm:block" />
      <button
        type="button"
        aria-label="Scroll categories left"
        onClick={() => scrollBy(-1)}
        disabled={atStart}
        className="absolute top-1/2 left-0 z-10 hidden -translate-y-1/2 rounded-full border border-stone-600/40 bg-panel/95 p-2 text-white shadow-md transition enabled:hover:border-accent-400 enabled:hover:text-accent-300 disabled:opacity-0 md:flex"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        type="button"
        aria-label="Scroll categories right"
        onClick={() => scrollBy(1)}
        disabled={atEnd}
        className="absolute top-1/2 right-0 z-10 hidden -translate-y-1/2 rounded-full border border-stone-600/40 bg-panel/95 p-2 text-white shadow-md transition enabled:hover:border-accent-400 enabled:hover:text-accent-300 disabled:opacity-0 md:flex"
      >
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );
}
