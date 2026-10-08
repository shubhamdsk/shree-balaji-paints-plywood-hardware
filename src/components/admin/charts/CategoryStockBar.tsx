"use client";

import ApexChartWrapper from "@/components/admin/charts/ApexChartWrapper";
import type { CategoryStockStat } from "@/services/admin-analytics-service";

export default function CategoryStockBar({ categories }: { categories: CategoryStockStat[] }) {
  const categoriesList = categories.map((c) => c.name);
  const inStockData = categories.map((c) => c.inStock);
  const outOfStockData = categories.map((c) => c.outOfStock);

  const series = [
    { name: "In Stock", data: inStockData },
    { name: "Out of Stock", data: outOfStockData },
  ];

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      stacked: false,
      fontFamily: "inherit",
      toolbar: { show: false },
      background: "transparent",
    },
    colors: ["#10b981", "#f43f5e"],
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "55%",
        borderRadius: 4,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: categoriesList,
      labels: {
        style: {
          colors: "var(--color-muted, #64748b)",
          fontSize: "12px",
          fontWeight: 600,
        },
      },
    },
    yaxis: {
      title: {
        text: "Number of Products",
        style: { color: "#64748b", fontSize: "12px", fontWeight: 600 },
      },
      labels: {
        style: { colors: "var(--color-muted, #64748b)", fontSize: "12px" },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "right",
      fontSize: "13px",
      fontWeight: 600,
      labels: { colors: "var(--color-heading, #1e293b)" },
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
        <h3 className="text-base font-bold text-heading">Category Inventory Breakdown</h3>
        <p className="text-xs font-semibold text-muted">Stock availability per product category</p>
      </div>
      <div className="h-72 min-w-0">
        <ApexChartWrapper options={options} series={series} type="bar" height="100%" />
      </div>
    </div>
  );
}
