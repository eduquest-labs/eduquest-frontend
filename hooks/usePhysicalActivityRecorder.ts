"use client";

import { isAxiosError } from "axios";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  GPS_BATCH_INTERVAL_MS,
  GPS_BATCH_SIZE,
  GPS_MAP_RENDER_INTERVAL_MS,
  GPS_MAX_DISPLAY_POINTS,
  GPS_QUEUE_TTL_MS,
  GPS_RETRY_MAX_DELAY_MS,
  GPS_WATCH_OPTIONS,
} from "@/config/constants";
import {
  useFinishPhysicalActivity,
  useStartPhysicalActivity,
  useUploadPhysicalActivityPoints,
} from "@/hooks/mutations";
import {
  acknowledgeGpsPoints,
  countQueuedGpsPoints,
  enqueueGpsPoint,
  listQueuedGpsPoints,
  purgeExpiredGpsPoints,
} from "@/services/physical-activity-queue";
import type {
  GeolocationFailure,
  GpsPointInput,
  PhysicalActivity,
  PhysicalActivityRecorderStatus,
  PhysicalActivityRoutePoint,
} from "@/types";

interface BucketCandidate {
  second: number;
  point: GpsPointInput;
}

function createClientPointId(): string {
  if (typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));

  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex
    .slice(6, 8)
    .join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
}

function wait(milliseconds: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function retryDelay(error: unknown, attempt: number): number | null {
  if (!isAxiosError(error)) {
    return null;
  }

  if (!error.response) {
    return Math.min(2 ** attempt * 1000, GPS_RETRY_MAX_DELAY_MS);
  }

  if (error.response.status === 429) {
    const retryAfter = Number(error.response.headers["retry-after"]);

    return Number.isFinite(retryAfter)
      ? Math.min(retryAfter * 1000, GPS_RETRY_MAX_DELAY_MS)
      : Math.min(2 ** attempt * 1000, GPS_RETRY_MAX_DELAY_MS);
  }

  return error.response.status >= 500
    ? Math.min(2 ** attempt * 1000, GPS_RETRY_MAX_DELAY_MS)
    : null;
}

function geolocationFailure(error: GeolocationPositionError): {
  failure: GeolocationFailure;
  message: string;
} {
  if (error.code === error.PERMISSION_DENIED) {
    return {
      failure: "permission_denied",
      message:
        "Izin lokasi ditolak. Aktifkan izin lokasi browser untuk merekam aktivitas.",
    };
  }

  if (error.code === error.POSITION_UNAVAILABLE) {
    return {
      failure: "position_unavailable",
      message:
        "Posisi GPS belum tersedia. Berpindahlah ke area terbuka dan coba kembali.",
    };
  }

  return {
    failure: "timeout",
    message:
      "GPS belum memperoleh posisi dalam batas waktu. Perekaman akan tetap mencoba.",
  };
}

function compactDisplayPoints(
  current: PhysicalActivityRoutePoint[],
  additions: PhysicalActivityRoutePoint[]
): PhysicalActivityRoutePoint[] {
  const existingRecordedAt = new Set(current.map((point) => point.recordedAt));
  let points = [
    ...current,
    ...additions.filter(
      (point) => !existingRecordedAt.has(point.recordedAt)
    ),
  ];

  while (points.length > GPS_MAX_DISPLAY_POINTS) {
    const lastIndex = points.length - 1;
    points = points.filter(
      (_, index) => index === 0 || index === lastIndex || index % 2 === 0
    );
  }

  return points;
}

export function usePhysicalActivityRecorder(challengeId: number) {
  const { mutateAsync: startActivity } = useStartPhysicalActivity();
  const { mutateAsync: uploadPoints } = useUploadPhysicalActivityPoints();
  const { mutateAsync: finishActivity } = useFinishPhysicalActivity();
  const [status, setStatus] = useState<PhysicalActivityRecorderStatus>("idle");
  const [failure, setFailure] = useState<GeolocationFailure | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activity, setActivity] = useState<PhysicalActivity | null>(null);
  const [livePoints, setLivePoints] = useState<PhysicalActivityRoutePoint[]>([]);
  const [queuedPointCount, setQueuedPointCount] = useState(0);
  const [recordedPointCount, setRecordedPointCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isOnline, setIsOnline] = useState<boolean | null>(null);
  const activityIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const watcherIdRef = useRef<number | null>(null);
  const bucketRef = useRef<BucketCandidate | null>(null);
  const persistenceRef = useRef<Promise<void>>(Promise.resolve());
  const flushPromiseRef = useRef<Promise<void> | null>(null);
  const pendingDisplayPointsRef = useRef<PhysicalActivityRoutePoint[]>([]);
  const mountedRef = useRef(true);

  const refreshQueueCount = useCallback(async (activityId: number) => {
    const count = await countQueuedGpsPoints(activityId);

    if (mountedRef.current) {
      setQueuedPointCount(count);
    }

    return count;
  }, []);

  const uploadWithRetry = useCallback(
    async (activityId: number, points: GpsPointInput[]) => {
      let lastError: unknown;

      for (let attempt = 0; attempt < 5; attempt++) {
        try {
          return await uploadPoints({ activityId, points });
        } catch (error) {
          lastError = error;
          const delay = retryDelay(error, attempt);

          if (delay === null || attempt === 4) {
            throw error;
          }

          await wait(delay);
        }
      }

      throw lastError;
    },
    [uploadPoints]
  );

  const flushQueue = useCallback(
    async (activityId: number, drainAll = false): Promise<void> => {
      if (flushPromiseRef.current) {
        await flushPromiseRef.current;
      }

      const run = async () => {
        do {
          const queued = await listQueuedGpsPoints(activityId, GPS_BATCH_SIZE);

          if (queued.length === 0) {
            break;
          }

          if (!navigator.onLine) {
            throw new Error("offline");
          }

          const acknowledgement = await uploadWithRetry(activityId, queued);
          await acknowledgeGpsPoints(
            activityId,
            acknowledgement.acknowledgedClientPointIds
          );
        } while (drainAll);

        await refreshQueueCount(activityId);
      };

      flushPromiseRef.current = run().finally(() => {
        flushPromiseRef.current = null;
      });

      return flushPromiseRef.current;
    },
    [refreshQueueCount, uploadWithRetry]
  );

  const persistPoint = useCallback(
    (point: GpsPointInput) => {
      const activityId = activityIdRef.current;

      if (!activityId) {
        return;
      }

      persistenceRef.current = persistenceRef.current.then(async () => {
        await enqueueGpsPoint(activityId, point);
        pendingDisplayPointsRef.current.push({
          latitude: point.latitude,
          longitude: point.longitude,
          recordedAt: point.recordedAt,
          accuracyMeters: point.accuracyMeters,
        });
        const queueCount = await refreshQueueCount(activityId);

        if (queueCount >= GPS_BATCH_SIZE && navigator.onLine) {
          await flushQueue(activityId).catch(() => undefined);
        }
      });
    },
    [flushQueue, refreshQueueCount]
  );

  const flushBucket = useCallback(() => {
    if (!bucketRef.current) {
      return;
    }

    persistPoint(bucketRef.current.point);
    bucketRef.current = null;
  }, [persistPoint]);

  const handlePosition = useCallback(
    (position: GeolocationPosition) => {
      const timestamp = position.timestamp || Date.now();

      if (startTimeRef.current !== null && timestamp < startTimeRef.current) {
        return;
      }

      const point: GpsPointInput = {
        clientPointId: createClientPointId(),
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: Number.isFinite(position.coords.accuracy)
          ? position.coords.accuracy
          : null,
        recordedAt: new Date(timestamp).toISOString(),
      };
      const second = Math.floor(timestamp / 1000);
      const current = bucketRef.current;

      if (!current) {
        bucketRef.current = { second, point };
        setLivePoints((displayedPoints) =>
          compactDisplayPoints(displayedPoints, [
            {
              latitude: point.latitude,
              longitude: point.longitude,
              recordedAt: point.recordedAt,
              accuracyMeters: point.accuracyMeters,
            },
          ])
        );
        return;
      }

      if (current.second === second) {
        const currentAccuracy = current.point.accuracyMeters ?? Number.POSITIVE_INFINITY;
        const candidateAccuracy = point.accuracyMeters ?? Number.POSITIVE_INFINITY;

        if (candidateAccuracy < currentAccuracy) {
          bucketRef.current = { second, point };
        }

        return;
      }

      persistPoint(current.point);
      bucketRef.current = { second, point };
      setFailure(null);
      setErrorMessage(null);
      setStatus(navigator.onLine ? "recording" : "offline");
    },
    [persistPoint]
  );

  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    const mapped = geolocationFailure(error);
    setFailure(mapped.failure);
    setErrorMessage(mapped.message);

    if (mapped.failure === "permission_denied") {
      if (watcherIdRef.current !== null) {
        navigator.geolocation.clearWatch(watcherIdRef.current);
        watcherIdRef.current = null;
      }
      setStatus("error");
    }
  }, []);

  const start = useCallback(async () => {
    if (!("geolocation" in navigator)) {
      setFailure("unsupported");
      setErrorMessage("Browser ini tidak mendukung perekaman lokasi GPS.");
      setStatus("error");
      return;
    }

    if (!window.isSecureContext) {
      setFailure("insecure_context");
      setErrorMessage("GPS hanya tersedia melalui HTTPS atau localhost yang aman.");
      setStatus("error");
      return;
    }

    setStatus("requesting_permission");
    setFailure(null);
    setErrorMessage(null);

    try {
      await purgeExpiredGpsPoints(Date.now() - GPS_QUEUE_TTL_MS);
      const started = await startActivity(challengeId);
      activityIdRef.current = started.id;
      startTimeRef.current = started.startTime
        ? new Date(started.startTime).getTime()
        : Date.now();
      setActivity(started);
      await refreshQueueCount(started.id);
      watcherIdRef.current = navigator.geolocation.watchPosition(
        handlePosition,
        handlePositionError,
        GPS_WATCH_OPTIONS
      );
      setStatus(navigator.onLine ? "recording" : "offline");

      if (navigator.onLine) {
        void flushQueue(started.id, true).catch(() => undefined);
      }
    } catch {
      setFailure("server");
      setErrorMessage(
        "Aktivitas gagal dimulai. Pastikan challenge masih aktif dan coba kembali."
      );
      setStatus("error");
    }
  }, [
    challengeId,
    flushQueue,
    handlePosition,
    handlePositionError,
    refreshQueueCount,
    startActivity,
  ]);

  const finish = useCallback(async () => {
    const activityId = activityIdRef.current;

    if (!activityId) {
      return;
    }

    setStatus("finishing");
    setErrorMessage(null);

    if (watcherIdRef.current !== null) {
      navigator.geolocation.clearWatch(watcherIdRef.current);
      watcherIdRef.current = null;
    }

    flushBucket();

    try {
      await persistenceRef.current;
      await flushQueue(activityId, true);
      const remainingPoints = await refreshQueueCount(activityId);

      if (remainingPoints > 0) {
        throw new Error("queue-not-empty");
      }

      const settled = await finishActivity(activityId);
      setActivity(settled);
      setStatus(settled.status);
      setFailure(null);
    } catch (error) {
      const offline = !navigator.onLine || (error instanceof Error && error.message === "offline");
      setFailure(offline ? "network" : "server");
      setErrorMessage(
        offline
          ? "Titik GPS aman di perangkat. Sambungkan internet lalu tekan Selesai lagi."
          : "Sinkronisasi atau penyelesaian gagal. Data lokal tetap aman untuk dicoba kembali."
      );
      setStatus(offline ? "offline" : "recording");
    }
  }, [finishActivity, flushBucket, flushQueue, refreshQueueCount]);

  const retrySync = useCallback(async () => {
    const activityId = activityIdRef.current;

    if (!activityId || !navigator.onLine) {
      return;
    }

    setErrorMessage(null);

    try {
      await flushQueue(activityId, true);
      setStatus("recording");
    } catch {
      setFailure("server");
      setErrorMessage("Sinkronisasi GPS masih gagal. Sistem akan mencoba kembali.");
    }
  }, [flushQueue]);

  useEffect(() => {
    const connectionSyncTimeout = window.setTimeout(() => {
      setIsOnline(navigator.onLine);
    }, 0);

    const batchInterval = window.setInterval(() => {
      const activityId = activityIdRef.current;

      if (activityId && navigator.onLine) {
        void flushQueue(activityId).catch((error) => {
          const networkFailure = isAxiosError(error) && !error.response;
          setFailure(networkFailure ? "network" : "server");
          setErrorMessage(
            networkFailure
              ? "Titik GPS aman di perangkat. Sinkronisasi menunggu koneksi stabil."
              : "Sinkronisasi GPS tertunda. Sistem akan mencoba kembali otomatis."
          );
        });
      }
    }, GPS_BATCH_INTERVAL_MS);
    const mapInterval = window.setInterval(() => {
      const pending = pendingDisplayPointsRef.current.splice(0);

      if (pending.length > 0) {
        setLivePoints((current) => compactDisplayPoints(current, pending));
        setRecordedPointCount((current) => current + pending.length);
      }
    }, GPS_MAP_RENDER_INTERVAL_MS);
    const elapsedInterval = window.setInterval(() => {
      if (startTimeRef.current !== null) {
        setElapsedSeconds(
          Math.max(0, Math.floor((Date.now() - startTimeRef.current) / 1000))
        );
      }
    }, 1000);
    const handleOnline = () => {
      setIsOnline(true);
      const activityId = activityIdRef.current;

      if (activityId) {
        setStatus("recording");
        void flushQueue(activityId, true).catch((error) => {
          const networkFailure = isAxiosError(error) && !error.response;
          setFailure(networkFailure ? "network" : "server");
          setErrorMessage(
            networkFailure
              ? "Titik GPS aman di perangkat. Sinkronisasi menunggu koneksi stabil."
              : "Sinkronisasi GPS tertunda. Sistem akan mencoba kembali otomatis."
          );
        });
      }
    };
    const handleOffline = () => {
      setIsOnline(false);

      if (activityIdRef.current) {
        setStatus("offline");
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.clearTimeout(connectionSyncTimeout);
      window.clearInterval(batchInterval);
      window.clearInterval(mapInterval);
      window.clearInterval(elapsedInterval);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [flushQueue]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;

      if (watcherIdRef.current !== null && "geolocation" in navigator) {
        navigator.geolocation.clearWatch(watcherIdRef.current);
      }
    };
  }, []);

  return {
    status,
    failure,
    errorMessage,
    activity,
    livePoints,
    queuedPointCount,
    recordedPointCount,
    elapsedSeconds,
    isOnline,
    start,
    finish,
    retrySync,
  };
}
