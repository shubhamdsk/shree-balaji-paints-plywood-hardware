import { ArrowRight, MapPin, Phone } from "@/components/ui/icons";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import Hero from "@/components/home/Hero";
import CategoryScroller from "@/components/home/CategoryScroller";
import BrandGrid from "@/components/brands/BrandGrid";
import OfferCards from "@/components/offers/OfferCards";
import PromoBanners from "@/components/offers/PromoBanners";
import ProductCard from "@/components/products/ProductCard";
import { shop } from "@/config/shop";
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

      <section className="border-y border-stone-200/80 bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            title="Popular Brands"
            description="Authorized and genuine products from names you trust."
            href="/brands"
            linkLabel="All brands"
          />
          <BrandGrid brands={popularBrands} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <SectionHeader
          title="Featured Products"
          description="Best sellers and staff picks for your next project."
          href="/products"
          linkLabel="View all products"
        />
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

      <section className="bg-white py-12 sm:py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <SectionHeader
            title="Offers"
            description="Bulk rates for painters and builders, and free colour help."
            href="/offers"
            linkLabel="All offers"
          />
          <OfferCards />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-6 rounded-3xl bg-panel p-6 sm:p-10 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-white sm:text-3xl">Visit our store in {shop.address.city}</h2>
            <p className="mt-2 text-stone-400">{shop.hours}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <AppLink href="/about" className={buttonClasses("secondary")}>
              <MapPin className="h-4 w-4 text-accent-600" /> About the store
            </AppLink>
            <AppLink href="/contact" className={buttonClasses("whatsapp")}>
              <Phone className="h-4 w-4" /> Contact & directions
            </AppLink>
          </div>
        </div>
      </section>
    </>
  );
}
