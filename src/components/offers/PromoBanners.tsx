import Image from "next/image";
import { ArrowRight } from "@/components/ui/icons";
import AppLink from "@/components/ui/AppLink";
import { ROUTES } from "@/lib/routes";

const banners = [
  {
    href: ROUTES.category("paints", "Interior"),
    image: "/images/banners/interior-living.jpg",
    alt: "Cosy interior living room",
    eyebrow: "Collection",
    title: "Interior Paints",
    body: "Washable emulsions and shade matching in store.",
  },
  {
    href: ROUTES.category("paints", "Exterior"),
    image: "/images/banners/exterior-house.jpg",
    alt: "Modern house exterior",
    eyebrow: "Weather shield",
    title: "Exterior Paints",
    body: "Long-lasting colours for Indian sun and rain.",
  },
];

export default function PromoBanners() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
      {banners.map((b) => (
        <AppLink
          key={b.href}
          href={b.href}
          className="group relative flex min-h-[13rem] overflow-hidden rounded-card bg-brand-950 shadow-card sm:min-h-[15rem]"
        >
          <Image src={b.image} alt={b.alt} fill sizes="(max-width: 640px) 100vw, 50vw" className="img-zoom object-cover" />
          <span aria-hidden className="absolute inset-0 bg-linear-to-r from-brand-950/95 via-brand-900/70 to-brand-900/10" />
          <span className="relative flex flex-col justify-center p-6 sm:p-8">
            <span className="text-xs font-bold tracking-wider text-gold-300 uppercase">{b.eyebrow}</span>
            <span className="mt-1 text-2xl font-bold text-white sm:text-3xl">{b.title}</span>
            <span className="mt-2 max-w-xs text-sm text-brand-100">{b.body}</span>
            <span className="mt-5 inline-flex min-h-11 w-fit items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-brand-900 transition group-hover:bg-white/90">
              Shop Now <ArrowRight className="h-4 w-4" />
            </span>
          </span>
        </AppLink>
      ))}
    </div>
  );
}
