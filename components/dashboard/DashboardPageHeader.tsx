"use client";

import { motion } from "framer-motion";

import { dashboardItemVariants } from "./dashboard.motion";

type DashboardPageHeaderProps = {
  lecturerName?: string | null;
};

export function DashboardPageHeader({
  lecturerName,
}: DashboardPageHeaderProps) {
  return (
    <motion.header
      initial="hidden"
      animate="visible"
      variants={dashboardItemVariants}
      className="flex min-w-0 flex-col gap-1"
    >
      <h1 className="truncate text-2xl font-semibold text-slate-900 dark:text-white">
        Halo, {lecturerName ?? "Dosen"}
      </h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Kelola kelas dan pantau progres siswa Anda dari sini.
      </p>
    </motion.header>
  );
}
