import type { Variants } from "framer-motion";

import {
  DASHBOARD_MOTION_DURATION_SECONDS,
  DASHBOARD_MOTION_STAGGER_SECONDS,
} from "@/config/constants";

export const dashboardContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: DASHBOARD_MOTION_STAGGER_SECONDS,
      staggerChildren: DASHBOARD_MOTION_STAGGER_SECONDS,
    },
  },
};

export const dashboardItemVariants: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: DASHBOARD_MOTION_DURATION_SECONDS,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export const dashboardListItemVariants: Variants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: DASHBOARD_MOTION_DURATION_SECONDS,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};
