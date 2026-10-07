import Image from "next/image";
import { ArrowRight, BrickWall, Calculator, DoorClosed, House, Layers, Palette, ShieldCheck } from "@/components/ui/icons";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import { stockedHref } from "@/lib/catalog";
import { ROUTES } from "@/lib/routes";
import type { Product } from "@/types";

const paintTypes = [
  { icon: Palette, label: "Interior Paints", subtype: "Interior" },
  { icon: House, label: "Exterior Paints", subtype: "Exterior" },
  { icon: Layers, label: "Primers", subtype: "Primer" },
  { icon: BrickWall, label: "Putty", subtype: "Putty" },
  { icon: DoorClosed, label: "Wood Coatings", subtype: "Wood Coatings" },
  { icon: ShieldCheck, label: "Metal Paints", subtype: "Metal Paints" },
];

export default function PaintShowcase({ products }: { products: Product[] }) {
  return (
    <div className="grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="relative order-last aspect-[4/3] overflow-hidden rounded-card shadow-card-hover lg:order-first lg:aspect-[5/4]">
        <Image
          src="/images/sections/painter-wall.jpg"
          alt="Painter applying a fresh coat to an interior wall"
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover"
        />
        <span aria-hidden className="absolute inset-x-0 bottom-0 flex h-2">
          <span className="flex-1 bg-accent-600" />
          <span className="flex-1 bg-paint-500" />
          <span className="flex-1 bg-gold-500" />
        </span>
      </div>

      <div>
        <SectionHeader
          eyebrow="Paints"
          title="Everything for a Perfect Finish"
          description="From wall putty and primer to the final coat — the right product for every surface, inside and out."
        />
        <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3">
          {paintTypes.map(({ icon: Icon, label, subtype }) => (
            <li key={label}>
              <AppLink
                href={stockedHref(products, "paints", subtype)}
                className="group flex min-h-14 items-center gap-2.5 rounded-xl border border-line bg-card px-3 py-2.5 text-[15px] font-semibold text-heading transition duration-200 hover:border-paint-500 hover:bg-paint-50"
              >
                <Icon aria-hidden className="h-5 w-5 shrink-0 text-paint-600" />
                {label}
              </AppLink>
            </li>
          ))}
        </ul>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <AppLink href={ROUTES.category("paints")} className={buttonClasses("cta", "w-full sm:w-auto")}>
            Explore Paints <ArrowRight className="h-4 w-4" />
          </AppLink>
          <AppLink href={ROUTES.paintCalculator()} className={buttonClasses("secondary", "w-full sm:w-auto")}>
            <Calculator className="h-4 w-4 text-accent-600" /> How much paint do I need?
          </AppLink>
        </div>
      </div>
    </div>
  );
}
