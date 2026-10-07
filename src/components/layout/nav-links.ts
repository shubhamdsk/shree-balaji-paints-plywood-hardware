import { ROUTES } from "@/lib/routes";

export const NAV_LINKS = [
  { href: ROUTES.home, label: "Home" },
  { href: ROUTES.products, label: "Products" },
  { href: ROUTES.categories, label: "Categories" },
  { href: ROUTES.brands, label: "Brands" },
  { href: ROUTES.offers, label: "Offers" },
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.contact, label: "Contact" },
] as const;

export function isActivePath(href: string, pathname: string) {
  if (href === ROUTES.home) return pathname === ROUTES.home;
  return pathname === href || pathname.startsWith(`${href}/`);
}
