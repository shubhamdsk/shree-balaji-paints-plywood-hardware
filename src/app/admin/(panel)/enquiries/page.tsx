import type { Metadata } from "next";
import AdminEnquiryList from "@/components/admin/AdminEnquiryList";
import { requireOwner } from "@/server/auth/guard";
import { getEnquiryCounts, listAdminEnquiries } from "@/services/enquiry-service";

export const metadata: Metadata = { title: "Enquiries & Leads | Owner Panel" };

export default async function AdminEnquiriesPage() {
  await requireOwner();
  const [page, counts] = await Promise.all([listAdminEnquiries(), getEnquiryCounts()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Enquiries &amp; Customer Leads</h1>
        <p className="mt-1 text-muted">
          Manage WhatsApp and online enquiries submitted by customers. Track follow-ups and closed sales.
        </p>
      </div>

      <AdminEnquiryList initialPage={page} initialCounts={counts} />
    </div>
  );
}
