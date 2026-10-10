"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import AppLink from "@/components/ui/AppLink";
import { isActivePath } from "@/components/layout/nav-links";
import { ROUTES } from "@/lib/routes";

export const ADMIN_LINKS = [
  { href: ROUTES.admin, label: "Dashboard" },
  { href: ROUTES.adminEnquiries, label: "Enquiries" },
  { href: ROUTES.adminProducts, label: "Products" },
  { href: ROUTES.adminOffers, label: "Offers" },
  { href: ROUTES.adminGallery, label: "Gallery" },
  { href: ROUTES.adminCategories, label: "Categories" },
  { href: ROUTES.adminPassword, label: "Password" },
] as const;


export function isAdminLinkActive(href: string, pathname: string) {
  return href === ROUTES.admin ? pathname === ROUTES.admin : isActivePath(href, pathname);
}

export default function AdminNav() {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    listRef.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [pathname]);

  return (
    <nav aria-label="Owner panel" className="w-full min-w-0 lg:w-auto lg:flex-1">
      <ul
        ref={listRef}
        className="no-scrollbar -mx-4 flex gap-1 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
      >
        {ADMIN_LINKS.map(({ href, label }) => {
          const active = isAdminLinkActive(href, pathname);
          return (
            <li key={href} className="shrink-0">
              <AppLink
                href={href}
                aria-current={active ? "page" : undefined}
                className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-xl px-3 text-sm font-bold transition ${
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
