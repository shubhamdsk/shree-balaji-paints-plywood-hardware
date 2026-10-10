import type { Metadata } from "next";
import AdminEnquiryList from "@/components/admin/AdminEnquiryList";
import { requireOwner } from "@/server/auth/guard";
import { getEnquiryCounts, listAdminEnquiries } from "@/services/enquiry-service";

export const metadata: Metadata = { title: "Enquiries" };

export default async function AdminEnquiriesPage() {
  await requireOwner();
  const [page, counts] = await Promise.all([listAdminEnquiries(), getEnquiryCounts()]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Enquiries</h1>
        <p className="mt-1 text-muted">Messages customers sent from the website. Call or WhatsApp them back.</p>
      </div>

      <AdminEnquiryList initialPage={page} initialCounts={counts} />
    </div>
  );
}
