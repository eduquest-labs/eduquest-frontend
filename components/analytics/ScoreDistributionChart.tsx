"use client";

import { useMemo } from "react";
import { Card } from "@heroui/react";
import type { EChartsCoreOption } from "echarts/core";

import type { ClassComparison } from "@/types";

import { EChart } from "@/components/base/shared/EChart";

type ScoreDistributionChartProps = {
  comparisons: ClassComparison[];
};

export function ScoreDistributionChart({
  comparisons,
}: ScoreDistributionChartProps) {
  const option = useMemo<EChartsCoreOption>(() => {
    const maximumScore = Math.max(
      1,
      ...comparisons.map((comparison) => comparison.maximumScore ?? 0)
    );
    const categories = comparisons.map((comparison) => comparison.className);

    return {
      animationDuration: 400,
      aria: {
        enabled: true,
        description:
          "Grafik rentang skor mentah minimum sampai maksimum dengan penanda median per kelas atau sekolah.",
      },
      grid: {
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
              comparison.className,
            ]),
        },
      ],
    };
  }, [comparisons]);

  return (
    <Card className="min-w-0 items-stretch overflow-hidden">
      <Card.Header>
        <div>
          <Card.Title>Distribusi skor mentah</Card.Title>
          <Card.Description>
            Rentang minimum–maksimum dengan titik median.
          </Card.Description>
        </div>
      </Card.Header>
      <Card.Content className="min-w-0 overflow-hidden">
        <EChart
          ariaLabel="Distribusi minimum, maksimum, dan median skor mentah final per kelas"
          height={Math.max(280, comparisons.length * 58)}
          option={option}
        />
      </Card.Content>
    </Card>
  );
}
