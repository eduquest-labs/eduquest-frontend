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
      className="group min-w-0"
    >
      <Card className="min-w-0 items-stretch rounded-2xl border border-border bg-surface shadow-none">
        <Card.Header className="flex-row items-center justify-between gap-3">
          <Card.Title className="text-sm font-medium text-muted">
            {label}
          </Card.Title>
          <span className="flex size-9 shrink-0 items-center justify-center text-muted">
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
                className="text-3xl font-semibold tracking-tight text-foreground"
              >
                {isError ? "—" : value}
              </motion.p>
            </AnimatePresence>
          )}
          <p className="mt-2 text-xs leading-5 text-muted">
            {isError ? "Data gagal dimuat." : description}
          </p>
        </Card.Content>
      </Card>
    </motion.div>
  );
}
