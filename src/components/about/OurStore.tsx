import Image from "next/image";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import { MapPin } from "@/components/ui/icons";
import { shop } from "@/config/shop";
import { ROUTES } from "@/lib/routes";

const photos = [
  { src: "/images/shop/storefront.jpg", alt: "Paint and hardware store storefront" },
  { src: "/images/shop/interior.jpg", alt: "Store interior with paint and building supplies on shelves" },
  { src: "/images/shop/counter.jpg", alt: "Hardware store counter and service area" },
] as const;

export default function OurStore() {
  return (
    <section className="container-page py-10 sm:py-14 lg:py-16">
      <div className="max-w-3xl">
        <p className="text-[13px] font-bold tracking-wider text-accent-600 uppercase">Our store</p>
        <h2 lang="mr" className="mt-2 text-[1.65rem] leading-tight font-bold text-heading sm:text-3xl lg:text-[2.25rem]">
          आपल्या घरासाठी, आपल्या माणसांकडून.
        </h2>
        <span aria-hidden className="mt-3 block h-1 w-12 rounded-full bg-gold-500" />
        <p className="mt-4 text-base leading-relaxed text-muted">
          Visit {shop.marathi.fullName} in {shop.address.city} for Asian Paints, plywood, laminates and complete
          hardware — genuine products with local pricing and guidance.
        </p>
      </div>

      <div className="mt-8 grid gap-3 sm:gap-4 lg:grid-cols-2 lg:grid-rows-2">
        {photos.map((p, i) => (
          <div
            key={p.src}
            className={`relative overflow-hidden rounded-card shadow-card ${
              i === 0 ? "aspect-[4/3] lg:row-span-2 lg:aspect-auto lg:min-h-[22rem]" : "aspect-[16/9]"
            }`}
          >
            <Image
              src={p.src}
              alt={p.alt}
              fill
              preload={i === 0}
              sizes={i === 0 ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 100vw, 25vw"}
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <AppLink href={ROUTES.contact} className={`mt-6 ${buttonClasses("primary")}`}>
        <MapPin aria-hidden className="h-4 w-4" /> Contact and directions
      </AppLink>
    </section>
  );
}
