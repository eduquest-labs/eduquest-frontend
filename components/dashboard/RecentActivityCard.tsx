import { Card, Chip, Skeleton } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import { Activity, Clock3 } from "lucide-react";

import { formatTimeID } from "@/lib/utils";
import type { DashboardActivity } from "@/types";

import {
  dashboardContainerVariants,
  dashboardItemVariants,
  dashboardListItemVariants,
} from "./dashboard.motion";

type RecentActivityCardProps = {
  activities: DashboardActivity[];
  isLoading: boolean;
  isError: boolean;
  scopeKey: string;
};

const WIB_DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

export function RecentActivityCard({
  activities,
  isLoading,
  isError,
  scopeKey,
}: RecentActivityCardProps) {
  return (
    <motion.div variants={dashboardItemVariants} className="min-w-0">
      <Card className="min-w-0 items-stretch">
        <Card.Header>
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary-soft-foreground">
              <Activity aria-hidden="true" size={18} />
            </span>
            <div>
              <Card.Title>Aktivitas terbaru</Card.Title>
              <Card.Description>
                Attempt siswa terbaru pada cakupan kelas terpilih.
              </Card.Description>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          {isLoading ? (
            <div
              aria-label="Memuat aktivitas terbaru"
              className="flex flex-col gap-4"
            >
              {[1, 2, 3].map((row) => (
                <div key={row} className="flex items-center gap-3">
                  <Skeleton className="size-9 shrink-0 rounded-full" />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <Skeleton className="h-4 w-2/3 rounded" />
                    <Skeleton className="h-3 w-1/2 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {!isLoading && isError ? (
            <p className="py-8 text-center text-sm text-muted">
              Aktivitas terbaru gagal dimuat.
            </p>
          ) : null}

          {!isLoading && !isError && activities.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <Clock3 aria-hidden="true" className="text-ink-400" size={22} />
              <p className="text-sm font-medium text-muted">
                Belum ada aktivitas siswa
              </p>
              <p className="text-xs text-muted">
                Attempt baru akan muncul di sini.
              </p>
            </div>
          ) : null}

          <AnimatePresence mode="wait" initial={false}>
            {!isLoading && !isError && activities.length > 0 ? (
              <motion.ul
                key={scopeKey}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0 }}
                variants={dashboardContainerVariants}
                className="divide-y divide-ink-100 dark:divide-border"
              >
                {activities.map((activity) => (
                  <motion.li
                    key={activity.id}
                    variants={dashboardListItemVariants}
                    className="flex min-w-0 flex-col gap-3 rounded-lg py-4 transition-colors first:pt-0 last:pb-0 hover:bg-background sm:flex-row sm:items-center sm:justify-between dark:hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {activity.studentName}
                      </p>
                      <p className="mt-0.5 truncate text-sm text-muted">
                        {activity.challengeTitle}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {activity.className} ·{" "}
                        {formatTimeID(
                          WIB_DATE_FORMATTER,
                          new Date(activity.startedAt)
                        )}{" "}
                        WIB
                      </p>
                    </div>
                    <Chip
                      className="self-start sm:self-auto"
                      color={activity.isLocked ? "success" : "warning"}
                      size="sm"
                      variant="soft"
                    >
                      {activity.isLocked
                        ? `Skor ${activity.totalScore?.toLocaleString("id-ID") ?? "—"}`
                        : "Berlangsung"}
                    </Chip>
                  </motion.li>
                ))}
              </motion.ul>
            ) : null}
          </AnimatePresence>
        </Card.Content>
      </Card>
    </motion.div>
  );
}
