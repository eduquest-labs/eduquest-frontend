// ============================================================
// AUTH
// ============================================================
export const AUTH_TOKEN_STORAGE_KEY = "eduquest:auth:token" as const;

// ============================================================
// ATTEMPTS
// ============================================================
export const ESSAY_ATTACHMENT_ACCEPT = ".jpg,.jpeg,.png,.mp4,.mov" as const;
export const ESSAY_ATTACHMENT_MAX_MB = 20 as const;

// ============================================================
// LEADERBOARD
// ============================================================
export const LEADERBOARD_REFETCH_INTERVAL_MS = 15_000 as const;
export const LEADERBOARD_PAGE_SIZE = 10 as const;

// ============================================================
// DASHBOARD
// ============================================================
export const DASHBOARD_REFETCH_INTERVAL_MS = 60_000 as const;
export const DASHBOARD_MOTION_DURATION_SECONDS = 0.32 as const;
export const DASHBOARD_MOTION_STAGGER_SECONDS = 0.07 as const;

// ============================================================
// MONITORING
// ============================================================
export const MONITORING_REFETCH_INTERVAL_MS = 5_000 as const;

// ============================================================
// PHYSICAL ACTIVITY
// ============================================================
export const GPS_BATCH_INTERVAL_MS = 10_000 as const;
export const GPS_BATCH_SIZE = 100 as const;
export const GPS_QUEUE_TTL_MS = 24 * 60 * 60 * 1000;
export const GPS_MAP_RENDER_INTERVAL_MS = 5_000 as const;
export const GPS_MAX_DISPLAY_POINTS = 2_000 as const;
export const GPS_RETRY_MAX_DELAY_MS = 30_000 as const;
export const GPS_WATCH_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  maximumAge: 5_000,
  timeout: 15_000,
} as const;
