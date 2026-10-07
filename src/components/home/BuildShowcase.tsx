import Image from "next/image";
import { ArrowRight, DoorClosed, Droplets, Hammer, KeyRound, Layers, Wrench } from "@/components/ui/icons";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import SectionHeader from "@/components/ui/SectionHeader";
import { stockedHref } from "@/lib/catalog";
import { ROUTES } from "@/lib/routes";
import type { Product } from "@/types";

export default function BuildShowcase({ products }: { products: Product[] }) {
  const items = [
    { icon: Layers, label: "Plywood", note: "Marine, commercial, block board", href: ROUTES.category("plywood") },
    { icon: DoorClosed, label: "Door Hardware", note: "Complete door fittings", href: ROUTES.category("hardware") },
    { icon: KeyRound, label: "Locks", note: "Door locks and padlocks", href: stockedHref(products, "hardware", "Locks") },
    { icon: Wrench, label: "Handles", note: "Door and cabinet handles", href: stockedHref(products, "hardware", "Hinges & Handles") },
    { icon: Hammer, label: "Hinges", note: "Door and cabinet hinges", href: stockedHref(products, "hardware", "Hinges & Handles") },
    { icon: Droplets, label: "Adhesives", note: "Wood glue and sealants", href: ROUTES.category("adhesives") },
  ];

  return (
    <div className="relative overflow-hidden rounded-[1.5rem] bg-brand-900 p-5 sm:p-8 lg:p-12">
      <div aria-hidden className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold-500/15 blur-3xl" />
      <div className="relative grid items-center gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div>
          <SectionHeader
            tone="dark"
            eyebrow="Plywood & Hardware"
            title="Build Better. Finish Better."
            description="Strong boards and dependable fittings for doors, kitchens and furniture — all from one counter."
          />
          <ul className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2 sm:gap-3">
            {items.map(({ icon: Icon, label, note, href }) => (
              <li key={label}>
                <AppLink
                  href={href}
                  className="group flex min-h-16 items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-3 transition duration-200 hover:border-gold-500/60 hover:bg-white/10"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-gold-500/15 text-gold-300">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[15px] font-semibold text-white">{label}</span>
                    <span className="block text-[13px] text-brand-200">{note}</span>
                  </span>
                </AppLink>
              </li>
            ))}
          </ul>
          <AppLink href={ROUTES.category("hardware")} className={buttonClasses("light", "mt-7 w-full sm:w-auto")}>
            Explore Plywood & Hardware <ArrowRight className="h-4 w-4" />
          </AppLink>
        </div>

        <div className="relative hidden aspect-[4/5] overflow-hidden rounded-card ring-1 ring-white/10 lg:block">
          <Image
            src="/images/categories/plywood.jpg"
            alt="Stack of plywood sheets"
            fill
            sizes="40vw"
            className="object-cover"
          />
          <span aria-hidden className="absolute inset-x-0 bottom-0 h-1.5 bg-gold-500" />
        </div>
      </div>
    </div>
  );
}
