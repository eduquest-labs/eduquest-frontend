"use client";

import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { MapPinned } from "lucide-react";

import type {
  PhysicalActivityRecorderStatus,
  PhysicalActivityRoutePoint,
} from "@/types";

const LazyPhysicalActivityMap = dynamic(
  () => import("@/components/physical-activity/PhysicalActivityMap"),
  {
    ssr: false,
    loading: () => (
      <div className="h-full animate-pulse bg-ink-100 dark:bg-ink-900" />
    ),
  }
);

class MapErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(): void {}

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-2 bg-ink-100 px-6 text-center dark:bg-ink-900">
          <MapPinned className="text-ink-400" size={24} />
          <p className="text-sm font-medium text-muted">
            Peta tidak dapat dimuat
          </p>
          <p className="text-xs text-muted">
            Perekaman GPS tetap berjalan dan data tetap tersimpan.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export function PhysicalActivityMapShell({
  points,
  status,
}: {
  points: PhysicalActivityRoutePoint[];
  status: PhysicalActivityRecorderStatus;
}) {
  return (
    <div
      aria-label="Peta rute aktivitas"
      className="relative h-72 w-full overflow-hidden rounded-3xl border border-border bg-ink-100 shadow-sm sm:h-96 dark:border-border dark:bg-ink-900"
    >
      <MapErrorBoundary>
        <LazyPhysicalActivityMap points={points} status={status} />
      </MapErrorBoundary>
      {points.length === 0 ? (
        <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl bg-ink-950/85 px-4 py-3 text-center text-xs font-semibold text-white shadow-lg backdrop-blur">
          Menunggu titik GPS pertama…
        </div>
      ) : null}
    </div>
  );
}
