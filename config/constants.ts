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

// ============================================================
// DASHBOARD
// ============================================================
export const DASHBOARD_REFETCH_INTERVAL_MS = 60_000 as const;
export const DASHBOARD_MOTION_DURATION_SECONDS = 0.32 as const;
export const DASHBOARD_MOTION_STAGGER_SECONDS = 0.07 as const;
