"use client";

import { Award, Trophy } from "lucide-react";

import { Alert, Chip, Label, ProgressBar, Skeleton } from "@heroui/react";

import { useMyBadges, useMyPoints } from "@/hooks/queries";

export function StudentGamificationSummary() {
  const points = useMyPoints();
  const badges = useMyBadges();

  if (points.isLoading || badges.isLoading) {
    return (
      <section className="grid gap-3 sm:grid-cols-2">
        <Skeleton className="h-36 rounded-2xl" />
        <Skeleton className="h-36 rounded-2xl" />
      </section>
    );
  }

  if (points.isError || badges.isError || !points.data || !badges.data) {
    return (
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>Ringkasan poin dan badge gagal dimuat.</Alert.Description>
        </Alert.Content>
      </Alert>
    );
  }

  const highestClassPoints = Math.max(
    0,
    ...points.data.classes.map((item) => item.totalPoints)
  );
  const nextBadge = points.data.nextBadge;

  return (
    <section className="grid gap-3 sm:grid-cols-2">
      <article className="flex flex-col gap-4 rounded-2xl border border-teal-200 bg-teal-50 p-5 dark:border-teal-400/20 dark:bg-teal-400/10">
        <div className="flex items-center gap-2 text-teal-700 dark:text-teal-300">
          <Trophy size={18} />
          <span className="text-sm font-medium">Total poin</span>
        </div>
        <p className="text-3xl font-bold text-teal-950 dark:text-teal-100">
          {points.data.totalPoints.toLocaleString("id-ID")}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {points.data.classes.map((classPoints) => (
            <Chip key={classPoints.id} size="sm" variant="soft">
              {classPoints.name}: {classPoints.totalPoints}
            </Chip>
          ))}
        </div>
        {nextBadge?.criteriaValue ? (
          <ProgressBar
            aria-label={`Progres menuju badge ${nextBadge.name}`}
            value={Math.min(highestClassPoints, nextBadge.criteriaValue)}
            maxValue={nextBadge.criteriaValue}
            color="success"
            size="sm"
          >
            <Label>Menuju {nextBadge.name}</Label>
            <ProgressBar.Output />
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
        ) : null}
      </article>

      <article className="flex flex-col gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 dark:border-amber-400/20 dark:bg-amber-400/10">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300">
          <Award size={18} />
          <span className="text-sm font-medium">Badge saya</span>
        </div>
        {badges.data.length === 0 ? (
          <p className="text-sm text-amber-800/70 dark:text-amber-200/70">
            Belum ada badge. Selesaikan challenge untuk mendapatkannya.
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {badges.data.map((studentBadge) => (
              <Chip key={studentBadge.id} color="warning" variant="soft">
                {studentBadge.badge.name}
              </Chip>
            ))}
          </div>
        )}
      </article>
    </section>
  );
}
