"use client";

import { useMemo } from "react";
import { Card } from "@heroui/react";
import type { EChartsCoreOption } from "echarts/core";

import type { ClassComparison } from "@/types";

import { EChart } from "./EChart";

type AverageScoreChartProps = {
  comparisons: ClassComparison[];
};

const SCORE_COLOR = "#0f766e";
const EMPTY_COLOR = "#cbd5e1";

export function AverageScoreChart({
  comparisons,
}: AverageScoreChartProps) {
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
          "Grafik batang horizontal rata-rata skor mentah final per kelas atau sekolah.",
      },
      grid: {
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
        splitLine: { lineStyle: { color: "#e2e8f0" } },
        axisLabel: { color: "#64748b" },
      },
      yAxis: {
        type: "category",
        inverse: true,
        data: comparisons.map((comparison) => comparison.className),
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: {
          color: "#475569",
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
              color: "#475569",
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
    <Card className="min-w-0 items-stretch overflow-hidden">
      <Card.Header>
        <div>
          <Card.Title>Rata-rata skor mentah</Card.Title>
          <Card.Description>
            Hanya attempt terkunci dengan penilaian lengkap.
          </Card.Description>
        </div>
      </Card.Header>
      <Card.Content className="min-w-0 overflow-hidden">
        <EChart
          ariaLabel="Perbandingan rata-rata skor mentah final per kelas"
          height={Math.max(280, comparisons.length * 58)}
          option={option}
        />
      </Card.Content>
    </Card>
  );
}
