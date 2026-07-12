import { auth } from "@/auth";
import { requireRole } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/base/layout/DashboardShell";

export default async function DosenLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  requireRole(session, "dosen");

  return <DashboardShell>{children}</DashboardShell>;
}
