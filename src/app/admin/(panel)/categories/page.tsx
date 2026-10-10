import type { Metadata } from "next";
import AdminCategoryList from "@/components/admin/AdminCategoryList";
import { requireOwner } from "@/server/auth/guard";
import { getAdminCategoriesWithCounts } from "@/services/admin-category-service";

export const metadata: Metadata = { title: "Category Management | Owner Panel" };

export default async function AdminCategoriesPage() {
  await requireOwner();
  const categories = await getAdminCategoriesWithCounts();

  return (
    <div className="space-y-6">
      <AdminCategoryList categories={categories} />
    </div>
  );
}
