import type { Metadata } from "next";
import ProductForm from "@/components/admin/ProductForm";
import { compactGroups } from "@/lib/catalog";
import { requireOwner } from "@/server/auth/guard";
import { getCategoryGroups } from "@/services/catalog-service";

export const metadata: Metadata = { title: "Add a product" };

export default async function NewProductPage() {
  await requireOwner();
  const categoryGroups = await getCategoryGroups();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Add a product</h1>
      <ProductForm categoryGroups={compactGroups(categoryGroups)} />
    </div>
  );
}
