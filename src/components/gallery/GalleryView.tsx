import Image from "next/image";
import { WhatsAppIcon } from "@/components/ui/icons";
import PageHeader from "@/components/ui/PageHeader";
import { shop, whatsappLink } from "@/config/shop";
import type { GalleryItem } from "@/types";

export default function GalleryView({ items }: { items: GalleryItem[] }) {
  return (
    <div className="bg-surface">
      <PageHeader
        title="Gallery"
        description={`Photos of painting, plywood and hardware work done for customers around ${shop.address.city}.`}
      />
      <section className="container-page py-8 sm:py-12">
        {items.length === 0 ? (
          <p className="rounded-card border border-line bg-card p-12 text-center text-muted">No photos yet. Check back soon.</p>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <li key={item.id} className="overflow-hidden rounded-card border border-line bg-card shadow-card">
                <div className="relative aspect-4/3 bg-surface-muted">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  <span className="absolute top-3 left-3 rounded-full bg-card/90 px-3 py-1 text-[11px] font-bold text-heading">
                    {item.category}
                  </span>
                </div>
                <div className="space-y-2 p-4">
                  <h2 className="font-bold leading-snug text-heading">{item.title}</h2>
                  {item.caption && <p className="text-sm text-muted">{item.caption}</p>}
                  <a
                    href={whatsappLink(`Hello ${shop.shortName}, I saw "${item.title}" in your gallery and would like similar work.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-success hover:underline"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> Ask about similar work
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
