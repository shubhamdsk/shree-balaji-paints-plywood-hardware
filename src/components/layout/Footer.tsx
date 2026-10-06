import { Clock, MapPin, MessageCircle, Phone } from "@/components/ui/icons";
import Logo from "@/components/brand/Logo";
import AppLink from "@/components/ui/AppLink";
import { shop, whatsappLink } from "@/config/shop";
import { ROUTES } from "@/lib/routes";
import { getCategories } from "@/services/catalog-service";

export default async function Footer() {
  const { address } = shop;
  const categories = await getCategories();

  return (
    <footer className="border-t border-stone-200 bg-brand-900 text-stone-300">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-4">
          <Logo light />
          <p className="text-sm leading-relaxed">
            Authorized Asian Paints dealer in Kotul — paints, plywood and hardware with honest local service.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">Categories</h3>
          <ul className="space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.id}>
                <AppLink href={ROUTES.category(c.id)} className="transition hover:text-accent-400">
                  {c.name}
                </AppLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">Visit</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
              <a href={shop.mapLink} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                {address.line1}, {address.city}, {address.state} {address.pincode}
              </a>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" />
              {shop.hours}
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-semibold text-white">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <a href={shop.phoneLink} className="flex items-center gap-3 hover:text-white">
                <Phone className="h-4 w-4 text-accent-400" />
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
                <MessageCircle className="h-4 w-4 text-accent-400" />
                WhatsApp
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-stone-500 sm:px-6">
          &copy; {new Date().getFullYear()} {shop.name}. Brand names are trademarks of their respective owners.
        </p>
      </div>
    </footer>
  );
}
