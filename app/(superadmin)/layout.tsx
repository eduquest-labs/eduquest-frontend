import { auth } from "@/auth";
import { requireRole } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/base/layout/DashboardShell";
import { SUPERADMIN_NAV_ITEMS } from "@/components/base/layout/Sidebar";

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  requireRole(session, "superadmin");

  return <DashboardShell navItems={SUPERADMIN_NAV_ITEMS}>{children}</DashboardShell>;
}
