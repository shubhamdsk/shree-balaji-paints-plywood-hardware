import { BadgeCheck, HandCoins, MessageCircle, Store } from "@/components/ui/icons";

const reasons = [
  {
    icon: BadgeCheck,
    title: "Genuine, sealed products",
    body: "Every tin, sheet and fitting comes from authorised sources — no duplicates, no surprises.",
  },
  {
    icon: MessageCircle,
    title: "Advice before you buy",
    body: "Tell us the surface, the room or the job. We suggest the right product and quantity.",
  },
  {
    icon: HandCoins,
    title: "Fair local pricing",
    body: "Honest rates for homeowners, with better pricing on bulk orders for painters and contractors.",
  },
  {
    icon: Store,
    title: "One stop for the whole job",
    body: "Paints, plywood, hardware, plumbing and tools under one roof, so you finish faster.",
  },
];

export default function WhyChooseUs() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {reasons.map(({ icon: Icon, title, body }) => (
        <li key={title} className="rounded-card border border-line bg-card p-5 shadow-card sm:p-6">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-900 text-gold-300 ring-1 ring-brand-200/70">
            <Icon aria-hidden className="h-6 w-6" />
          </span>
          <h3 className="mt-4 text-lg font-semibold text-heading">{title}</h3>
          <p className="mt-1.5 text-[15px] leading-relaxed text-muted">{body}</p>
        </li>
      ))}
    </ul>
  );
}
