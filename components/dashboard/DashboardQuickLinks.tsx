"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  School,
} from "lucide-react";
import Link from "next/link";

import {
  dashboardContainerVariants,
  dashboardItemVariants,
} from "./dashboard.motion";

const QUICK_LINKS = [
  {
    href: "/guru/kelas",
    title: "Kelas Saya",
    description: "Kelola kelas dan impor siswa",
    icon: School,
  },
  {
    href: "/guru/authoring",
    title: "Authoring",
    description: "Susun topic, challenge, dan soal",
    icon: BookOpen,
  },
  {
    href: "/guru/grading",
    title: "Penilaian Esai",
    description: "Nilai jawaban esai yang sudah dikumpulkan",
    icon: ClipboardCheck,
  },
  {
    href: "/guru/monitoring",
    title: "Monitoring Live",
    description: "Pantau pengerjaan dan submit siswa",
    icon: Activity,
  },
] as const;

export function DashboardQuickLinks() {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={dashboardContainerVariants}
      className="flex min-w-0 flex-col gap-3"
      aria-labelledby="quick-links-title"
    >
      <motion.h2
        variants={dashboardItemVariants}
        id="quick-links-title"
        className="text-lg font-semibold text-foreground"
      >
        Akses cepat
      </motion.h2>
      <motion.div
        variants={dashboardContainerVariants}
        className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
      >
        {QUICK_LINKS.map((item) => (
          <motion.div
            key={item.href}
            variants={dashboardItemVariants}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            className="min-w-0"
          >
            <Link
              href={item.href}
              className="group flex h-full min-h-16 min-w-0 items-center gap-4 rounded-xl border border-border bg-surface p-4 shadow-sm transition-[border-color,box-shadow] hover:border-brand-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 dark:border-border dark:bg-surface-secondary dark:hover:border-brand-400/40 dark:focus-visible:ring-offset-ink-950"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-ink-700 transition-colors group-hover:bg-primary-soft group-hover:text-brand-700 dark:bg-surface-secondary dark:text-ink-200 dark:group-hover:bg-brand-400/10 dark:group-hover:text-brand-300">
                <item.icon aria-hidden="true" size={19} strokeWidth={2} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold text-foreground">
                  {item.title}
                </span>
                <span className="text-sm text-muted">
                  {item.description}
                </span>
              </span>
              <ArrowRight
                aria-hidden="true"
                size={16}
                className="shrink-0 text-ink-300 transition-[color,transform] group-hover:translate-x-1 group-hover:text-brand-600 motion-reduce:transform-none dark:text-ink-600 dark:group-hover:text-brand-300"
              />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
