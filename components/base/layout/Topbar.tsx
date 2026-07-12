"use client";

import { useSession } from "next-auth/react";
import { LogOut, Menu } from "lucide-react";

import { Button, Dropdown, Drawer, Label } from "@heroui/react";

import { useLogout } from "@/hooks/mutations";
import { siteConfig } from "@/config/site.config";
import { SidebarNav } from "@/components/base/layout/Sidebar";

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function Topbar() {
  const { data: session } = useSession();
  const logout = useLogout();

  return (
    <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 py-3 lg:justify-end lg:px-6 dark:border-white/10 dark:bg-black">
      <Drawer>
        <Drawer.Trigger
          aria-label="Buka menu navigasi"
          className="flex size-9 cursor-pointer items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5 lg:hidden"
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
                      {siteConfig.name}
                    </Drawer.Heading>
                  </Drawer.Header>
                  <Drawer.Body>
                    <SidebarNav onNavigate={close} />
                  </Drawer.Body>
                </>
              )}
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>

      <Dropdown>
        <Button
          aria-label="Menu akun"
          variant="tertiary"
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-100 dark:hover:bg-white/5"
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white dark:bg-white dark:text-black">
            {getInitials(session?.user.name)}
          </span>
          <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:inline">
            {session?.user.name}
          </span>
        </Button>
        <Dropdown.Popover>
          <Dropdown.Menu
            onAction={(key) => {
              if (key === "logout") {
                logout.mutate();
              }
            }}
          >
            <Dropdown.Item id="logout" textValue="Keluar" variant="danger">
              <span className="flex items-center gap-2">
                <LogOut size={16} />
                <Label>Keluar</Label>
              </span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
    </header>
  );
}
