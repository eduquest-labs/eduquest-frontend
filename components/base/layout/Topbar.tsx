"use client";

import { Menu } from "lucide-react";

import { Drawer } from "@heroui/react";

import { BrandLogo } from "@/components/brand/BrandLogo";
import { SidebarNav, type NavItem } from "@/components/base/layout/Sidebar";
import { UserMenu } from "@/components/base/shared/UserMenu";

export interface TopbarProps {
  navItems: NavItem[];
}

export function Topbar({ navItems }: TopbarProps) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border bg-surface px-4 py-3 lg:justify-end lg:px-6 dark:border-border dark:bg-background">
      <Drawer>
        <Drawer.Trigger
          aria-label="Buka menu navigasi"
          className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-ink-600 hover:bg-ink-100 dark:text-ink-300 dark:hover:bg-white/5 lg:hidden"
        >
          <Menu size={19} />
        </Drawer.Trigger>
        <Drawer.Backdrop>
          <Drawer.Content placement="left">
            <Drawer.Dialog className="w-64">
              {({ close }) => (
                <>
                  <Drawer.CloseTrigger />
                  <Drawer.Header>
                    <Drawer.Heading className="text-base font-bold">
                      <BrandLogo compact />
                    </Drawer.Heading>
                  </Drawer.Header>
                  <Drawer.Body>
                    <SidebarNav navItems={navItems} onNavigate={close} />
                  </Drawer.Body>
                </>
              )}
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      <UserMenu />
    </header>
  );
}
