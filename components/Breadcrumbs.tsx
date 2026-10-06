import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-stone-400" />}
            {item.href ? (
              <Link href={item.href} className="font-medium hover:text-accent-600">
                {item.label}
              </Link>
            ) : (
              <span className="font-semibold text-brand-900">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
