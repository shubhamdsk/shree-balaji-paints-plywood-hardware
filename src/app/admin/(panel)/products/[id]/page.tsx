import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductForm from "@/components/admin/ProductForm";
import AppLink from "@/components/ui/AppLink";
import { compactGroups } from "@/lib/catalog";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { getAdminProduct } from "@/services/admin-product-service";
import { getCategoryGroups } from "@/services/catalog-service";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: PageProps<"/admin/products/[id]">) {
  await requireOwner();
  const { id } = await params;
  const [product, categoryGroups] = await Promise.all([getAdminProduct(id), getCategoryGroups()]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Edit {product.name}</h1>
        {product.isVisible && (
          <AppLink href={ROUTES.product(product.id)} className="mt-1 inline-block text-sm font-semibold text-accent-600 hover:underline">
            View on the website
          </AppLink>
        )}
      </div>
      <ProductForm key={product.updatedAt} product={product} categoryGroups={compactGroups(categoryGroups)} />
    </div>
  );
}
