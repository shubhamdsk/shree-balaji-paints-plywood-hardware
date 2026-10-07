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
    <section aria-label="Why customers trust us" className="border-y border-line bg-card">
      <ul className="container-page grid grid-cols-2 gap-x-4 gap-y-5 py-6 sm:grid-cols-3 sm:py-7 lg:grid-cols-5">
        {items.map(({ icon: Icon, label, note }, i) => (
          <li key={label} className={`flex items-center gap-3 ${i === items.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}>
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-heading">
              <Icon aria-hidden className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[15px] leading-tight font-semibold text-heading">{label}</span>
              <span className="block text-[13px] leading-snug text-muted">{note}</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
