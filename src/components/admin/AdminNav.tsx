"use client";

import { usePathname } from "next/navigation";
import AppLink from "@/components/ui/AppLink";
import { isActivePath } from "@/components/layout/nav-links";
import { ROUTES } from "@/lib/routes";

export const ADMIN_LINKS = [
  { href: ROUTES.admin, label: "Dashboard" },
  { href: ROUTES.adminProducts, label: "Products" },
  { href: ROUTES.adminEnquiries, label: "Enquiries" },
  { href: ROUTES.adminPassword, label: "Password" },
] as const;


export function isAdminLinkActive(href: string, pathname: string) {
  return href === ROUTES.admin ? pathname === ROUTES.admin : isActivePath(href, pathname);
}

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="Owner panel">
      <ul className="flex gap-1">
        {ADMIN_LINKS.map(({ href, label }) => {
          const active = isAdminLinkActive(href, pathname);
          return (
            <li key={href}>
              <AppLink
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center rounded-xl px-3 text-sm font-bold transition ${
                  active ? "bg-heading text-card" : "text-heading hover:bg-surface-muted"
                }`}
              >
                {label}
              </AppLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
