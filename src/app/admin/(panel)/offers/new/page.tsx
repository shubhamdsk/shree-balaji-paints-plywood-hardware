import type { Metadata } from "next";
import OfferForm from "@/components/admin/OfferForm";
import { todayInIndia } from "@/lib/dates";
import { requireOwner } from "@/server/auth/guard";

export const metadata: Metadata = { title: "Add offer" };

export default async function NewOfferPage() {
  await requireOwner();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Add offer</h1>
      <OfferForm today={todayInIndia()} />
    </div>
  );
}
