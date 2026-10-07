import AppLink from "@/components/ui/AppLink";
import { ChevronRight } from "@/components/ui/icons";

export default function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-subtle" />}
            {item.href ? (
              <AppLink href={item.href} className="font-medium hover:text-accent-600">
                {item.label}
              </AppLink>
            ) : (
              <span aria-current="page" className="font-semibold text-brand-900">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
