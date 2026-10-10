import type { Metadata } from "next";
import AdminGalleryList from "@/components/admin/AdminGalleryList";
import { requireOwner } from "@/server/auth/guard";
import { getAdminGalleryItems } from "@/services/gallery-service";

export const metadata: Metadata = { title: "Work Gallery Management | Owner Panel" };

export default async function AdminGalleryPage() {
  await requireOwner();
  const items = await getAdminGalleryItems();

  return <AdminGalleryList initialItems={items} />;
}
