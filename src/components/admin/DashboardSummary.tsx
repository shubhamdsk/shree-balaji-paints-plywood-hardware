import AppLink from "@/components/ui/AppLink";
import { AlertTriangle, MessageCircle, Tag, type Icon } from "@/components/ui/icons";
import { ROUTES } from "@/lib/routes";

interface DashboardSummaryProps {
  newEnquiries: number;
  outOfStock: number;
  liveOffers: number;
}

export default function DashboardSummary({ newEnquiries, outOfStock, liveOffers }: DashboardSummaryProps) {
  const tiles: { label: string; value: number; hint: string; href: string; icon: Icon }[] = [
    {
      label: "New enquiries",
      value: newEnquiries,
      hint: newEnquiries ? "Call or WhatsApp them back" : "All caught up",
      href: ROUTES.adminEnquiries,
      icon: MessageCircle,
    },
    {
      label: "Out of stock",
      value: outOfStock,
      hint: outOfStock ? "Mark them in stock when they arrive" : "Everything is in stock",
      href: ROUTES.adminProducts,
      icon: AlertTriangle,
    },
    {
      label: "Offers running today",
      value: liveOffers,
      hint: liveOffers ? "Shown on the Offers page" : "Add one for festivals or sales",
      href: ROUTES.adminOffers,
      icon: Tag,
    },
  ];

  return (
    <ul className="grid gap-3 sm:grid-cols-3">
      {tiles.map(({ label, value, hint, href, icon: TileIcon }) => (
        <li key={label}>
          <AppLink
            href={href}
            className="flex h-full items-center gap-4 rounded-card border border-line bg-card p-4 shadow-card transition hover:border-accent-500"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-surface-muted text-accent-600">
              <TileIcon className="h-5 w-5" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-muted">{label}</span>
              <span className="block text-2xl font-extrabold text-heading">{value}</span>
              <span className="block text-xs font-semibold text-muted">{hint}</span>
            </span>
          </AppLink>
        </li>
      ))}
    </ul>
  );
}
