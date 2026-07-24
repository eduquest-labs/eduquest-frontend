import { Card, Skeleton } from "@heroui/react";
import { AnimatePresence, motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { dashboardItemVariants } from "./dashboard.motion";

type DashboardStatCardProps = {
  label: string;
  value: string;
  description: string;
  icon: LucideIcon;
  isLoading: boolean;
  isError: boolean;
};

export function DashboardStatCard({
  label,
  value,
  description,
  icon: Icon,
  isLoading,
  isError,
}: DashboardStatCardProps) {
  return (
    <motion.div
      variants={dashboardItemVariants}
      whileHover={{ y: -4, scale: 1.01 }}
      className="group min-w-0"
    >
      <Card className="min-w-0 items-stretch transition-[border-color,box-shadow] group-hover:border-teal-300 group-hover:shadow-lg dark:group-hover:border-teal-400/30">
        <Card.Header className="flex-row items-center justify-between gap-3">
          <Card.Title className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </Card.Title>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-teal-700 transition-colors group-hover:bg-teal-100 dark:bg-teal-400/10 dark:text-teal-300 dark:group-hover:bg-teal-400/20">
            <Icon aria-hidden="true" size={18} strokeWidth={2} />
          </span>
        </Card.Header>
        <Card.Content className="mt-2">
          {isLoading ? (
            <Skeleton
              aria-label={`Memuat ${label.toLowerCase()}`}
              className="h-9 w-24 rounded-lg"
            />
          ) : (
            <AnimatePresence mode="wait" initial={false}>
              <motion.p
                key={isError ? "error" : value}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-white"
              >
                {isError ? "—" : value}
              </motion.p>
            </AnimatePresence>
          )}
          <p className="mt-2 text-xs leading-5 text-slate-500 dark:text-slate-400">
            {isError ? "Data gagal dimuat." : description}
          </p>
        </Card.Content>
      </Card>
    </motion.div>
  );
}
