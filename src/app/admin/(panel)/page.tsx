import type { Metadata } from "next";
import BrandDistributionChart from "@/components/admin/charts/BrandDistributionChart";
import CategoryStockBar from "@/components/admin/charts/CategoryStockBar";
import PriceTierChart from "@/components/admin/charts/PriceTierChart";
import StockOverviewDonut from "@/components/admin/charts/StockOverviewDonut";
import DashboardKpiGrid from "@/components/admin/DashboardKpiGrid";
import StockAlertList from "@/components/admin/StockAlertList";
import AppLink from "@/components/ui/AppLink";
import { buttonClasses } from "@/components/ui/Button";
import { Package, Plus } from "@/components/ui/icons";
import { ROUTES } from "@/lib/routes";
import { requireOwner } from "@/server/auth/guard";
import { getAdminAnalytics } from "@/services/admin-analytics-service";
import { listAdminProducts } from "@/services/admin-product-service";

export const metadata: Metadata = { title: "Admin Analytics Dashboard" };

export default async function DashboardPage() {
  const [owner, analytics, products] = await Promise.all([
    requireOwner(),
    getAdminAnalytics(),
    listAdminProducts(),
  ]);

  const outOfStockProducts = products.filter((p) => !p.inStock);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-heading sm:text-3xl">
            Namaste, {owner.username} 👋
          </h1>
          <p className="mt-1 text-sm font-semibold text-muted">
            Live catalog analytics, stock reports and store management overview.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AppLink href={ROUTES.adminNewProduct} className={buttonClasses("primary")}>
            <Plus className="h-4 w-4" /> Add Product
          </AppLink>
          <AppLink href={ROUTES.adminProducts} className={buttonClasses("secondary")}>
            <Package className="h-4 w-4 text-accent-600" /> Manage Products
          </AppLink>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <DashboardKpiGrid analytics={analytics} />

      {/* ApexCharts Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <StockOverviewDonut
            inStock={analytics.inStockCount}
            outOfStock={analytics.outOfStockCount}
            stockPercentage={analytics.stockPercentage}
          />
        </div>
        <div className="lg:col-span-2">
          <CategoryStockBar categories={analytics.categoryStats} />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <BrandDistributionChart brands={analytics.brandStats} />
        <PriceTierChart priceTiers={analytics.priceTiers} />
      </div>

      {/* Out of stock health alert table */}
      <StockAlertList outOfStockProducts={outOfStockProducts} />
    </div>
  );
}
