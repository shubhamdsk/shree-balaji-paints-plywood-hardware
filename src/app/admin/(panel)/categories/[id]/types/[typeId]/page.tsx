import type { Metadata } from "next";
import { notFound } from "next/navigation";
import CategoryForm from "@/components/admin/CategoryForm";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { getAdminSubcategory } from "@/services/admin-category-service";

export const metadata: Metadata = { title: "Edit type" };

export default async function EditTypePage({ params }: PageProps<"/admin/categories/[id]/types/[typeId]">) {
  await requireOwner();
  const { id, typeId } = await params;
  const type = await getAdminSubcategory(typeId);
  if (!type || type.categoryId !== id) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Edit {type.name}</h1>
      <p className="text-muted">
        {type.productCount} product{type.productCount === 1 ? "" : "s"} use this type.
      </p>
      <CategoryForm
        key={type.name + type.image}
        kind="type"
        categoryId={id}
        record={type}
        cancelHref={ROUTES.adminCategory(id)}
        defaultSortOrder={type.sortOrder}
      />
    </div>
  );
}
