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
      <ul className="container-page grid gap-3 py-5 sm:grid-cols-2 sm:gap-4 sm:py-6 lg:grid-cols-5 lg:gap-4 lg:py-7">
        {items.map(({ icon: Icon, label, note }) => (
          <li key={label}>
            <div className="flex h-full items-center gap-3 rounded-2xl border border-line bg-card/90 p-3 shadow-card transition duration-200 hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card-hover sm:p-4">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-muted text-heading ring-1 ring-line">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[15px] leading-tight font-semibold text-heading">{label}</span>
                <span className="mt-0.5 block text-[13px] leading-snug text-muted">{note}</span>
              </span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
