import type { Metadata } from "next";
import DashboardSummary from "@/components/admin/DashboardSummary";
import StockAlertList from "@/components/admin/StockAlertList";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import { Plus } from "@/components/ui/icons";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { listAdminProducts } from "@/services/admin-product-service";
import { getEnquiryCounts } from "@/services/enquiry-service";
import { getLiveOffers } from "@/services/offer-service";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [owner, products, enquiryCounts, liveOffers] = await Promise.all([
    requireOwner(),
    listAdminProducts(),
    getEnquiryCounts(),
    getLiveOffers(),
  ]);
  const outOfStockProducts = products.filter((p) => !p.inStock);

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">Namaste, {owner.username}</h1>
          <p className="mt-1 text-sm font-semibold text-muted">Here&apos;s what needs your attention today.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <AppLink href={ROUTES.adminNewProduct} className={buttonClasses("primary")}>
            <Plus className="h-4 w-4" aria-hidden /> Add product
          </AppLink>
          <AppLink href={ROUTES.adminNewOffer} className={buttonClasses("secondary")}>
            <Plus className="h-4 w-4" aria-hidden /> Add offer
          </AppLink>
        </div>
      </div>

      <DashboardSummary
        newEnquiries={enquiryCounts.new}
        outOfStock={outOfStockProducts.length}
        liveOffers={liveOffers.length}
      />

      <StockAlertList outOfStockProducts={outOfStockProducts} />
    </div>
  );
}
