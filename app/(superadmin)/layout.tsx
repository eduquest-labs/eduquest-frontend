import { LayoutDashboard } from "lucide-react";

import { auth } from "@/auth";
import { requireRole } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/base/layout/DashboardShell";
import type { NavItem } from "@/components/base/layout/Sidebar";

const SUPERADMIN_NAV_ITEMS: NavItem[] = [
  { href: "/superadmin", label: "Dashboard", icon: LayoutDashboard },
];

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  requireRole(session, "superadmin");

  return <DashboardShell navItems={SUPERADMIN_NAV_ITEMS}>{children}</DashboardShell>;
}
