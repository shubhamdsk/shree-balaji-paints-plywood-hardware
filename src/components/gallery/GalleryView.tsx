"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { MessageCircle, Sparkles, X } from "@/components/ui/icons";
import AppLink from "@/components/ui/AppLink";
import Breadcrumbs from "@/components/ui/Breadcrumbs";
import { buttonClasses } from "@/components/ui/Button";
import { shop, whatsappLink } from "@/config/shop";
import { ROUTES } from "@/lib/routes";
import type { GalleryItem } from "@/types";

interface GalleryViewProps {
  items: GalleryItem[];
}

export default function GalleryView({ items }: GalleryViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const categories = useMemo(() => {
    const cats = [...new Set(items.map((i) => i.category))].sort();
    return ["All", ...cats];
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") return items;
    return items.filter((i) => i.category === selectedCategory);
  }, [items, selectedCategory]);

  return (
    <div className="container-page py-8 sm:py-12 space-y-8">
      <Breadcrumbs
        items={[
          { label: "Home", href: ROUTES.home },
          { label: "Our Work Gallery" },
        ]}
      />

      {/* Header Banner */}
      <div className="rounded-card border border-line bg-card p-6 card-shadow sm:p-8">
        <div className="flex items-center gap-2 text-xs font-bold text-accent-600 uppercase tracking-wider">
          <Sparkles className="h-4 w-4" /> Real Work Completed locally
        </div>
        <h1 className="mt-2 text-2xl font-extrabold text-heading sm:text-4xl">
          Our Work &amp; Project Showcase
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted">
          Browse real photos of painting, plywood, laminate, and hardware projects executed for customers across Kotul and nearby regions.
        </p>

        {/* Category Filter Tabs */}
        {categories.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-line">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                aria-pressed={selectedCategory === cat}
                className={`min-h-10 rounded-xl px-4 text-xs font-bold transition ${
                  selectedCategory === cat
                    ? "bg-accent-600 text-white shadow-sm"
                    : "border border-line bg-surface-muted text-heading hover:border-accent-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-card border border-line bg-card p-12 text-center text-muted">
          No work photos uploaded under &quot;{selectedCategory}&quot; yet. Check back soon!
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveItem(item)}
              className="group cursor-pointer overflow-hidden rounded-card border border-line bg-card card-shadow transition hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="relative aspect-4/3 overflow-hidden bg-surface-muted">
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="img-zoom object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-90" />
                <span className="absolute left-3 top-3 rounded-full bg-card/90 px-3 py-1 text-[11px] font-bold text-heading backdrop-blur-xs shadow-xs">
                  {item.category}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <h3 className="text-base font-bold leading-snug">{item.title}</h3>
                  {item.caption && <p className="mt-1 line-clamp-2 text-xs text-brand-100">{item.caption}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {activeItem && (
        <div
          onClick={() => setActiveItem(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-card border border-line bg-card card-shadow"
          >
            <button
              type="button"
              onClick={() => setActiveItem(null)}
              className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-card/80 text-heading shadow-md transition hover:bg-surface-muted"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="relative aspect-16/10 w-full bg-black">
              <Image
                src={activeItem.image}
                alt={activeItem.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 800px"
                className="object-contain"
              />
            </div>

            <div className="p-5 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {activeItem.category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-heading">{activeItem.title}</h2>
              {activeItem.caption && <p className="text-sm text-muted">{activeItem.caption}</p>}

              <div className="flex flex-wrap gap-3 pt-3 border-t border-line">
                <a
                  href={whatsappLink(`Hello ${shop.shortName}, I saw your gallery work "${activeItem.title}" and would like an enquiry.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClasses("whatsapp", "sm")}
                >
                  <MessageCircle className="h-4 w-4" /> Ask about similar work on WhatsApp
                </a>
                <AppLink href={ROUTES.enquiry()} className={buttonClasses("secondary", "sm")}>
                  Submit Written Enquiry
                </AppLink>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
