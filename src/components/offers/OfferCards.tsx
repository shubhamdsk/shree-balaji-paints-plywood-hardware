import Image from "next/image";
import { HandCoins, Palette, WhatsAppIcon } from "@/components/ui/icons";
import { buttonClasses } from "@/components/ui/Button";
import { shop, whatsappLink } from "@/config/shop";

const offers = [
  {
    icon: HandCoins,
    eyebrow: "For Painters & Contractors",
    title: "Better rates on bulk orders",
    body: "Special pricing on paint drums, plywood sheets and hardware for painters, builders and site contractors.",
    cta: "Enquire for Bulk Purchase",
    message: `Hello ${shop.shortName}, I'm a painter / contractor. I'd like to enquire about bulk purchase rates.`,
    image: "/images/sections/painter-at-work.jpg",
    imageAlt: "Painter rolling paint onto a wall",
  },
  {
    icon: Palette,
    eyebrow: "Free Colour Advice",
    title: "Need help choosing colours?",
    body: "Share room photos or visit with your shade card. We help you pick interior and exterior combinations.",
    cta: "Get Colour Advice",
    message: `Hello ${shop.shortName}, I need help choosing paint colours.`,
    image: "/images/sections/color-swatches.jpg",
    imageAlt: "Fan of paint colour swatches",
  },
];

export default function OfferCards() {
  return (
    <ul className="grid gap-4 sm:gap-6 md:grid-cols-2">
      {offers.map(({ icon: Icon, ...offer }) => (
        <li
          key={offer.title}
          className="group relative flex min-h-[19rem] overflow-hidden rounded-card bg-brand-950 shadow-card-hover"
        >
          <Image src={offer.image} alt={offer.imageAlt} fill sizes="(max-width: 768px) 100vw, 50vw" className="img-zoom object-cover" />
          <span aria-hidden className="absolute inset-0 bg-linear-to-r from-brand-950/95 via-brand-950/80 to-brand-950/30" />
          <div className="relative flex max-w-md flex-col p-6 sm:p-8">
            <span className="inline-flex items-center gap-2 text-[13px] font-bold tracking-wide text-gold-300 uppercase">
              <Icon aria-hidden className="h-4 w-4" /> {offer.eyebrow}
            </span>
            <h3 className="mt-3 text-2xl font-bold text-white sm:text-[1.7rem]">{offer.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-brand-100">{offer.body}</p>
            <a
              href={whatsappLink(offer.message)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("whatsapp", "mt-auto w-full sm:w-fit")}
            >
              <WhatsAppIcon className="h-4 w-4" /> {offer.cta}
            </a>
          </div>
        </li>
      ))}
    </ul>
  );
}
