import type { Metadata } from "next";
import AdminCategoryList from "@/components/admin/AdminCategoryList";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import { Plus } from "@/components/ui/icons";
import { categoryListItems } from "@/lib/category-list";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { listAdminCategories } from "@/services/admin-category-service";

export const metadata: Metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  await requireOwner();
  const categories = await listAdminCategories();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Categories</h1>
          <p className="mt-1 text-muted">Open a category to change its photo, its types and how it shows on Google.</p>
        </div>
        <AppLink href={ROUTES.adminNewCategory} className={buttonClasses("primary")}>
          <Plus aria-hidden className="h-4 w-4" /> Add category
        </AppLink>
      </div>
      <AdminCategoryList kind="category" items={categoryListItems(categories)} />
    </div>
  );
}
