import type { Metadata } from "next";
import { notFound } from "next/navigation";
import AdminCategoryList from "@/components/admin/AdminCategoryList";
import CategoryForm from "@/components/admin/CategoryForm";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import { Plus } from "@/components/ui/icons";
import { typeListItems } from "@/lib/category-list";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { getAdminCategory } from "@/services/admin-category-service";

export const metadata: Metadata = { title: "Edit category" };

export default async function EditCategoryPage({ params }: PageProps<"/admin/categories/[id]">) {
  await requireOwner();
  const { id } = await params;
  const category = await getAdminCategory(id);
  if (!category) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <section className="space-y-6">
        <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Edit {category.name}</h1>
        <CategoryForm
          key={category.name + category.image}
          kind="category"
          record={category}
          cancelHref={ROUTES.adminCategories}
          defaultSortOrder={category.sortOrder}
        />
      </section>

      <section aria-labelledby="types-heading" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="types-heading" className="text-xl font-extrabold text-heading">
            Types in {category.name}
          </h2>
          <AppLink href={ROUTES.adminNewSubcategory(category.id)} className={buttonClasses("secondary")}>
            <Plus aria-hidden className="h-4 w-4" /> Add type
          </AppLink>
        </div>
        <AdminCategoryList kind="type" items={typeListItems(category.subcategories)} />
      </section>
    </div>
  );
}
