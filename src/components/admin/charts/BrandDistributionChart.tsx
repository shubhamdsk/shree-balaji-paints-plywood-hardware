"use client";

import ApexChartWrapper from "@/components/admin/charts/ApexChartWrapper";
import type { BrandStockStat } from "@/services/admin-analytics-service";

export default function BrandDistributionChart({ brands }: { brands: BrandStockStat[] }) {
  const brandNames = brands.map((b) => b.brand);
  const totals = brands.map((b) => b.total);

  const series = [
    {
      name: "Products Count",
      data: totals,
    },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      fontFamily: "inherit",
      toolbar: { show: false },
      background: "transparent",
    },
    colors: ["#6366f1"],
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: "50%",
        borderRadius: 4,
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`,
      style: { colors: ["#fff"], fontSize: "11px", fontWeight: 700 },
    },
    xaxis: {
      categories: brandNames,
      labels: {
        style: { colors: "var(--color-muted, #64748b)", fontSize: "12px" },
      },
    },
    yaxis: {
      labels: {
        style: { colors: "var(--color-heading, #0f172a)", fontSize: "13px", fontWeight: 600 },
      },
    },
    grid: {
      borderColor: "var(--color-line, #e2e8f0)",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val: number) => `${val} catalog items`,
      },
    },
  };

  return (
    <div className="rounded-card border border-line bg-card p-5 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-bold text-heading">Top Brands Share</h3>
        <p className="text-xs font-semibold text-muted">Distribution of products across major brands</p>
      </div>
      <div className="h-72 min-w-0">
        <ApexChartWrapper options={options} series={series} type="bar" height="100%" />
      </div>
    </div>
  );
}
