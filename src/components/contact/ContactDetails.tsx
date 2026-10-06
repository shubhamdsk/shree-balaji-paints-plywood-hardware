import { Clock, MapPin, MessageCircle, Phone } from "@/components/ui/icons";
import { buttonClasses } from "@/components/ui/Button";
import { shop, whatsappLink } from "@/config/shop";

export default function ContactDetails() {
  const { address } = shop;
  const mapQuery = encodeURIComponent(`${address.line1}, ${address.city}, ${address.state} ${address.pincode}`);

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
      <div>
        <h2 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">Visit or contact us</h2>
        <p className="mt-2 text-stone-600">We are open seven days a week. Call or WhatsApp anytime.</p>
        <ul className="mt-8 space-y-4">
          <li className="flex gap-4 rounded-2xl border border-stone-200 bg-surface p-4">
            <MapPin className="h-6 w-6 shrink-0 text-accent-600" />
            <div>
              <p className="font-bold text-brand-900">Address</p>
              <a
                href={shop.mapLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-stone-600 hover:text-accent-600"
              >
                {address.line1}, {address.city}, {address.state} {address.pincode}
              </a>
            </div>
          </li>
          <li className="flex gap-4 rounded-2xl border border-stone-200 bg-surface p-4">
            <Phone className="h-6 w-6 shrink-0 text-accent-600" />
            <div>
              <p className="font-bold text-brand-900">Phone / WhatsApp</p>
              <a href={shop.phoneLink} className="text-sm text-stone-600 hover:text-accent-600">
                {shop.phoneDisplay}
              </a>
            </div>
          </li>
          <li className="flex gap-4 rounded-2xl border border-stone-200 bg-surface p-4">
            <Clock className="h-6 w-6 shrink-0 text-accent-600" />
            <div>
              <p className="font-bold text-brand-900">Shop hours</p>
              <p className="text-sm text-stone-600">{shop.hours}</p>
            </div>
          </li>
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={shop.phoneLink} className={buttonClasses("primary")}>
            <Phone className="h-4 w-4" /> Call Now
          </a>
          <a
            href={whatsappLink(`Hello ${shop.shortName}, I have an enquiry.`)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("whatsapp")}
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>
      <div className="space-y-3">
        <div className="overflow-hidden rounded-3xl border border-stone-200 card-shadow">
          <iframe
            title={`${shop.shortName} location on Google Maps`}
            src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-64 w-full min-h-[16rem] border-0 sm:h-80"
            allowFullScreen
          />
        </div>
        <a href={shop.mapLink} target="_blank" rel="noopener noreferrer" className={buttonClasses("secondary")}>
          <MapPin className="h-4 w-4 text-accent-600" />
          Open in Google Maps
        </a>
      </div>
    </div>
  );
}
