import type { Metadata } from "next";
import { notFound } from "next/navigation";
import OfferForm from "@/components/admin/OfferForm";
import { requireOwner } from "@/server/auth/guard";
import { getAdminOffer } from "@/services/offer-service";

export const metadata: Metadata = { title: "Edit offer" };

export default async function EditOfferPage({ params }: PageProps<"/admin/offers/[id]">) {
  await requireOwner();
  const { id } = await params;
  const offer = await getAdminOffer(id);
  if (!offer) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Edit {offer.title}</h1>
      <OfferForm key={offer.updatedAt} offer={offer} />
    </div>
  );
}
