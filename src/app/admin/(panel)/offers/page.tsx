import type { Metadata } from "next";
import AdminOfferList from "@/components/admin/AdminOfferList";
import { todayInIndia } from "@/lib/dates";
import { requireOwner } from "@/server/auth/guard";
import { getAdminOffers } from "@/services/offer-service";

export const metadata: Metadata = { title: "Offers" };

export default async function AdminOffersPage() {
  await requireOwner();
  const offers = await getAdminOffers();

  return <AdminOfferList offers={offers} today={todayInIndia()} />;
}
