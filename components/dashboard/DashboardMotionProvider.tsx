"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "framer-motion";

import { DASHBOARD_MOTION_DURATION_SECONDS } from "@/config/constants";

type DashboardMotionProviderProps = {
  children: ReactNode;
};

export function DashboardMotionProvider({
  children,
}: DashboardMotionProviderProps) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{
        duration: DASHBOARD_MOTION_DURATION_SECONDS,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </MotionConfig>
  );
}
