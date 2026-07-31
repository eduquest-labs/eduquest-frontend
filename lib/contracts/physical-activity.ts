export interface PhysicalActivityContract {
  id: number;
  challenge: {
    id: number;
    title: string;
    type: "aktivitas_fisik";
  };
  student: {
    anonymous_id: string;
  };
  start_time: string | null;
  end_time: string | null;
  distance_meters: string;
  duration_seconds: number;
  avg_speed_kmh: string | null;
  status: "recording" | "completed" | "invalid";
  gps_points_count: number;
  accepted_points_count: number;
  created_at: string;
}

export interface PhysicalActivityResponseContract {
  data: PhysicalActivityContract;
}

export interface GpsPointInputContract {
  client_point_id: string;
  latitude: number;
  longitude: number;
  accuracy_meters: number | null;
  recorded_at: string;
}

export interface GpsPointAcknowledgementContract {
  acknowledged_client_point_ids: string[];
}

export interface PhysicalActivityRouteContract {
  data: Array<{
    latitude: string;
    longitude: string;
    recorded_at: string;
  }>;
  total_point_count: number;
  is_sampled: boolean;
}
