"use client";

import { useEffect, useRef } from "react";
import { BarChart, LineChart, ScatterChart } from "echarts/charts";
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
  LineChart,
  ScatterChart,
  TooltipComponent,
]);

type EChartProps = {
  ariaLabel: string;
  height: number;
  option: EChartsCoreOption;
  respectReducedMotion?: boolean;
};

// Canvas cannot resolve CSS variables. Resolve only plain option values and
// retain callbacks, typed arrays and other ECharts objects unchanged.
function resolveThemeValues(value: unknown, styles: CSSStyleDeclaration): unknown {
  if (typeof value === "string") {
    const token = /^var\((--[\w-]+)\)$/.exec(value);
    return token ? styles.getPropertyValue(token[1]).trim() || value : value;
  }
  if (Array.isArray(value)) return value.map((item) => resolveThemeValues(item, styles));
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, resolveThemeValues(item, styles)])
    );
  }
  return value;
}

export function EChart({ ariaLabel, height, option, respectReducedMotion = false }: EChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<EChartsType | null>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return;
    }

    const styles = getComputedStyle(container);
    const color = (token: string) => styles.getPropertyValue(token).trim();
    const chart = init(container, {
      color: [color("--chart-primary"), color("--chart-secondary")],
      backgroundColor: "transparent",
      textStyle: { color: color("--foreground") },
      tooltip: {
        backgroundColor: color("--overlay"),
        borderColor: color("--border"),
        textStyle: { color: color("--foreground") },
      },
    });
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
    const container = containerRef.current;
    if (!container) return;
    const motionPreference = respectReducedMotion && typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;

    const applyTheme = () => {
      const styles = getComputedStyle(container);
      const color = (token: string) => styles.getPropertyValue(token).trim();
      const themedOption = resolveThemeValues(option, styles) as EChartsCoreOption;
      const tooltipDefaults = {
        backgroundColor: color("--overlay"),
        borderColor: color("--border"),
        textStyle: { color: color("--foreground") },
      };
      chartRef.current?.setOption({
        color: [color("--chart-primary"), color("--chart-secondary")],
        ...themedOption,
        ...(motionPreference?.matches ? { animation: false } : {}),
        textStyle: { color: color("--foreground"), ...themedOption.textStyle },
        tooltip: Array.isArray(themedOption.tooltip)
          ? themedOption.tooltip.map((tooltip) => ({ ...tooltipDefaults, ...tooltip }))
          : {
              ...tooltipDefaults,
              ...(themedOption.tooltip && typeof themedOption.tooltip === "object"
                ? themedOption.tooltip
                : {}),
            },
      }, { notMerge: true });
    };

    applyTheme();
    motionPreference?.addEventListener("change", applyTheme);
    // next-themes writes the DOM attribute in an effect. Observe the actual
    // attribute so canvas colors are read after the new CSS theme is applied.
    const themeObserver = new MutationObserver(applyTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => {
      themeObserver.disconnect();
      motionPreference?.removeEventListener("change", applyTheme);
    };
  }, [option, respectReducedMotion]);

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
