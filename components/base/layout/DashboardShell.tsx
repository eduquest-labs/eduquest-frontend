import { Sidebar, type NavItem } from "@/components/base/layout/Sidebar";
import { Topbar } from "@/components/base/layout/Topbar";

export interface DashboardShellProps {
  navItems: NavItem[];
  children: React.ReactNode;
}

export function DashboardShell({ navItems, children }: DashboardShellProps) {
  return (
    <div className="flex min-h-dvh bg-slate-50 dark:bg-black">
      <Sidebar navItems={navItems} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar navItems={navItems} />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
