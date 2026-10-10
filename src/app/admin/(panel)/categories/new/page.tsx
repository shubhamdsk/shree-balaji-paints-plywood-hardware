import type { Metadata } from "next";
import CategoryForm from "@/components/admin/CategoryForm";
import { nextSortOrder } from "@/lib/category-list";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { listAdminCategories } from "@/services/admin-category-service";

export const metadata: Metadata = { title: "Add category" };

export default async function NewCategoryPage() {
  await requireOwner();
  const categories = await listAdminCategories();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Add category</h1>
      <CategoryForm kind="category" cancelHref={ROUTES.adminCategories} defaultSortOrder={nextSortOrder(categories)} />
    </div>
  );
}
