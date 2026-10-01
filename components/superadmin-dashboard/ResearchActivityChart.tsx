"use client";

import { useMemo } from "react";
import type { EChartsCoreOption } from "echarts/core";
import { EChart } from "@/components/base/shared/EChart";
import type { ResearchDashboardSnapshot } from "@/lib/contracts/superadmin-dashboard";

export function ResearchActivityChart({ daily }: { daily: ResearchDashboardSnapshot["daily"] }) {
  const option = useMemo<EChartsCoreOption>(() => ({
    animationDuration: 550,
    aria: { enabled: true, description: "Jumlah pengerjaan kuis dimulai dan dikumpulkan per hari dalam WIB." },
    grid: { left: 12, right: 16, top: 24, bottom: 12, containLabel: true },
    tooltip: { trigger: "axis", renderMode: "richText" },
    xAxis: { type: "category", boundaryGap: false, data: daily.map((day) => day.date), axisLine: { show: false }, axisTick: { show: false }, axisLabel: { color: "var(--chart-text)", formatter: (date: string) => `${date.slice(8)}/${date.slice(5, 7)}`, hideOverlap: true } },
    yAxis: { type: "value", minInterval: 1, min: 0, axisLabel: { color: "var(--chart-text)" }, splitLine: { lineStyle: { color: "var(--chart-grid)", type: "dashed" } } },
    series: [
      { name: "Dimulai", type: "line", symbol: "circle", symbolSize: 6, showSymbol: daily.length <= 7, smooth: false, lineStyle: { width: 3 }, itemStyle: { color: "var(--chart-primary)" }, areaStyle: { color: "var(--chart-fill)", opacity: 0.22 }, data: daily.map((day) => day.started_count) },
      { name: "Dikumpulkan", type: "line", symbolSize: 6, showSymbol: daily.length <= 7, smooth: false, lineStyle: { width: 2, type: "dashed" }, itemStyle: { color: "var(--chart-secondary)" }, data: daily.map((day) => day.submitted_count) },
    ],
  }), [daily]);
  return <EChart ariaLabel="Tren harian pengerjaan kuis dimulai dan dikumpulkan" height={250} option={option} respectReducedMotion />;
}
