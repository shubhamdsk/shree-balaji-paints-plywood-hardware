"use client";

import dynamic from "next/dynamic";
import type { Props as ReactApexChartProps } from "react-apexcharts";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
  loading: () => (
    <div className="flex h-64 w-full items-center justify-center rounded-xl bg-surface-muted text-sm font-semibold text-muted animate-pulse">
      Loading chart data…
    </div>
  ),
});

export default function ApexChartWrapper(props: ReactApexChartProps) {
  return <ReactApexChart {...props} />;
}
