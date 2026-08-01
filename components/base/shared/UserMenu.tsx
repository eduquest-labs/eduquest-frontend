"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button, Dropdown, Label } from "@heroui/react";

import { useLogout } from "@/hooks/mutations";

export interface UserMenuLink {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
}

export interface UserMenuProps {
  links?: UserMenuLink[];
}

function getInitials(name?: string | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "?";
}

export function UserMenu({ links = [] }: UserMenuProps) {
  const { data: session } = useSession();
  const logout = useLogout();

  return (
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
          {links.map(({ href, label, icon: Icon }) => (
            <Dropdown.Item key={href} id={href} textValue={label}>
              <Link href={href} className="flex items-center gap-2">
                <Icon size={16} />
                <Label>{label}</Label>
              </Link>
            </Dropdown.Item>
          ))}
          <Dropdown.Item id="logout" textValue="Keluar" variant="danger">
            <span className="flex items-center gap-2">
              <LogOut size={16} />
              <Label>Keluar</Label>
            </span>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}
