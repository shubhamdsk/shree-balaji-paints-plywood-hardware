import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm";
import { nextSortOrder } from "@/lib/category-list";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { getAdminCategory } from "@/services/admin-category-service";

export const metadata: Metadata = { title: "Add type" };

export default async function NewTypePage({ params }: PageProps<"/admin/categories/[id]/types/new">) {
  await requireOwner();
  const { id } = await params;
  const category = await getAdminCategory(id);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Add a type to {category.name}</h1>
      <CategoryForm
        kind="type"
        categoryId={category.id}
        cancelHref={ROUTES.adminCategory(category.id)}
        defaultSortOrder={nextSortOrder(category.subcategories)}
      />
    </div>
  );
}
