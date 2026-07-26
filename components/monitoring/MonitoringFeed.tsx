import { Card, Chip, Skeleton } from "@heroui/react";
import { Activity, Clock3 } from "lucide-react";

import { formatTimeID } from "@/lib/utils";
import type { MonitoringActivity } from "@/types";

type MonitoringFeedProps = {
  activities: MonitoringActivity[];
  isLoading: boolean;
  isError: boolean;
};

const WIB_DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function MonitoringFeed({
  activities,
  isLoading,
  isError,
}: MonitoringFeedProps) {
  return (
    <Card className="min-w-0 items-stretch">
      <Card.Header>
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300">
            <Activity aria-hidden="true" size={18} />
          </span>
          <div>
            <Card.Title>Aktivitas siswa</Card.Title>
            <Card.Description>
              Attempt yang aktif atau baru dikumpulkan dalam 15 menit terakhir.
            </Card.Description>
          </div>
        </div>
      </Card.Header>
      <Card.Content>
        {isLoading ? (
          <div
            aria-label="Memuat aktivitas monitoring"
            className="flex flex-col gap-4"
          >
            {[1, 2, 3, 4].map((row) => (
              <div key={row} className="flex items-center gap-3">
                <Skeleton className="size-10 shrink-0 rounded-full" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-2/3 rounded" />
                  <Skeleton className="h-3 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {!isLoading && isError ? (
          <p className="py-10 text-center text-sm text-slate-500">
            Feed monitoring belum dapat dimuat.
          </p>
        ) : null}

        {!isLoading && !isError && activities.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Clock3 aria-hidden="true" className="text-slate-400" size={24} />
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
              Belum ada aktivitas live
            </p>
            <p className="max-w-sm text-xs text-slate-500">
              Siswa yang mulai mengerjakan atau baru mengumpulkan challenge
              akan muncul di sini.
            </p>
          </div>
        ) : null}

        {!isLoading && !isError && activities.length > 0 ? (
          <ul className="divide-y divide-slate-100 dark:divide-white/10">
            {activities.map((activity) => {
              const activityAt =
                activity.finishedAt ?? activity.startedAt;
              const isSubmitted = activity.status === "just_submitted";

              return (
                <li
                  key={activity.id}
                  className="flex min-w-0 flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="wrap-break-word text-sm font-semibold text-slate-900 dark:text-white">
                      {activity.studentName}
                    </p>
                    <p className="mt-0.5 wrap-break-word text-sm text-slate-600 dark:text-slate-300">
                      {activity.challengeTitle}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {activity.className} ·{" "}
                      {formatTimeID(WIB_DATE_FORMATTER, new Date(activityAt))} WIB
                    </p>
                    {isSubmitted && activity.totalScore !== null ? (
                      <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-300">
                        Skor {activity.totalScore.toLocaleString("id-ID")}
                      </p>
                    ) : null}
                  </div>
                  <Chip
                    className="self-start sm:self-auto"
                    color={isSubmitted ? "success" : "warning"}
                    size="sm"
                    variant="soft"
                  >
                    {isSubmitted ? "Baru submit" : "Sedang mengerjakan"}
                  </Chip>
                </li>
              );
            })}
          </ul>
        ) : null}
      </Card.Content>
    </Card>
  );
}
