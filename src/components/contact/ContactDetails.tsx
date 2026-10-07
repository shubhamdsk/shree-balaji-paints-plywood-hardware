import { Clock, MapPin, MessageCircle, Navigation, Phone } from "@/components/ui/icons";
import { buttonClasses } from "@/components/ui/Button";
import { shop, whatsappLink } from "@/config/shop";

interface Props {
  title?: string;
  description?: string;
}

export default function ContactDetails({
  title = "Visit Our Store",
  description = `Drop by the shop in ${shop.address.city} to see shades, boards and fittings in person, or call and WhatsApp us anytime.`,
}: Props) {
  const { address } = shop;
  const addressLine = `${address.line1}, ${address.city}, ${address.state} ${address.pincode}`;
  const mapQuery = encodeURIComponent(addressLine);

  const details = [
    { icon: MapPin, label: "Address", value: addressLine },
    { icon: Phone, label: "Phone / WhatsApp", value: shop.phoneDisplay, href: shop.phoneLink },
    { icon: Clock, label: "Store hours", value: `${shop.hoursShort} · ${shop.openDays}` },
  ];

  return (
    <div className="grid overflow-hidden rounded-card border border-line bg-white shadow-card lg:grid-cols-[1fr_1.15fr]">
      <div className="p-5 sm:p-8 lg:p-10">
        <h2 className="text-[1.65rem] leading-tight font-bold text-brand-900 sm:text-3xl">{title}</h2>
        <span aria-hidden className="mt-3 block h-1 w-12 rounded-full bg-gold-500" />
        <p className="mt-4 text-[15px] leading-relaxed text-muted">{description}</p>

        <ul className="mt-6 space-y-4">
          {details.map(({ icon: Icon, label, value, href }) => (
            <li key={label} className="flex gap-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent-50 text-accent-600">
                <Icon aria-hidden className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-semibold tracking-wide text-subtle uppercase">{label}</span>
                {href ? (
                  <a href={href} className="text-[15px] font-semibold text-ink hover:text-accent-600">
                    {value}
                  </a>
                ) : (
                  <span className="block text-[15px] font-semibold text-ink">{value}</span>
                )}
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-7 grid gap-2.5 sm:grid-cols-3">
          <a href={shop.mapLink} target="_blank" rel="noopener noreferrer" className={buttonClasses("primary", "px-3")}>
            <Navigation className="h-4 w-4" /> Directions
          </a>
          <a href={shop.phoneLink} className={buttonClasses("secondary", "px-3")}>
            <Phone className="h-4 w-4" /> Call
          </a>
          <a
            href={whatsappLink(`Hello ${shop.shortName}, I have an enquiry.`)}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClasses("whatsapp", "px-3")}
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </a>
        </div>
      </div>

      <iframe
        title={`${shop.shortName} location on Google Maps`}
        src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        className="h-72 w-full border-0 border-t border-line sm:h-96 lg:h-full lg:min-h-[28rem] lg:border-t-0 lg:border-l"
        allowFullScreen
      />
    </div>
  );
}
