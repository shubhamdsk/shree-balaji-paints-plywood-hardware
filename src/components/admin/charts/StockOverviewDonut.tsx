"use client";

import ApexChartWrapper from "@/components/admin/charts/ApexChartWrapper";

interface StockOverviewDonutProps {
  inStock: number;
  outOfStock: number;
  stockPercentage: number;
}

export default function StockOverviewDonut({
  inStock,
  outOfStock,
  stockPercentage,
}: StockOverviewDonutProps) {
  const series = [inStock, outOfStock];
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
      toolbar: { show: false },
      background: "transparent",
    },
    labels: ["In Stock", "Out of Stock"],
    colors: ["#10b981", "#f43f5e"],
    legend: {
      position: "bottom",
      fontSize: "14px",
      fontWeight: 600,
      labels: { colors: "var(--color-heading, #1e293b)" },
    },
    stroke: { width: 2, colors: ["var(--color-card, #ffffff)"] },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${Math.round(val)}%`,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            total: {
              show: true,
              label: "In Stock Rate",
              formatter: () => `${stockPercentage}%`,
              color: "var(--color-heading, #0f172a)",
              fontSize: "15px",
              fontWeight: 700,
            },
          },
        },
      },
    },
    tooltip: {
      theme: "dark",
      y: {
        formatter: (val: number) => `${val} products`,
      },
    },
  };

  return (
    <div className="rounded-card border border-line bg-card p-5 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-bold text-heading">Inventory Stock Health</h3>
        <p className="text-xs font-semibold text-muted">Stock availability ratio across catalog</p>
      </div>
      <div className="h-64 min-w-0">
        <ApexChartWrapper options={options} series={series} type="donut" height="100%" />
      </div>
    </div>
  );
}
