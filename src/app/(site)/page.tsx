import Reveal from "@/components/ui/Reveal";
import SectionHeader from "@/components/ui/SectionHeader";
import Hero from "@/components/home/Hero";
import TrustBar from "@/components/home/TrustBar";
import CategoryShowcase from "@/components/home/CategoryShowcase";
import ShopByNeed from "@/components/home/ShopByNeed";
import PaintShowcase from "@/components/home/PaintShowcase";
import BuildShowcase from "@/components/home/BuildShowcase";
import WhyChooseUs from "@/components/home/WhyChooseUs";
import StoreStory from "@/components/home/StoreStory";
import BrandGrid from "@/components/brands/BrandGrid";
import ContactDetails from "@/components/contact/ContactDetails";
import OfferCards from "@/components/offers/OfferCards";
import ProductCard from "@/components/products/ProductCard";
import { countProducts, HOME_FEATURED_LIMIT } from "@/lib/catalog";
import { ROUTES } from "@/lib/routes";
import { getCategories, getFeaturedProducts, getPopularBrands, getProductIndex } from "@/services/catalog-service";
import { getLiveOffers } from "@/services/offer-service";

const section = "container-page py-14 sm:py-16 lg:py-20";

// Dated offers start and end at midnight India time with no owner save to refresh the page.
export const revalidate = 3600;

export default async function Home() {
  const [categories, featured, popularBrands, products, datedOffers] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
    getPopularBrands(),
    getProductIndex(),
    getLiveOffers(),
  ]);
  const counts = Object.fromEntries(categories.map((c) => [c.id, countProducts(products, c.id)]));

  return (
    <>
      <Hero />
      <TrustBar />

      <section className={section}>
        <SectionHeader
          eyebrow="Categories"
          title="Explore Our Products"
          description="Paints, boards, fittings and more — everything for building and finishing your home, under one roof."
          href={ROUTES.categories}
          linkLabel="All categories"
        />
        <CategoryShowcase categories={categories} counts={counts} />
      </section>

      <section className="bg-surface-muted">
        <div className={section}>
          <SectionHeader
            eyebrow="Shop by project"
            title="What are you working on?"
            description="Pick your project and we'll point you to the right products."
          />
          <ShopByNeed />
        </div>
      </section>

      <section className={section}>
        <SectionHeader
          eyebrow="Featured"
          title="Featured Products"
          description="Popular picks from our shelves. Message us on WhatsApp for the latest price and availability."
          href={ROUTES.products}
          linkLabel="View all products"
        />
        <ul className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
          {featured.slice(0, HOME_FEATURED_LIMIT).map((p, i) => (
            <li key={p.id}>
              <Reveal delay={(i % 4) * 0.05} className="h-full">
                <ProductCard product={p} />
              </Reveal>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y border-line bg-card">
        <div className={section}>
          <SectionHeader
            eyebrow="Brands"
            title="Products from trusted brands"
            description="Names you already know, available at our store."
            href={ROUTES.brands}
            linkLabel="All brands"
          />
          <BrandGrid brands={popularBrands} />
        </div>
      </section>

      <section className={section}>
        <PaintShowcase products={products} />
      </section>

      <section className="container-page pb-14 sm:pb-16 lg:pb-20">
        <BuildShowcase products={products} />
      </section>

      <section className="bg-surface-muted">
        <div className={section}>
          <SectionHeader
            eyebrow="Offers"
            title="Special help for every customer"
            description="Bulk rates for professionals and free colour advice for homeowners."
            href={ROUTES.offers}
            linkLabel="All offers"
          />
          <OfferCards datedOffers={datedOffers} />
        </div>
      </section>

      <section className={section}>
        <SectionHeader eyebrow="Why us" title="Why Choose श्री बालाजी?" align="center" />
        <WhyChooseUs />
      </section>

      <section className="border-t border-line bg-card">
        <div className={section}>
          <StoreStory />
        </div>
      </section>

      <section className={section}>
        <ContactDetails />
      </section>
    </>
  );
}
