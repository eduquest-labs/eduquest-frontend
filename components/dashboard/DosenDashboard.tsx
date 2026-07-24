"use client";

import { useState } from "react";
import {
  Alert,
  Button,
  Label,
  ListBox,
  Select,
  Skeleton,
} from "@heroui/react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ListChecks, Target, UsersRound } from "lucide-react";

import { useClasses, useDashboard } from "@/hooks/queries";

import { DashboardStatCard } from "./DashboardStatCard";
import { RecentActivityCard } from "./RecentActivityCard";
import {
  dashboardContainerVariants,
  dashboardItemVariants,
} from "./dashboard.motion";

export function DosenDashboard() {
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const classes = useClasses();
  const dashboard = useDashboard(selectedClassId);
  const numberFormatter = new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  });
  const selectedClassName =
    classes.data?.find((classItem) => classItem.id === selectedClassId)?.name ??
    "Semua kelas";
  const isRefreshing = dashboard.isFetching && !dashboard.isLoading;
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={dashboardContainerVariants}
      className="flex min-w-0 flex-col gap-4"
      aria-labelledby="dashboard-title"
    >
      <motion.div
        variants={dashboardItemVariants}
        className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h2
            id="dashboard-title"
            className="text-lg font-semibold text-slate-900 dark:text-white"
          >
            Ringkasan kelas
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Snapshot diperbarui otomatis setiap 60 detik.
          </p>
        </div>

        {classes.isLoading ? (
          <Skeleton
            aria-label="Memuat filter kelas"
            className="h-14 w-full rounded-xl sm:w-56"
          />
        ) : (
          <Select
            aria-label="Filter dashboard berdasarkan kelas"
            className="w-full sm:w-56"
            isDisabled={classes.isError}
            value={selectedClassId ?? "all"}
            variant="secondary"
            onChange={(key) =>
              setSelectedClassId(
                key === null || key === "all" ? null : Number(key)
              )
            }
          >
            <Label>Kelas/sekolah</Label>
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                <ListBox.Item id="all" textValue="Semua kelas">
                  Semua kelas
                  <ListBox.ItemIndicator />
                </ListBox.Item>
                {(classes.data ?? []).map((classItem) => (
                  <ListBox.Item
                    key={classItem.id}
                    id={classItem.id}
                    textValue={classItem.name}
                  >
                    {classItem.name}
                    <ListBox.ItemIndicator />
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        )}
      </motion.div>

      <motion.div
        variants={dashboardItemVariants}
        className="flex min-h-7 flex-wrap items-center gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/10 dark:text-slate-300">
          <span className="size-1.5 shrink-0 rounded-full bg-teal-500" />
          <span className="truncate">Menampilkan {selectedClassName}</span>
        </span>
        <AnimatePresence>
          {isRefreshing ? (
            <motion.span
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="inline-flex items-center gap-2 text-xs text-slate-500"
            >
              <motion.span
                aria-hidden="true"
                animate={
                  shouldReduceMotion
                    ? undefined
                    : { scale: [1, 1.35, 1], opacity: [0.5, 1, 0.5] }
                }
                transition={
                  shouldReduceMotion
                    ? undefined
                    : { duration: 1.2, repeat: Infinity }
                }
                className="size-1.5 rounded-full bg-teal-500"
              />
              Memperbarui data…
            </motion.span>
          ) : null}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence initial={false}>
        {classes.isError ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert status="warning">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  Daftar kelas gagal dimuat. Ringkasan seluruh kelas tetap
                  tersedia.
                </Alert.Description>
              </Alert.Content>
              <Button
                size="sm"
                variant="secondary"
                onPress={() => classes.refetch()}
              >
                Coba lagi
              </Button>
            </Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {dashboard.isError ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Alert status="danger">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Description>
                  Ringkasan dashboard gagal dimuat.
                </Alert.Description>
              </Alert.Content>
              <Button
                size="sm"
                variant="secondary"
                onPress={() => dashboard.refetch()}
              >
                Coba lagi
              </Button>
            </Alert>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <motion.div
        variants={dashboardContainerVariants}
        className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <DashboardStatCard
          label="Siswa aktif"
          value={numberFormatter.format(dashboard.data?.totalStudents ?? 0)}
          description="Siswa unik dengan membership aktif."
          icon={UsersRound}
          isLoading={dashboard.isLoading}
          isError={dashboard.isError}
        />
        <DashboardStatCard
          label="Challenge berjalan"
          value={numberFormatter.format(dashboard.data?.activeChallenges ?? 0)}
          description="Challenge aktif berdasarkan waktu WIB."
          icon={Target}
          isLoading={dashboard.isLoading}
          isError={dashboard.isError}
        />
        <DashboardStatCard
          label="Rata-rata skor"
          value={numberFormatter.format(dashboard.data?.averageScore ?? 0)}
          description="Rata-rata dari attempt yang sudah terkunci."
          icon={ListChecks}
          isLoading={dashboard.isLoading}
          isError={dashboard.isError}
        />
      </motion.div>

      <RecentActivityCard
        activities={dashboard.data?.recentActivity ?? []}
        isLoading={dashboard.isLoading}
        isError={dashboard.isError}
        scopeKey={selectedClassId?.toString() ?? "all"}
      />
    </motion.section>
  );
}
