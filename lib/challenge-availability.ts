import type { ChallengeAvailability } from "@/types";

export const CHALLENGE_AVAILABILITY_LABELS: Record<ChallengeAvailability, string> = {
  draft: "Draft",
  scheduled: "Terjadwal",
  active: "Berlangsung",
  ended: "Selesai",
};

export const CHALLENGE_AVAILABILITY_CLASS_NAMES: Record<ChallengeAvailability, string> = {
  draft: "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
  scheduled: "bg-blue-100 text-blue-700 dark:bg-blue-400/10 dark:text-blue-300",
  active: "bg-teal-100 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300",
  ended: "bg-slate-200 text-slate-700 dark:bg-white/10 dark:text-slate-300",
};
