import { Sidebar, type NavItem } from "@/components/base/layout/Sidebar";
import { Topbar } from "@/components/base/layout/Topbar";

export interface DashboardShellProps {
  navItems: NavItem[];
  children: React.ReactNode;
}

export function DashboardShell({ navItems, children }: DashboardShellProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background dark:bg-background print:h-auto print:min-h-dvh print:overflow-visible">
      <Sidebar navItems={navItems} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar navItems={navItems} />
        <main className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto print:overflow-visible">{children}</main>
      </div>
    </div>
  );
}
