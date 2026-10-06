import { ArrowRight, Clock, MapPin, MessageCircle, Phone, Tag } from "@/components/ui/icons";
import AppLink from "@/components/ui/AppLink";
import Hero from "@/components/home/Hero";
import CategoryScroller from "@/components/home/CategoryScroller";
import ProductCard from "@/components/products/ProductCard";
import BrandWordmark from "@/components/brand/BrandWordmark";
import PromoBanners from "@/components/home/PromoBanners";
import OurStore from "@/components/home/OurStore";
import Reveal from "@/components/ui/Reveal";
import { shop, whatsappLink } from "@/config/shop";
import { getCategories, getFeaturedProducts, getPopularBrands } from "@/services/catalog-service";

export default async function Home() {
  const [categories, featured, popularBrands] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getPopularBrands(),
  ]);

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="overflow-hidden rounded-3xl bg-panel p-6 sm:p-8 md:p-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Shop by Category</h2>
              <p className="mt-1 text-sm text-stone-400">Paints, boards, fittings and more under one roof.</p>
            </div>
            <AppLink
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-bold text-accent-400 hover:text-accent-300"
            >
              View All <ArrowRight className="h-4 w-4" />
            </AppLink>
          </div>
          <CategoryScroller categories={categories} />
        </div>
      </section>

      <section id="brands" className="scroll-mt-24 border-y border-stone-200/80 bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">Popular Brands</h2>
              <p className="mt-2 text-stone-600">Authorized and genuine products from names you trust.</p>
            </div>
            <AppLink
              href="/products"
              className="inline-flex items-center gap-1 text-sm font-bold text-accent-600 hover:text-accent-700"
            >
              View All <ArrowRight className="h-4 w-4" />
            </AppLink>
          </Reveal>
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 lg:grid-cols-5 lg:gap-3">
            {popularBrands.map((name) => (
              <div
                key={name}
                className="flex h-[68px] items-center justify-center rounded-xl border border-stone-200/90 bg-white px-2 py-2 shadow-[0_2px_12px_-4px_rgba(28,25,23,0.1)] sm:h-[72px] sm:rounded-2xl sm:px-3"
              >
                <BrandWordmark name={name} variant="card" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-900 sm:text-3xl">Featured Products</h2>
            <p className="mt-1 text-stone-600">Best sellers and staff picks for your next project.</p>
          </div>
          <AppLink href="/products" className="text-sm font-bold text-accent-600 hover:text-accent-700">
            View all products →
          </AppLink>
        </Reveal>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {featured.map((p, i) => (
            <Reveal key={p.id} delay={i * 0.05}>
              <ProductCard product={p} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-14 sm:px-6 sm:pb-16">
        <PromoBanners />
      </section>

      <section id="offers" className="scroll-mt-24 bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-orange-100 bg-orange-50 p-6 card-shadow sm:p-8">
              <Tag className="h-8 w-8 text-accent-600" />
              <h3 className="mt-4 text-xl font-extrabold text-brand-900">Contractor & bulk offers</h3>
              <p className="mt-2 text-sm text-stone-600">
                Special rates on paint drums, plywood sheets and hardware for painters and builders. Ask
                in store or on WhatsApp.
              </p>
            </div>
            <div className="rounded-3xl border border-stone-200 bg-surface p-6 card-shadow sm:p-8">
              <h3 className="text-xl font-extrabold text-brand-900">Free colour consultation</h3>
              <p className="mt-2 text-sm text-stone-600">
                Bring room photos or visit with your shade card — we help you pick interior and exterior
                combinations.
              </p>
              <a
                href={whatsappLink(`Hello ${shop.shortName}, I need colour consultation.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex text-sm font-bold text-accent-600"
              >
                Book via WhatsApp →
              </a>
            </div>
          </div>
        </div>
      </section>

      <OurStore />

      <section id="contact" className="scroll-mt-24 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <Reveal>
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
                        {shop.address.line1}, {shop.address.city}, {shop.address.state} {shop.address.pincode}
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
                  <a
                    href={shop.phoneLink}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-brand-900 px-6 py-3 text-sm font-bold text-white"
                  >
                    <Phone className="h-4 w-4" /> Call Now
                  </a>
                  <a
                    href={whatsappLink(`Hello ${shop.shortName}, I have an enquiry.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-bold text-white"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp
                  </a>
                </div>
              </div>
              <div className="space-y-3">
                <div className="overflow-hidden rounded-3xl border border-stone-200 card-shadow">
                  <iframe
                    title="Shree Balaji Paints location on Google Maps"
                    src="https://www.google.com/maps?q=CXM9%2B4JF%2C+Kotul%2C+Maharashtra+422610&output=embed"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="h-64 w-full min-h-[16rem] border-0 sm:h-80"
                    allowFullScreen
                  />
                </div>
                <a
                  href={shop.mapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border-2 border-stone-300 bg-white px-6 py-3 text-sm font-bold text-brand-900 hover:border-accent-400 sm:w-auto"
                >
                  <MapPin className="h-4 w-4 text-accent-600" />
                  Open in Google Maps
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
