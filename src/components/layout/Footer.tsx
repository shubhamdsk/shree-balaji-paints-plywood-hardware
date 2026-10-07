import { Calculator, ClipboardList, Clock, MapPin, Phone, WhatsAppIcon } from "@/components/ui/icons";
import Logo from "@/components/brand/Logo";
import AppLink from "@/components/ui/AppLink";
import { shop, whatsappLink } from "@/config/shop";
import { ROUTES } from "@/lib/routes";
import { getCategories } from "@/services/catalog-service";

const quickLinks = [
  { href: ROUTES.products, label: "Products" },
  { href: ROUTES.categories, label: "Categories" },
  { href: ROUTES.brands, label: "Brands" },
  { href: ROUTES.offers, label: "Offers" },
  { href: ROUTES.about, label: "About" },
  { href: ROUTES.contact, label: "Contact" },
];

const linkClass = "inline-flex min-h-8 items-center transition-colors hover:text-white";

export default async function Footer() {
  const { address } = shop;
  const categories = (await getCategories()).slice(0, 6);

  return (
    <footer className="bg-brand-900 text-brand-100">
      <div className="h-1 bg-[linear-gradient(90deg,var(--color-accent-600),var(--color-paint-500),var(--color-gold-500))]" />
      <div className="container-page grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:gap-12">
        <div className="space-y-4">
          <Logo light />
          <p lang="mr" className="font-semibold text-white">
            {shop.marathi.fullName}
          </p>
          <p className="max-w-xs text-sm leading-relaxed">
            Paints, plywood, hardware and home-improvement essentials for homes, painters and builders in{" "}
            {address.city}.
          </p>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold tracking-wide text-gold-300 uppercase">Quick links</h2>
          <ul className="space-y-1.5 text-[15px]">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <AppLink href={link.href} className={linkClass}>
                  {link.label}
                </AppLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold tracking-wide text-gold-300 uppercase">Categories</h2>
          <ul className="space-y-1.5 text-[15px]">
            {categories.map((c) => (
              <li key={c.id}>
                <AppLink href={ROUTES.category(c.id)} className={linkClass}>
                  {c.name}
                </AppLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-sm font-bold tracking-wide text-gold-300 uppercase">Contact</h2>
          <ul className="space-y-3 text-[15px]">
            <li>
              <a href={shop.phoneLink} className="flex items-center gap-3 hover:text-white">
                <Phone className="h-4 w-4 shrink-0 text-gold-300" />
                {shop.phoneDisplay}
              </a>
            </li>
            <li>
              <a
                href={whatsappLink(`Hello ${shop.shortName}, I have an enquiry.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 hover:text-white"
              >
                <WhatsAppIcon className="h-4 w-4 shrink-0 text-gold-300" />
                WhatsApp
              </a>
            </li>
            <li>
              <a
                href={shop.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 hover:text-white"
              >
                <MapPin className="mt-1 h-4 w-4 shrink-0 text-gold-300" />
                {address.line1}, {address.city}, {address.state} {address.pincode}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-1 h-4 w-4 shrink-0 text-gold-300" />
              <span>
                {shop.hoursShort}
                <span className="block text-sm text-brand-200">{shop.openDays}</span>
              </span>
            </li>
            <li className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
              <AppLink href={ROUTES.enquiry()} className="inline-flex items-center gap-2 hover:text-white">
                <ClipboardList className="h-4 w-4 text-gold-300" /> Enquiry
              </AppLink>
              <AppLink href={ROUTES.paintCalculator()} className="inline-flex items-center gap-2 hover:text-white">
                <Calculator className="h-4 w-4 text-gold-300" /> Paint calculator
              </AppLink>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-page flex flex-col gap-1 py-5 text-[13px] text-brand-200 sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} <span lang="mr">{shop.marathi.fullName}</span>. All rights reserved.
          </p>
          <p>Brand names are trademarks of their respective owners.</p>
        </div>
      </div>
    </footer>
  );
}
