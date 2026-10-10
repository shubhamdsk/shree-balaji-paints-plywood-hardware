import { BadgeCheck, HandCoins, MapPin, ShieldCheck, Users } from "@/components/ui/icons";
import { shop } from "@/config/shop";

const items = [
  { icon: ShieldCheck, label: "Genuine Products", note: "Sealed, from authorised sources" },
  { icon: BadgeCheck, label: "Trusted Brands", note: "Names you already know" },
  { icon: Users, label: "Expert Guidance", note: "Help choosing the right product" },
  { icon: MapPin, label: "Local Service", note: `Serving ${shop.address.city} and nearby` },
  { icon: HandCoins, label: "Competitive Pricing", note: "Fair rates, bulk discounts" },
];

export default function TrustBar() {
  return (
    <section aria-label="Why customers trust us" className="border-y border-line bg-linear-to-r from-card via-surface-muted to-card">
      <ul className="container-page grid grid-cols-2 gap-2 py-4 sm:gap-4 sm:py-6 lg:grid-cols-5 lg:py-7">
        {items.map(({ icon: Icon, label, note }) => (
          <li key={label} className="max-lg:last:col-span-2">
            <div className="flex h-full items-center gap-2.5 rounded-2xl border border-line bg-card/90 p-2.5 shadow-card sm:gap-3 sm:p-4">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-surface-muted text-heading ring-1 ring-line sm:h-11 sm:w-11">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm leading-tight font-semibold text-heading sm:text-[15px]">{label}</span>
                <span className="mt-0.5 hidden text-[13px] leading-snug text-muted sm:block">{note}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
