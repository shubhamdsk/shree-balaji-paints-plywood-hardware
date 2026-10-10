import type { Metadata } from "next";
import AdminProductList from "@/components/admin/AdminProductList";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { listAdminProducts } from "@/services/admin-product-service";

export const metadata: Metadata = { title: "Products" };

export default async function AdminProductsPage() {
  await requireOwner();
  const products = await listAdminProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Products</h1>
          <p className="mt-1 text-muted">Recently changed products are listed first.</p>
        </div>
        <AppLink href={ROUTES.adminNewProduct} className={buttonClasses("primary")}>
          Add product
        </AppLink>
      </div>
      <AdminProductList products={products} />
    </div>
  );
}
