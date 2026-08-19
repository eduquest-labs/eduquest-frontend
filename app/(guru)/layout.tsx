import { auth } from "@/auth";
import { requireRole } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/base/layout/DashboardShell";
import { GURU_NAV_ITEMS } from "@/components/base/layout/Sidebar";

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  requireRole(session, "guru");

  return <DashboardShell navItems={GURU_NAV_ITEMS}>{children}</DashboardShell>;
}
