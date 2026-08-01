export type PhysicalActivityStatus = "recording" | "completed" | "invalid";

export interface PhysicalActivityChallenge {
  id: number;
  title: string;
  type: "aktivitas_fisik";
}

export interface PhysicalActivity {
  id: number;
  challenge: PhysicalActivityChallenge;
  student: {
    name: string;
  };
  startTime: string | null;
  endTime: string | null;
  distanceMeters: number;
  durationSeconds: number;
  averageSpeedKmh: number | null;
  status: PhysicalActivityStatus;
  gpsPointsCount: number;
  acceptedPointsCount: number;
  createdAt: string;
}

export interface GpsPointInput {
  clientPointId: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  recordedAt: string;
}

export interface QueuedGpsPoint extends GpsPointInput {
  key: string;
  activityId: number;
  queuedAt: number;
}

export interface GpsPointAcknowledgement {
  acknowledgedClientPointIds: string[];
}

export interface PhysicalActivityRoutePoint {
  latitude: number;
  longitude: number;
  recordedAt: string;
  accuracyMeters?: number | null;
}

export interface PhysicalActivityRoute {
  points: PhysicalActivityRoutePoint[];
  totalPointCount: number;
  isSampled: boolean;
}

export type PhysicalActivityRecorderStatus =
  | "idle"
  | "requesting_permission"
  | "recording"
  | "offline"
  | "finishing"
  | "completed"
  | "invalid"
  | "error";

export type GeolocationFailure =
  | "unsupported"
  | "insecure_context"
  | "permission_denied"
  | "position_unavailable"
  | "timeout"
  | "network"
  | "server";
