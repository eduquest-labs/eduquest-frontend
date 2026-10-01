"use client";

import { useMemo } from "react";
import type { EChartsCoreOption } from "echarts/core";

import type { SchoolComparison } from "@/types";

import { EChart } from "@/components/base/shared/EChart";
import { ResearchPanel } from "@/components/superadmin-shared/ResearchUI";

type SchoolScoreDistributionChartProps = {
  comparisons: SchoolComparison[];
};

export function SchoolScoreDistributionChart({
  comparisons,
}: SchoolScoreDistributionChartProps) {
  const option = useMemo<EChartsCoreOption>(() => {
    const maximumScore = Math.max(
      1,
      ...comparisons.map((comparison) => comparison.maximumScore ?? 0)
    );
    const categories = comparisons.map((comparison) => comparison.schoolName);

    return {
      animationDuration: 400,
      aria: {
        enabled: true,
        description:
          "Grafik rentang skor mentah minimum sampai maksimum dengan penanda median per sekolah.",
      },
      grid: {
        containLabel: true,
        left: 8,
        right: 28,
        top: 12,
        bottom: 20,
      },
      tooltip: { trigger: "axis" },
      xAxis: {
        type: "value",
        min: 0,
        max: Math.ceil(maximumScore * 1.1),
        splitLine: { lineStyle: { color: "var(--chart-grid)" } },
        axisLabel: { color: "var(--chart-text)" },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: categories,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: "var(--chart-text)",
          width: 112,
          overflow: "truncate",
        },
      },
      series: [
        {
          name: "Minimum",
          type: "bar",
          stack: "range",
          silent: true,
          itemStyle: { color: "transparent" },
          emphasis: { disabled: true },
          data: comparisons.map(
            (comparison) => comparison.minimumScore ?? 0
          ),
        },
        {
          name: "Rentang min–max",
          type: "bar",
          stack: "range",
          barMaxWidth: 14,
          itemStyle: {
            color: "var(--chart-fill)",
            borderColor: "var(--chart-primary)",
            borderWidth: 1,
            borderRadius: 7,
          },
          data: comparisons.map((comparison) =>
            comparison.minimumScore === null ||
            comparison.maximumScore === null
              ? 0
              : comparison.maximumScore - comparison.minimumScore
          ),
        },
        {
          name: "Median",
          type: "scatter",
          symbolSize: 12,
          itemStyle: {
            color: "var(--chart-point)",
            borderColor: "var(--surface)",
            borderWidth: 2,
          },
          data: comparisons
            .filter((comparison) => comparison.medianScore !== null)
            .map((comparison) => [
              comparison.medianScore,
              comparison.schoolName,
            ]),
        },
      ],
    };
  }, [comparisons]);

  return (
    <ResearchPanel title="Rentang skor mentah" description="Batang menunjukkan minimum–maksimum; titik menunjukkan median. Sekolah tanpa skor final tidak memiliki rentang.">
        <EChart
          respectReducedMotion
          ariaLabel="Distribusi minimum, maksimum, dan median skor mentah final per sekolah"
          height={Math.max(280, comparisons.length * 58)}
          option={option}
        />
    </ResearchPanel>
  );
}
