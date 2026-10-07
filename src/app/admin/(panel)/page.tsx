import type { Metadata } from "next";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { getProductCounts } from "@/services/admin-product-service";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const owner = await requireOwner();
  const counts = await getProductCounts();
  const stats = [
    { label: "Products", value: counts.total },
    { label: "Out of stock", value: counts.outOfStock },
    { label: "Hidden", value: counts.hidden },
    { label: "On the home page", value: counts.featured },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Namaste, {owner.username}</h1>
        <p className="mt-1 text-muted">Changes you save here show on the website within about a minute.</p>
      </div>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-card border border-line bg-card p-5 shadow-card">
            <dt className="text-sm font-semibold text-muted">{stat.label}</dt>
            <dd className="mt-1 text-3xl font-extrabold text-heading">{stat.value}</dd>
          </div>
        ))}
      </dl>
      <div className="flex flex-wrap gap-3">
        <AppLink href={ROUTES.adminNewProduct} className={buttonClasses("primary")}>
          Add a product
        </AppLink>
        <AppLink href={ROUTES.adminProducts} className={buttonClasses("secondary")}>
          Manage products
        </AppLink>
      </div>
    </div>
  );
}
