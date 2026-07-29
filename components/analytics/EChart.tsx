"use client";

import { useEffect, useRef } from "react";
import { BarChart, ScatterChart } from "echarts/charts";
import {
  AriaComponent,
  GridComponent,
  TooltipComponent,
} from "echarts/components";
import {
  init,
  use as registerEChartsModules,
  type EChartsCoreOption,
  type EChartsType,
} from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";

registerEChartsModules([
  AriaComponent,
  BarChart,
  CanvasRenderer,
  GridComponent,
  ScatterChart,
  TooltipComponent,
]);

type EChartProps = {
  ariaLabel: string;
  height: number;
  option: EChartsCoreOption;
};

export function EChart({ ariaLabel, height, option }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const chart = init(container);
    const resizeObserver = new ResizeObserver(() => chart.resize());
    chartRef.current = chart;
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true });
  }, [option]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel}
      className="w-full min-w-0"
      style={{ height }}
    />
  );
}
