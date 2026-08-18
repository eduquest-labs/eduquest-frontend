"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { siteConfig } from "@/config/site.config";

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface SidebarNavProps {
  navItems: NavItem[];
  onNavigate?: () => void;
}

export function SidebarNav({ navItems, onNavigate }: SidebarNavProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const isActive =
          pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`));

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-teal-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/5"
            )}
          >
            <item.icon size={17} strokeWidth={2} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export interface SidebarProps {
  navItems: NavItem[];
}

export function Sidebar({ navItems }: SidebarProps) {
  return (
    <aside className="hidden w-64 shrink-0 flex-col gap-8 border-r border-slate-200 bg-white p-4 lg:flex dark:border-white/10 dark:bg-black">
      <span className="px-2 text-base font-bold tracking-tight text-slate-900 dark:text-white">
        {siteConfig.name}
      </span>
      <SidebarNav navItems={navItems} />
    </aside>
  );
}
