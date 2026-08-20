import type { Metadata } from "next";

import { SuperadminDashboardPageClient } from "@/components/superadmin-dashboard";
import { buildTitle } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle("Dashboard Superadmin"),
};

export default function SuperadminDashboardPage() {
  return <SuperadminDashboardPageClient />;
}
