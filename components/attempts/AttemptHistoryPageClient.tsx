"use client";

import {
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Clock3,
  History,
  Hourglass,
  PlayCircle,
} from "lucide-react";
import { Alert, Button, Chip, Skeleton } from "@heroui/react";
import { MotionConfig, motion } from "framer-motion";

import { useAttemptHistory } from "@/hooks/queries";
import { formatTimeID } from "@/lib/utils";
import type { AttemptHistoryItem } from "@/types";

const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
});

type AttemptVisual = {
  label: string;
  chipColor: "success" | "warning" | "default";
  Icon: typeof CheckCircle2;
  accent: string;
  iconTone: string;
};

function attemptVisual(attempt: AttemptHistoryItem): AttemptVisual {
  if (!attempt.isLocked) {
    return {
      label: "Belum selesai",
      chipColor: "default",
      Icon: PlayCircle,
      accent: "bg-slate-300 dark:bg-slate-600",
      iconTone: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
    };
  }

  if (attempt.gradingStatus === "pending") {
    return {
      label: "Menunggu penilaian",
      chipColor: "warning",
      Icon: Hourglass,
      accent: "bg-amber-400",
      iconTone: "bg-amber-100 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300",
    };
  }

  return {
    label: "Selesai",
    chipColor: "success",
    Icon: CheckCircle2,
    accent: "bg-teal-500",
    iconTone: "bg-teal-100 text-teal-700 dark:bg-teal-400/10 dark:text-teal-300",
  };
}

function formatDate(value: string | null): string {
  return value ? formatTimeID(DATE_FORMATTER, new Date(value)) : "Belum selesai";
}

export function AttemptHistoryPageClient() {
  const history = useAttemptHistory();
  const attempts = history.data?.pages.flatMap((page) => page.data) ?? [];

  return (
    <MotionConfig reducedMotion="user">
      <div className="flex w-full flex-col gap-6">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">
            Riwayat Aktivitas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Semua pengerjaan challenge tersimpan di sini sebagai catatan read-only.
          </p>
        </div>

        {history.isLoading ? (
          <div className="flex flex-col gap-3" aria-label="Memuat riwayat aktivitas">
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} className="h-32 w-full rounded-3xl" />
            ))}
          </div>
        ) : null}

        {history.isError ? (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>Riwayat aktivitas gagal dimuat.</Alert.Description>
            </Alert.Content>
            <Button size="sm" variant="secondary" onPress={() => history.refetch()}>
              Coba lagi
            </Button>
          </Alert>
        ) : null}

        {!history.isLoading && !history.isError && attempts.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center dark:border-white/15 dark:bg-white/5">
            <span className="grid size-14 place-items-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/10">
              <History aria-hidden="true" size={26} />
            </span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Belum ada aktivitas</p>
              <p className="mt-1 text-sm text-slate-500">
                Attempt akan muncul setelah kamu membuka challenge.
              </p>
            </div>
          </div>
        ) : null}

        {attempts.length > 0 ? (
          <motion.ol
            className="flex flex-col gap-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {attempts.map((attempt) => {
              const visual = attemptVisual(attempt);
              const { Icon } = visual;

              return (
                <motion.li
                  key={attempt.id}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition-[border-color,box-shadow] hover:border-teal-300 hover:shadow-md dark:border-white/10 dark:bg-white/5 dark:hover:border-teal-400/40"
                >
                  <span
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 w-1.5 ${visual.accent}`}
                  />
                  <div className="flex flex-col gap-4 p-5 pl-6 sm:p-6 sm:pl-7">
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex min-w-0 items-start gap-3">
                        <span
                          className={`mt-0.5 grid size-10 shrink-0 place-items-center rounded-2xl ${visual.iconTone}`}
                        >
                          <Icon aria-hidden="true" size={19} />
                        </span>
                        <div className="min-w-0">
                          <h2 className="wrap-break-word font-semibold text-slate-950 dark:text-white">
                            {attempt.challenge.title}
                          </h2>
                          <p className="mt-0.5 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-sm text-slate-500">
                            <ClipboardList aria-hidden="true" size={13} />
                            <span className="wrap-break-word">
                              {attempt.class.name} · {attempt.topic.name}
                            </span>
                          </p>
                        </div>
                      </div>
                      <Chip
                        className="shrink-0 self-start"
                        size="sm"
                        color={visual.chipColor}
                        variant="soft"
                      >
                        {visual.label}
                      </Chip>
                    </div>

                    <dl className="grid gap-3 border-t border-slate-100 pt-4 text-sm sm:grid-cols-3 dark:border-white/10">
                      <div className="min-w-0">
                        <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                          <PlayCircle aria-hidden="true" size={12} /> Mulai
                        </dt>
                        <dd className="mt-1 wrap-break-word tabular-nums text-slate-700 dark:text-slate-200">
                          {formatDate(attempt.startedAt)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
                          <Clock3 aria-hidden="true" size={12} /> Selesai
                        </dt>
                        <dd className="mt-1 wrap-break-word tabular-nums text-slate-700 dark:text-slate-200">
                          {formatDate(attempt.finishedAt)}
                        </dd>
                      </div>
                      <div className="min-w-0 sm:text-right">
                        <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400 sm:justify-end">
                          Skor
                        </dt>
                        <dd className="mt-1">
                          {attempt.totalScore === null ? (
                            <span className="text-slate-500">Belum tersedia</span>
                          ) : (
                            <span className="font-display text-xl font-bold tabular-nums text-slate-950 dark:text-white">
                              {attempt.totalScore.toLocaleString("id-ID")}
                              <span className="ml-1 text-xs font-medium text-slate-500">poin</span>
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </motion.li>
              );
            })}
          </motion.ol>
        ) : null}

        {history.hasNextPage ? (
          <Button
            className="min-h-11 self-center"
            variant="secondary"
            isPending={history.isFetchingNextPage}
            isDisabled={history.isFetchingNextPage}
            onPress={() => history.fetchNextPage()}
          >
            <CalendarClock size={16} /> Muat lebih banyak
          </Button>
        ) : null}
      </div>
    </MotionConfig>
  );
}
