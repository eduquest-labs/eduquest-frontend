"use client";

import type { ComponentType } from "react";
import {
  Award,
  Crown,
  Flame,
  Sparkles,
  Trophy,
} from "lucide-react";
import { Alert, Chip, Label, ProgressBar, Skeleton } from "@heroui/react";
import { MotionConfig, motion } from "framer-motion";

import { useMyBadges, useMyPoints } from "@/hooks/queries";
import type { BadgeCriteriaType, StudentBadge } from "@/types/points.types";

type BadgeVisual = {
  Icon: ComponentType<{ className?: string; size?: number; strokeWidth?: number }>;
  accent: string;
  glow: string;
  ring: string;
};

const badgeVisuals: Record<BadgeCriteriaType, BadgeVisual> = {
  total_points: {
    Icon: Trophy,
    accent: "bg-reward",
    glow: "bg-reward/10",
    ring: "ring-reward-border",
  },
  challenges_completed: {
    Icon: Flame,
    accent: "bg-reward",
    glow: "bg-reward/10",
    ring: "ring-reward-border",
  },
  manual: {
    Icon: Crown,
    accent: "bg-reward",
    glow: "bg-reward/10",
    ring: "ring-reward-border",
  },
};

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Jakarta",
});

function badgeDescription(studentBadge: StudentBadge) {
  if (studentBadge.badge.description) return studentBadge.badge.description;

  const value = studentBadge.badge.criteriaValue?.toLocaleString("id-ID");
  if (studentBadge.badge.criteriaType === "total_points" && value) {
    return `Berhasil mengumpulkan ${value} poin.`;
  }
  if (studentBadge.badge.criteriaType === "challenges_completed" && value) {
    return `Berhasil menyelesaikan ${value} challenge.`;
  }

  return "Penghargaan spesial dari gurumu.";
}

function BadgeMedallion({
  studentBadge,
  size = "featured",
}: {
  studentBadge: StudentBadge;
  size?: "featured" | "compact";
}) {
  const visual = badgeVisuals[studentBadge.badge.criteriaType];
  const Icon = visual.Icon;
  const isFeatured = size === "featured";

  return (
    <div
      className={`relative grid shrink-0 place-items-center ${
        isFeatured ? "size-28 sm:size-32" : "size-11"
      }`}
      aria-hidden="true"
    >
      {isFeatured ? (
        <motion.span
          className={`absolute inset-2 rounded-full blur-xl ${visual.glow}`}
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.45, 0.8, 0.45] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        />
      ) : null}
      <motion.span
        className={`absolute inset-0 rounded-[32%] ${visual.accent} shadow-lg ring-4 ${visual.ring}`}
        style={{ rotate: "45deg" }}
        whileHover={isFeatured ? { scale: 1.05, rotate: 52 } : undefined}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
      />
      <span
        className={`relative grid place-items-center rounded-full border border-white/70 bg-reward-soft/40 text-reward-foreground shadow-inner backdrop-blur-sm ${
          isFeatured ? "size-[68%]" : "size-[66%]"
        }`}
      >
        <Icon size={isFeatured ? 42 : 18} strokeWidth={isFeatured ? 1.8 : 2.2} />
      </span>
      {isFeatured ? (
        <>
          <motion.span
            className="absolute -right-1 top-2 text-reward-text drop-shadow-sm"
            animate={{ y: [0, -5, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <Sparkles size={23} fill="currentColor" />
          </motion.span>
          <motion.span
            className="absolute bottom-1 left-0 size-2.5 rounded-full bg-reward"
            animate={{ y: [0, 4, 0], opacity: [0.55, 1, 0.55] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </>
      ) : null}
    </div>
  );
}

export function StudentGamificationSummary() {
  const points = useMyPoints();
  const badges = useMyBadges();

  if (points.isLoading || badges.isLoading) {
    return (
      <section aria-label="Memuat ringkasan pencapaian" className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-72 rounded-3xl" />
        <Skeleton className="h-72 rounded-3xl" />
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
  const earnedBadges = [...badges.data].sort(
    (left, right) => Date.parse(right.awardedAt) - Date.parse(left.awardedAt)
  );
  const featuredBadge = earnedBadges[0];

  return (
    <MotionConfig reducedMotion="user">
      <motion.section
        aria-label="Ringkasan pencapaian siswa"
        className="grid gap-4 lg:grid-cols-2"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
      >
        <motion.article
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          className="relative flex min-h-72 flex-col gap-4 overflow-hidden rounded-3xl border border-border bg-surface p-5 shadow-sm sm:p-6"
        >
          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-primary-soft-foreground">
              <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-brand-600/20">
                <Trophy aria-hidden="true" size={18} />
              </span>
              <span className="text-sm font-semibold">Total poin</span>
            </div>
            <Chip color="success" size="sm" variant="soft">
              Level {points.data.level.level}
            </Chip>
          </div>

          <div className="relative flex items-end gap-2">
            <p className="font-display text-5xl font-bold tracking-tight text-foreground">
              {points.data.totalPoints.toLocaleString("id-ID")}
            </p>
            <span className="mb-1.5 text-sm font-medium text-muted">XP</span>
          </div>

          <div className="relative flex flex-wrap gap-1.5">
            {points.data.classes.map((classPoints) => (
              <Chip key={classPoints.id} size="sm" variant="soft">
                {classPoints.name}: {classPoints.totalPoints}
              </Chip>
            ))}
          </div>

          <div className="relative mt-auto grid gap-3">
            <ProgressBar
              aria-label={`Progres menuju level ${points.data.level.level + 1}`}
              value={points.data.level.progressPercentage}
              maxValue={100}
              color="success"
              size="sm"
            >
              <Label className="text-xs font-medium">
                Level {points.data.level.level + 1} · {points.data.level.pointsToNextLevel} poin lagi
              </Label>
              <ProgressBar.Output />
              <ProgressBar.Track className="bg-surface/70 dark:bg-surface-secondary">
                <ProgressBar.Fill />
              </ProgressBar.Track>
            </ProgressBar>
            {nextBadge?.criteriaValue ? (
              <ProgressBar
                aria-label={`Progres menuju badge ${nextBadge.name}`}
                value={Math.min(highestClassPoints, nextBadge.criteriaValue)}
                maxValue={nextBadge.criteriaValue}
                color="warning"
                size="sm"
              >
                <Label className="text-xs font-medium">Next drop · {nextBadge.name}</Label>
                <ProgressBar.Output />
                <ProgressBar.Track className="bg-surface/70 dark:bg-surface-secondary">
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
            ) : null}
          </div>
        </motion.article>

        <motion.article
          variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
          className="relative flex min-h-72 flex-col overflow-hidden rounded-3xl border border-reward-border bg-reward-soft p-5 shadow-sm sm:p-6"
        >

          <div className="relative flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-reward-text">
              <span className="grid size-9 place-items-center rounded-xl bg-reward text-reward-foreground">
                <Award aria-hidden="true" size={18} />
              </span>
              <div>
                <p className="text-sm font-semibold">Koleksi badge</p>
                <p className="text-xs text-muted">Achievement unlocked</p>
              </div>
            </div>
            <Chip color="accent" size="sm" variant="soft">
              {earnedBadges.length} terbuka
            </Chip>
          </div>

          {!featuredBadge ? (
            <div className="relative my-auto flex items-center gap-4 rounded-2xl border border-dashed border-reward-border bg-surface/50 p-4 dark:border-reward-border dark:bg-surface-secondary">
              <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-reward-soft text-reward-text">
                <Award aria-hidden="true" size={28} />
              </div>
              <div>
                <p className="font-semibold text-foreground">Badge pertamamu menunggu</p>
                <p className="mt-1 text-sm leading-5 text-muted">
                  Selesaikan challenge dan mulai isi koleksimu.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative mt-4 flex flex-1 flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
              <BadgeMedallion studentBadge={featuredBadge} />
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="mb-2 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                  <span className="rounded-full bg-ink-950 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white dark:bg-white dark:text-ink-950">
                    Newest unlock
                  </span>
                  <span className="text-xs font-medium text-reward-text">
                    {dateFormatter.format(new Date(featuredBadge.awardedAt))}
                  </span>
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">
                  {featuredBadge.badge.name}
                </h2>
                <p className="mt-1 text-sm leading-5 text-muted">
                  {badgeDescription(featuredBadge)}
                </p>

                {earnedBadges.length > 1 ? (
                  <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start" aria-label="Badge lain yang sudah terbuka">
                    {earnedBadges.slice(1, 5).map((studentBadge) => (
                      <div key={studentBadge.id} className="group flex items-center gap-3 rounded-2xl border border-white/80 bg-surface/65 py-2 pl-2 pr-4 shadow-sm backdrop-blur-sm dark:border-border dark:bg-surface-secondary">
                        <BadgeMedallion studentBadge={studentBadge} size="compact" />
                        <span className="max-w-24 truncate text-xs font-semibold text-muted">
                          {studentBadge.badge.name}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-surface/60 px-3 py-1.5 text-xs font-medium text-reward-text backdrop-blur-sm dark:bg-surface-secondary text-reward-text">
                    <Sparkles aria-hidden="true" size={14} /> Koleksi dimulai. Keep going!
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.article>
      </motion.section>
    </MotionConfig>
  );
}
