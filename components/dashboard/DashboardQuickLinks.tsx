"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, ClipboardCheck, School } from "lucide-react";
import Link from "next/link";

import {
  dashboardContainerVariants,
  dashboardItemVariants,
} from "./dashboard.motion";

const QUICK_LINKS = [
  {
    href: "/dosen/kelas",
    title: "Kelas Saya",
    description: "Kelola kelas dan impor siswa",
    icon: School,
  },
  {
    href: "/dosen/authoring",
    title: "Authoring",
    description: "Susun topic, challenge, dan soal",
    icon: BookOpen,
  },
  {
    href: "/dosen/grading",
    title: "Penilaian Esai",
    description: "Nilai jawaban esai yang sudah dikumpulkan",
    icon: ClipboardCheck,
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
        className="text-lg font-semibold text-slate-900 dark:text-white"
      >
        Akses cepat
      </motion.h2>
      <motion.div
        variants={dashboardContainerVariants}
        className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
      >
        {QUICK_LINKS.map((item) => (
          <motion.div
            key={item.href}
            variants={dashboardItemVariants}
            whileHover={{ y: -3, scale: 1.01 }}
            whileTap={{ scale: 0.985 }}
            className="min-w-0 sm:last:col-span-2 lg:last:col-span-1"
          >
            <Link
              href={item.href}
              className="group flex min-h-16 min-w-0 items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-[border-color,box-shadow] hover:border-teal-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 dark:border-white/10 dark:bg-white/5 dark:hover:border-teal-400/40 dark:focus-visible:ring-offset-slate-950"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-teal-50 group-hover:text-teal-700 dark:bg-white/10 dark:text-slate-200 dark:group-hover:bg-teal-400/10 dark:group-hover:text-teal-300">
                <item.icon aria-hidden="true" size={19} strokeWidth={2} />
              </span>
              <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {item.title}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  {item.description}
                </span>
              </span>
              <ArrowRight
                aria-hidden="true"
                size={16}
                className="shrink-0 text-slate-300 transition-[color,transform] group-hover:translate-x-1 group-hover:text-teal-600 motion-reduce:transform-none dark:text-slate-600 dark:group-hover:text-teal-300"
              />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}
