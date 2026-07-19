"use client";

import { Award, History, Trophy } from "lucide-react";

import { Alert, Button, Chip, Skeleton, toast } from "@heroui/react";

import {
  useAwardStudentBadge,
  useCreatePointAdjustment,
} from "@/hooks/mutations";
import { useBadges, useStudentPoints } from "@/hooks/queries";
import { PointAdjustmentForm } from "@/components/points-badges/PointAdjustmentForm";

type StudentPointsPanelProps = {
  classId: number;
  classStudentId: number;
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
});

export function StudentPointsPanel({
  classId,
  classStudentId,
}: StudentPointsPanelProps) {
  const points = useStudentPoints(classId, classStudentId);
  const badges = useBadges();
  const adjustment = useCreatePointAdjustment(classId, classStudentId);
  const awardBadge = useAwardStudentBadge(classId, classStudentId);

  if (points.isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (points.isError || !points.data) {
    return (
      <Alert status="danger">
        <Alert.Indicator />
        <Alert.Content>
          <Alert.Description>Data poin siswa gagal dimuat.</Alert.Description>
        </Alert.Content>
        <Button size="sm" variant="secondary" onPress={() => points.refetch()}>
          Coba lagi
        </Button>
      </Alert>
    );
  }

  const ownedBadgeIds = new Set(points.data.badges.map((item) => item.badge.id));

  return (
    <div className="flex flex-col gap-5">
      <section className="rounded-xl bg-teal-50 p-4 dark:bg-teal-400/10">
        <p className="text-sm text-teal-700 dark:text-teal-300">{points.data.student.name}</p>
        <p className="mt-1 text-3xl font-bold text-teal-900 dark:text-teal-100">
          {points.data.totalPoints.toLocaleString("id-ID")} poin
        </p>
        <p className="mt-1 text-xs text-teal-700/70 dark:text-teal-300/70">
          Sinkron terakhir {dateFormatter.format(new Date(points.data.lastSyncedAt))}
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Trophy size={16} className="text-amber-500" /> Badge dimiliki
        </h3>
        {points.data.badges.length === 0 ? (
          <p className="text-sm text-slate-500">Siswa belum memiliki badge.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {points.data.badges.map((studentBadge) => (
              <Chip
                key={studentBadge.id}
                color={studentBadge.awardSource === "automatic" ? "success" : "accent"}
                variant="soft"
              >
                {studentBadge.badge.name}
              </Chip>
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 dark:border-white/10">
        <h3 className="text-sm font-semibold">Koreksi poin manual</h3>
        <PointAdjustmentForm
          isPending={adjustment.isPending}
          onSubmit={async (input) => {
            await adjustment.mutateAsync(input);
            toast.success("Koreksi poin berhasil disimpan.");
          }}
        />
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <Award size={16} className="text-violet-500" /> Badge tersedia
        </h3>
        {badges.isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        ) : null}
        {badges.isError ? (
          <Alert status="danger">
            <Alert.Indicator />
            <Alert.Content>
              <Alert.Description>Katalog badge gagal dimuat.</Alert.Description>
            </Alert.Content>
          </Alert>
        ) : null}
        {badges.data?.length === 0 ? (
          <p className="text-sm text-slate-500">Katalog badge belum tersedia.</p>
        ) : null}
        {badges.data?.map((badge) => {
          const isOwned = ownedBadgeIds.has(badge.id);
          return (
            <div
              key={badge.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 p-3 sm:flex-row sm:items-center dark:border-white/10"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{badge.name}</p>
                <p className="text-xs text-slate-500">
                  {badge.description ?? "Tanpa deskripsi"}
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                isDisabled={isOwned || awardBadge.isPending}
                isPending={awardBadge.isPending && awardBadge.variables === badge.id}
                onPress={() =>
                  awardBadge.mutate(badge.id, {
                    onSuccess: () => toast.success(`${badge.name} berhasil diberikan.`),
                    onError: () => toast.danger(`Gagal memberikan ${badge.name}.`),
                  })
                }
              >
                {isOwned ? "Sudah dimiliki" : "Berikan"}
              </Button>
            </div>
          );
        })}
      </section>

      <section className="flex flex-col gap-3">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <History size={16} /> Riwayat koreksi
        </h3>
        {points.data.adjustments.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada koreksi poin.</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-200 dark:divide-white/10">
            {points.data.adjustments.map((item) => (
              <div key={item.id} className="flex items-start justify-between gap-4 py-3">
                <div>
                  <p className="text-sm">{item.reason}</p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {item.adjustedBy.name} · {dateFormatter.format(new Date(item.createdAt))}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-sm font-semibold ${
                    item.points >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {item.points >= 0 ? "+" : ""}
                  {item.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
