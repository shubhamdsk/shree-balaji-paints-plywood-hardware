import type { Metadata } from "next";
import OfferCards from "@/components/offers/OfferCards";
import PageHeader from "@/components/ui/PageHeader";
import { shop } from "@/config/shop";
import { getLiveOffers } from "@/services/offer-service";

export const metadata: Metadata = {
  title: "Offers",
  description: `Contractor and bulk rates, and free colour consultation at ${shop.shortName}, Kotul.`,
};

// Dated offers start and end at midnight with no owner save to refresh the page.
export const revalidate = 3600;

export default async function OffersPage() {
  const datedOffers = await getLiveOffers();
  return (
    <div className="bg-surface">
      <PageHeader
        title="Offers"
        description="Bulk rates for painters and builders, free colour help, and seasonal paint deals."
      />
      <section className="container-page py-8 sm:py-12">
        <OfferCards datedOffers={datedOffers} />
      </section>
    </div>
  );
}
