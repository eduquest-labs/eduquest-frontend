"use client";

import {
  Alert,
  Button,
  Label,
  ProgressBar,
  Skeleton,
} from "@heroui/react";

import type { StudentProgress } from "@/types";

type ProgressTrackerProps = {
  data: StudentProgress | undefined;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
};

export function ProgressTracker({
  data,
  isLoading,
  isError,
  onRetry,
}: ProgressTrackerProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-white/5">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
        Progress challenge
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Progress dihitung dari challenge published pada scope terpilih.
      </p>

      {isLoading ? (
        <div className="mt-5 space-y-3">
          <Skeleton className="h-4 w-40 rounded" />
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
      ) : null}

      {isError ? (
        <Alert className="mt-5" status="danger">
          <Alert.Indicator />
          <Alert.Content>
            <Alert.Description>Progress gagal dimuat.</Alert.Description>
          </Alert.Content>
          <Button size="sm" variant="secondary" onPress={onRetry}>
            Coba lagi
          </Button>
        </Alert>
      ) : null}

      {!isLoading && !isError && data ? (
        <div className="mt-5">
          <ProgressBar
            aria-label={`Progress challenge ${data.percentage}%`}
            color={data.percentage >= 100 ? "success" : "accent"}
            value={data.percentage}
          >
            <Label>
              {data.topic?.name ?? data.classInfo.name}
            </Label>
            <ProgressBar.Output />
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
            {data.completedChallenges} dari {data.totalChallenges} challenge
            selesai
          </p>
        </div>
      ) : null}
    </section>
  );
}
