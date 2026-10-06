import type { Metadata } from "next";
import OfferCards from "@/components/offers/OfferCards";
import PromoBanners from "@/components/offers/PromoBanners";
import PageHeader from "@/components/ui/PageHeader";
import { shop } from "@/config/shop";

export const metadata: Metadata = {
  title: "Offers",
  description: `Contractor and bulk rates, and free colour consultation at ${shop.shortName}, Kotul.`,
};

export default function OffersPage() {
  return (
    <div className="bg-surface">
      <PageHeader
        title="Offers"
        description="Bulk rates for painters and builders, free colour help, and seasonal paint deals."
      />
      <section className="mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
        <OfferCards />
        <PromoBanners />
      </section>
    </div>
  );
}
