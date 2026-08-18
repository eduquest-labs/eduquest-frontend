import { LayoutDashboard, School, BookOpen, BarChart3, ClipboardCheck } from "lucide-react";

import { auth } from "@/auth";
import { requireRole } from "@/lib/auth/guards";
import { DashboardShell } from "@/components/base/layout/DashboardShell";
import type { NavItem } from "@/components/base/layout/Sidebar";

const GURU_NAV_ITEMS: NavItem[] = [
  { href: "/guru", label: "Dashboard", icon: LayoutDashboard },
  { href: "/guru/kelas", label: "Kelas", icon: School },
  { href: "/guru/authoring", label: "Authoring", icon: BookOpen },
  { href: "/guru/analytics", label: "Analitik", icon: BarChart3 },
  { href: "/guru/grading", label: "Penilaian Esai", icon: ClipboardCheck },
];

export default async function GuruLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  requireRole(session, "guru");

  return <DashboardShell navItems={GURU_NAV_ITEMS}>{children}</DashboardShell>;
}
