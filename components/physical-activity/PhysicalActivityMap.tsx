"use client";

import { useEffect } from "react";
import { latLngBounds } from "leaflet";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";

import type {
  PhysicalActivityRecorderStatus,
  PhysicalActivityRoutePoint,
} from "@/types";

const DEFAULT_CENTER: [number, number] = [-6.2, 106.816666];
const DEFAULT_TILE_URL =
  "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEFAULT_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

function resolveTileUrl(): string {
  const configuredUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL?.trim();
  const token = process.env.NEXT_PUBLIC_MAP_TILE_TOKEN?.trim();

  if (
    !configuredUrl ||
    !configuredUrl.startsWith("https://") ||
    !configuredUrl.includes("{z}") ||
    !configuredUrl.includes("{x}") ||
    !configuredUrl.includes("{y}") ||
    (configuredUrl.includes("{token}") && !token)
  ) {
    return DEFAULT_TILE_URL;
  }

  return configuredUrl.replaceAll("{token}", encodeURIComponent(token ?? ""));
}

function resolveAttribution(): string {
  const attribution = process.env.NEXT_PUBLIC_MAP_ATTRIBUTION?.trim();
  const containsExecutableMarkup =
    attribution &&
    /<(script|iframe|object|embed)\b|javascript:|\son\w+\s*=/i.test(
      attribution
    );

  return attribution && !containsExecutableMarkup
    ? attribution
    : DEFAULT_TILE_ATTRIBUTION;
}

const TILE_URL = resolveTileUrl();
const TILE_ATTRIBUTION = resolveAttribution();

function MapResizeSync() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const animationFrame = window.requestAnimationFrame(() => {
      map.invalidateSize({ animate: false, pan: false });
    });
    const resizeObserver = new ResizeObserver(() => {
      map.invalidateSize({ animate: false, pan: false });
    });

    resizeObserver.observe(container);

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
    };
  }, [map]);

  return null;
}

function RouteViewport({ points }: { points: PhysicalActivityRoutePoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (points.length === 1) {
      map.setView([points[0].latitude, points[0].longitude], 17, {
        animate: true,
      });
      return;
    }

    if (points.length > 1) {
      map.fitBounds(
        latLngBounds(points.map((point) => [point.latitude, point.longitude])),
        { animate: true, padding: [28, 28], maxZoom: 17 }
      );
    }
  }, [map, points]);

  return null;
}

export default function PhysicalActivityMap({
  points,
  status,
}: {
  points: PhysicalActivityRoutePoint[];
  status: PhysicalActivityRecorderStatus;
}) {
  const positions = points.map(
    (point) => [point.latitude, point.longitude] as [number, number]
  );
  const firstPoint = points[0];
  const lastPoint = points.at(-1);
  const isSettled = status === "completed" || status === "invalid";
  const isTracking =
    status === "recording" ||
    status === "offline" ||
    status === "finishing" ||
    status === "error";
  const showsDistinctStart = Boolean(firstPoint && points.length > 1);

  return (
    <MapContainer
      center={positions[0] ?? DEFAULT_CENTER}
      zoom={positions.length > 0 ? 16 : 5}
      scrollWheelZoom
      className="h-full w-full"
      attributionControl
    >
      <TileLayer attribution={TILE_ATTRIBUTION} url={TILE_URL} />
      {positions.length > 1 ? (
        <Polyline
          positions={positions}
          pathOptions={{
            color:
              status === "invalid" ? "#d97706" : "var(--color-primary)",
            weight: 5,
            opacity: 0.92,
            dashArray: status === "invalid" ? "10 8" : undefined,
            lineCap: "round",
            lineJoin: "round",
          }}
        />
      ) : null}
      {showsDistinctStart ? (
        <CircleMarker
          center={[firstPoint.latitude, firstPoint.longitude]}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#16a34a",
            fillOpacity: 1,
            opacity: 1,
            weight: 3,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            Mulai
          </Tooltip>
        </CircleMarker>
      ) : null}
      {lastPoint && isTracking ? (
        <>
          {lastPoint.accuracyMeters && lastPoint.accuracyMeters > 0 ? (
            <Circle
              center={[lastPoint.latitude, lastPoint.longitude]}
              radius={lastPoint.accuracyMeters}
              pathOptions={{
                color: "var(--color-primary)",
                fillColor: "var(--color-primary)",
                fillOpacity: 0.08,
                opacity: 0.32,
                weight: 1,
              }}
            />
          ) : null}
          <CircleMarker
            center={[lastPoint.latitude, lastPoint.longitude]}
            radius={13}
            pathOptions={{
              className: "gps-current-location-pulse",
              color: "var(--color-primary)",
              fillColor: "var(--color-primary)",
              fillOpacity: 0.16,
              opacity: 0.35,
              weight: 1,
            }}
          />
          <CircleMarker
            center={[lastPoint.latitude, lastPoint.longitude]}
            radius={7}
            pathOptions={{
              color: "#ffffff",
              fillColor: "var(--color-primary)",
              fillOpacity: 1,
              opacity: 1,
              weight: 3,
            }}
          >
            <Tooltip direction="top" offset={[0, -8]}>
              Lokasi saat ini
            </Tooltip>
          </CircleMarker>
        </>
      ) : null}
      {lastPoint && isSettled ? (
        <CircleMarker
          center={[lastPoint.latitude, lastPoint.longitude]}
          radius={7}
          pathOptions={{
            color: "#ffffff",
            fillColor: "#ef4444",
            fillOpacity: 1,
            opacity: 1,
            weight: 3,
          }}
        >
          <Tooltip direction="top" offset={[0, -8]}>
            Selesai
          </Tooltip>
        </CircleMarker>
      ) : null}
      <MapResizeSync />
      <RouteViewport points={points} />
    </MapContainer>
  );
}
