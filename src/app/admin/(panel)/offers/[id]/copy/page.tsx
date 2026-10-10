import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OfferForm from "@/components/admin/OfferForm";
import { requireOwner } from "@/server/auth/guard";
import { getAdminOffer } from "@/services/offer-service";

export const metadata: Metadata = { title: "Copy offer" };

export default async function CopyOfferPage({ params }: PageProps<"/admin/offers/[id]/copy">) {
  await requireOwner();
  const { id } = await params;
  const offer = await getAdminOffer(id);
  if (!offer) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Copy {offer.title}</h1>
        <p className="mt-1 text-sm text-muted">Choose the new dates. The text and photo are copied from the original offer.</p>
      </div>
      <OfferForm copyFrom={offer} />
    </div>
  );
}
