import Image from "next/image";
import { ArrowRight, BadgeCheck, ShieldCheck, Users, WhatsAppIcon } from "@/components/ui/icons";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import { shop, whatsappLink } from "@/config/shop";
import { ROUTES } from "@/lib/routes";

const highlights = [
  { icon: ShieldCheck, label: "Genuine Products" },
  { icon: BadgeCheck, label: "Trusted Brands" },
  { icon: Users, label: "Expert Guidance" },
];

const swatches = ["bg-accent-600", "bg-paint-500", "bg-gold-500", "bg-success", "bg-brand-700"];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-card to-canvas">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 right-0 h-[28rem] w-[28rem] rounded-full bg-paint-100/60 blur-3xl"
      />
      <div className="container-page relative grid items-center gap-10 py-10 sm:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-16 xl:py-20">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-2 rounded-lg border border-line bg-card px-3 py-1.5 text-[13px] font-semibold text-heading shadow-card">
            <span aria-hidden className="h-2 w-2 rounded-full bg-paint-500" />
            Paints · Plywood · Hardware — {shop.address.city}
          </p>

          <h1 lang="mr" className="mt-5 font-display leading-[1.05]">
            <span className="block text-[2.6rem] font-extrabold text-accent-600 sm:text-6xl lg:text-[4rem]">
              {shop.marathi.prefix} {shop.marathi.name}
            </span>
            <span className="mt-1 block text-[1.6rem] font-extrabold text-heading sm:text-4xl lg:text-[2.6rem]">
              {shop.marathi.tagline}
            </span>
          </h1>

          <p lang="mr" className="mt-5 text-xl leading-snug font-bold text-heading sm:text-2xl">
            घर बांधताना असो किंवा सजवताना — <span className="text-accent-600">सगळं एका ठिकाणी.</span>
          </p>

          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted sm:text-[17px]">
            Premium paints, plywood, hardware and home-improvement essentials from trusted brands — with honest advice
            and local pricing in {shop.address.city}.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <AppLink href={ROUTES.products} className={buttonClasses("cta", "w-full sm:w-auto", "lg")}>
              Explore Products <ArrowRight className="h-5 w-5" />
            </AppLink>
            <a
              href={whatsappLink(`Hello ${shop.shortName}, I'd like to know about your products.`)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClasses("whatsapp", "w-full sm:w-auto", "lg")}
            >
              <WhatsAppIcon className="h-5 w-5" /> WhatsApp Us
            </a>
          </div>
        </div>

        <div className="relative min-w-0">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] shadow-card-hover lg:aspect-[5/4]">
            <Image
              src="/images/banners/exterior-house.jpg"
              alt="Freshly painted two-storey house at dusk"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-brand-950/55 via-transparent to-transparent" />
            <ul className="absolute inset-x-3 bottom-3 flex flex-wrap gap-2 sm:inset-x-5 sm:bottom-5">
              {highlights.map(({ icon: Icon, label }) => (
                <li
                  key={label}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-card/95 px-2.5 py-1.5 text-[13px] font-semibold text-heading shadow-card backdrop-blur"
                >
                  <Icon aria-hidden className="h-4 w-4 text-success" />
                  {label}
                </li>
              ))}
            </ul>
          </div>

          <div
            aria-hidden
            className="absolute -top-4 -right-2 hidden items-center gap-3 rounded-xl border border-line bg-card px-3 py-2.5 shadow-card-hover sm:flex lg:-right-4"
          >
            <span className="flex gap-1">
              {swatches.map((c) => (
                <span key={c} className={`h-7 w-3.5 rounded-sm ${c}`} />
              ))}
            </span>
            <span className="text-[13px] leading-tight font-semibold text-heading">
              Shades for
              <br />
              every room
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
