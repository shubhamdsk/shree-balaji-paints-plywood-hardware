import Image from "next/image";
import { Clock, MapPin } from "@/components/ui/icons";
import { shop } from "@/config/shop";

const photos = [
  { src: "/images/shop/storefront.jpg", alt: "Paint and hardware store storefront", large: true },
  { src: "/images/shop/interior.jpg", alt: "Store interior with paint and building supplies on shelves" },
  { src: "/images/shop/counter.jpg", alt: "Hardware store counter and service area" },
] as const;

export default function OurStore() {
  const addressLine = `${shop.address.line1}, ${shop.address.city}, ${shop.address.state} ${shop.address.pincode}`;

  return (
    <section id="about" className="scroll-mt-24 border-t border-stone-200 bg-surface py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 max-w-2xl">
          <h2 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">Our Store</h2>
          <p className="mt-2 text-stone-600">
            Visit {shop.shortName} in Kotul for Asian Paints, plywood, laminates and complete hardware — genuine
            products with local pricing and guidance.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2 lg:gap-6">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-stone-200 card-shadow-lg lg:row-span-2 lg:aspect-auto lg:min-h-[320px]">
            <Image
              src={photos[0].src}
              alt={photos[0].alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          {photos.slice(1).map((p) => (
            <div
              key={p.src}
              className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-stone-200 card-shadow"
            >
              <Image src={p.src} alt={p.alt} fill sizes="(max-width: 1024px) 100vw, 25vw" className="object-cover" />
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-stone-200 bg-white p-5 card-shadow sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex gap-3">
            <MapPin className="h-6 w-6 shrink-0 text-accent-600" />
            <div>
              <p className="font-bold text-brand-900">Address</p>
              <p className="text-sm text-stone-600">{addressLine}</p>
              <a
                href={shop.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block text-sm font-bold text-accent-600 hover:text-accent-700"
              >
                Open in Google Maps →
              </a>
            </div>
          </div>
          <div className="flex gap-3 sm:text-right">
            <Clock className="h-6 w-6 shrink-0 text-accent-600 sm:order-2" />
            <div>
              <p className="font-bold text-brand-900">Timings</p>
              <p className="text-sm text-stone-600">{shop.hours}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
