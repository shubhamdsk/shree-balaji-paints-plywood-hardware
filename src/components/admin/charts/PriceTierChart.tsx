"use client";

import ApexChartWrapper from "@/components/admin/charts/ApexChartWrapper";
import type { PriceTierStat } from "@/services/admin-analytics-service";

export default function PriceTierChart({ priceTiers }: { priceTiers: PriceTierStat[] }) {
  const categories = priceTiers.map((p) => p.label);
  const data = priceTiers.map((p) => p.count);

  const series = [{ name: "Products", data }];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      fontFamily: "inherit",
      toolbar: { show: false },
      background: "transparent",
      sparkline: { enabled: false },
    },
    colors: ["#f59e0b"],
    stroke: { curve: "smooth", width: 3 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 95, 100],
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories,
      labels: {
        style: { colors: "var(--color-muted, #64748b)", fontSize: "12px", fontWeight: 600 },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "var(--color-muted, #64748b)", fontSize: "12px" },
      },
    },
    grid: {
      borderColor: "var(--color-line, #e2e8f0)",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val: number) => `${val} items`,
      },
    },
  };

  return (
    <div className="rounded-card border border-line bg-card p-5 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-bold text-heading">Catalog Price Spectrum</h3>
        <p className="text-xs font-semibold text-muted">Price range spread across all products</p>
      </div>
      <div className="h-64 min-w-0">
        <ApexChartWrapper options={options} series={series} type="area" height="100%" />
      </div>
    </div>
  );
}
