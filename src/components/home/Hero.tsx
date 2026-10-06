import Image from "next/image";
import { ArrowRight, BadgeCheck, MessageCircle, Shield, Sparkles, Users } from "@/components/ui/icons";
import AppLink from "@/components/ui/AppLink";
import { shop, whatsappLink } from "@/config/shop";

const trust = [
  { icon: Shield, label: "Genuine Products" },
  { icon: Sparkles, label: "Best Pricing" },
  { icon: BadgeCheck, label: "Expert Guidance" },
  { icon: Users, label: "Local Support" },
];

export default function Hero() {
  return (
    <section className="relative overflow-x-clip bg-surface">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:gap-14 lg:py-20">
        <div className="min-w-0 space-y-6">
          <p className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-white px-3 py-1 text-xs font-semibold text-accent-600 shadow-sm">
            <BadgeCheck className="h-3.5 w-3.5" />
            Authorized Asian Paints Dealer · Kotul
          </p>

          <h1 className="text-[1.75rem] leading-[1.12] font-extrabold tracking-tight text-brand-900 sm:text-4xl md:text-[2.65rem]">
            <span className="text-gradient-warm">Colours for a</span>
            <br />
            Better Tomorrow
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Premium paints, plywood, hardware and building essentials from trusted brands — with honest local
            pricing and guidance at {shop.shortName}.
          </p>

          <div className="flex flex-wrap gap-3">
            <AppLink
              href="/products"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-accent-500 px-6 py-3 text-sm font-bold text-white shadow-[0_10px_28px_-8px_rgba(249,115,22,0.55)] transition hover:bg-accent-600"
            >
              Explore Products
              <ArrowRight className="h-4 w-4" />
            </AppLink>
            <a
              href={whatsappLink(`Hello ${shop.shortName}, please share a quote for my project.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border-2 border-stone-300 bg-white px-6 py-3 text-sm font-bold text-brand-900 transition hover:border-accent-400 hover:text-accent-600"
            >
              <MessageCircle className="h-4 w-4 text-[#25D366]" />
              Get a Quote
            </a>
          </div>
        </div>

        <div className="relative min-w-0 pb-8 sm:pb-10">
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl card-shadow-lg">
            <Image
              src="/images/hero/hero-painting.jpg"
              alt="Painter working on a colourful interior wall with ladder and supplies"
              fill
              preload
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="absolute bottom-0 left-4 max-w-[220px] rounded-2xl border border-stone-100 bg-white p-4 card-shadow sm:left-6 sm:p-5">
            <p className="text-xs font-bold tracking-wide text-accent-600 uppercase">Transform</p>
            <p className="text-lg font-extrabold text-brand-900">Your Space</p>
            <p className="mt-1 text-xs text-muted">Shades, tools & expert help in one shop.</p>
          </div>
        </div>
      </div>

      <div className="border-t border-stone-200/80 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-3 px-4 py-6 sm:grid-cols-4 sm:gap-4 sm:px-6 sm:py-8">
          {trust.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-2 rounded-2xl border border-orange-100 bg-surface px-3 py-4 text-center sm:flex-row sm:px-4 sm:text-left"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-accent-500 text-accent-600">
                <Icon className="h-5 w-5" />
              </span>
              <span className="text-xs font-bold text-brand-900 sm:text-sm">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
