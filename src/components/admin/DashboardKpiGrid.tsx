import { AlertTriangle, CheckCircle2, House, Package, Tag } from "@/components/ui/icons";
import type { AdminAnalyticsData } from "@/services/admin-analytics-service";

export default function DashboardKpiGrid({ analytics }: { analytics: AdminAnalyticsData }) {
  const kpis = [
    {
      label: "Total Products",
      value: analytics.totalProducts,
      subtext: "Items in active database",
      icon: Package,
      color: "bg-brand-50 text-brand-600 border-brand-200",
    },
    {
      label: "Stock Rate",
      value: `${analytics.stockPercentage}%`,
      subtext: `${analytics.inStockCount} in stock`,
      icon: CheckCircle2,
      color: "bg-success/10 text-success border-success/20",
    },
    {
      label: "Out of Stock",
      value: analytics.outOfStockCount,
      subtext: "Needs inventory refill",
      icon: AlertTriangle,
      color: "bg-accent-50 text-accent-600 border-accent-200",
    },
    {
      label: "Home Showcase",
      value: analytics.featuredCount,
      subtext: "Featured on homepage",
      icon: House,
      color: "bg-gold-500/10 text-gold-600 border-gold-500/20",
    },
    {
      label: "Hidden Items",
      value: analytics.hiddenCount,
      subtext: "Invisible on store",
      icon: Tag,
      color: "bg-surface-muted text-muted border-line",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        return (
          <div
            key={kpi.label}
            className="flex flex-col justify-between rounded-card border border-line bg-card p-4 shadow-card transition-all hover:border-paint-500"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-muted">{kpi.label}</span>
              <span className={`grid h-8 w-8 place-items-center rounded-lg border ${kpi.color}`}>
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-extrabold text-heading sm:text-3xl">{kpi.value}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-muted">{kpi.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
