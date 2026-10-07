"use client";

import { usePathname } from "next/navigation";
import { House, LayoutGrid, MapPin, PackageSearch } from "@/components/ui/icons";
import { isActivePath } from "@/components/layout/nav-links";
import AppLink from "@/components/ui/AppLink";
import { ROUTES } from "@/lib/routes";

const items = [
  { href: ROUTES.home, label: "Home", icon: House },
  { href: ROUTES.products, label: "Products", icon: PackageSearch },
  { href: ROUTES.categories, label: "Categories", icon: LayoutGrid },
  { href: ROUTES.contact, label: "Contact", icon: MapPin },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Quick links"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActivePath(href, pathname);
          return (
            <li key={label}>
              <AppLink
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors ${
                  active ? "text-accent-600" : "text-muted hover:text-brand-900"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden />
                {label}
              </AppLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
