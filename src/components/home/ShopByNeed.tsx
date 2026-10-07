import { ArrowRight, Hammer, House, Paintbrush, Wrench } from "@/components/ui/icons";
import AppLink from "@/components/ui/AppLink";
import { ROUTES } from "@/lib/routes";

const needs = [
  {
    icon: House,
    title: "New Home",
    body: "Plywood, door hardware, plumbing and electrical for a new build.",
    href: ROUTES.category("plywood"),
    tone: "bg-brand-50 text-brand-900",
  },
  {
    icon: Paintbrush,
    title: "Painting",
    body: "Interior and exterior paints, primers, putty and painting tools.",
    href: ROUTES.category("paints"),
    tone: "bg-paint-50 text-paint-600",
  },
  {
    icon: Hammer,
    title: "Renovation",
    body: "Locks, hinges, handles and fittings to refresh doors and furniture.",
    href: ROUTES.category("hardware"),
    tone: "bg-accent-50 text-accent-600",
  },
  {
    icon: Wrench,
    title: "Repairs",
    body: "Tools, adhesives and sealants for quick fixes around the house.",
    href: ROUTES.category("tools"),
    tone: "bg-gold-100 text-gold-600",
  },
];

export default function ShopByNeed() {
  return (
    <ul className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {needs.map(({ icon: Icon, ...need }) => (
        <li key={need.title}>
          <AppLink
            href={need.href}
            className="group card-lift flex h-full flex-col rounded-card border border-line bg-white p-5 hover:border-brand-200 sm:p-6"
          >
            <span className={`grid h-12 w-12 place-items-center rounded-xl ${need.tone}`}>
              <Icon aria-hidden className="h-6 w-6" />
            </span>
            <span className="mt-4 text-lg font-semibold text-brand-900">{need.title}</span>
            <span className="mt-1 text-[15px] leading-relaxed text-muted">{need.body}</span>
            <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-sm font-semibold text-accent-600">
              Shop now
              <ArrowRight aria-hidden className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </span>
          </AppLink>
        </li>
      ))}
    </ul>
  );
}
