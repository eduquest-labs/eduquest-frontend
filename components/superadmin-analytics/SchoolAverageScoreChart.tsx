"use client";

import { useMemo } from "react";
import type { EChartsCoreOption } from "echarts/core";

import type { SchoolComparison } from "@/types";

import { EChart } from "@/components/base/shared/EChart";
import { ResearchPanel } from "@/components/superadmin-shared/ResearchUI";

type SchoolAverageScoreChartProps = {
  comparisons: SchoolComparison[];
};

const SCORE_COLOR = "var(--chart-primary)";
const EMPTY_COLOR = "var(--chart-empty)";

export function SchoolAverageScoreChart({
  comparisons,
}: SchoolAverageScoreChartProps) {
  const option = useMemo<EChartsCoreOption>(() => {
    const maximumAverage = Math.max(
      1,
      ...comparisons.map((comparison) => comparison.averageScore ?? 0)
    );

    return {
      animationDuration: 400,
      aria: {
        enabled: true,
        description:
          "Grafik batang horizontal rata-rata skor mentah final per sekolah.",
      },
      grid: {
        containLabel: true,
        left: 8,
        right: 48,
        top: 12,
        bottom: 20,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "shadow" },
      },
      xAxis: {
        type: "value",
        min: 0,
        max: Math.ceil(maximumAverage * 1.1),
        splitLine: { lineStyle: { color: "var(--chart-grid)" } },
        axisLabel: { color: "var(--chart-text)" },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: comparisons.map((comparison) => comparison.schoolName),
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
          name: "Rata-rata skor mentah",
          type: "bar",
          barMaxWidth: 28,
          data: comparisons.map((comparison) => ({
            value: comparison.averageScore ?? 0,
            itemStyle: {
              color:
                comparison.averageScore === null ? EMPTY_COLOR : SCORE_COLOR,
              borderRadius: [0, 6, 6, 0],
            },
            label: {
              show: true,
              position: "right",
              color: "var(--chart-text)",
              formatter:
                comparison.averageScore === null
                  ? "—"
                  : new Intl.NumberFormat("id-ID", {
                      maximumFractionDigits: 2,
                    }).format(comparison.averageScore),
            },
          })),
        },
      ],
    };
  }, [comparisons]);

  return (
    <ResearchPanel title="Rata-rata skor mentah" description="Hanya pengerjaan terkunci dengan penilaian lengkap. Baca bersama jumlah skor final pada tabel.">
        <EChart
          respectReducedMotion
          ariaLabel="Perbandingan rata-rata skor mentah final per sekolah"
          height={Math.max(280, comparisons.length * 58)}
          option={option}
        />
    </ResearchPanel>
  );
}
