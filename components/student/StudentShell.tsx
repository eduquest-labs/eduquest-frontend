"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, History, LogOut, UserRound } from "lucide-react";
import { Alert } from "@heroui/react";

import { useLogout } from "@/hooks/mutations";
import { useMe } from "@/hooks/queries";
import { UserMenu } from "@/components/base/shared/UserMenu";

const navigation = [
  { href: "/siswa", label: "Dashboard", icon: BookOpen },
  { href: "/siswa/riwayat", label: "Riwayat", icon: History },
  { href: "/siswa/profil", label: "Profil", icon: UserRound },
];

const accountMenuLinks = [
  { href: "/siswa/profil", label: "Profil", icon: UserRound },
];

export function StudentShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const logout = useLogout();
  const me = useMe();

  return (
    <div className="min-h-dvh bg-slate-50 pb-20 dark:bg-black md:pb-0">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-white/10 dark:bg-black/90">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/siswa" className="font-bold tracking-tight text-teal-700 dark:text-teal-300">EduQuest Siswa</Link>
          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigasi siswa">
            {navigation
              .filter(({ href }) => href !== "/siswa/profil")
              .map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium ${pathname === href ? "bg-teal-50 text-teal-800 dark:bg-teal-400/10 dark:text-teal-200" : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"}`}><Icon size={16} />{label}</Link>)}
            <UserMenu links={accountMenuLinks} />
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 sm:p-8">
        {me.data?.email && !me.data.emailVerified ? <Alert status="warning"><Alert.Indicator /><Alert.Content><Alert.Description>Email belum terverifikasi. Kamu tetap bisa belajar; gunakan NISN untuk login atau verifikasi email dari halaman Profil.</Alert.Description></Alert.Content></Alert> : null}
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white px-2 pb-[env(safe-area-inset-bottom)] dark:border-white/10 dark:bg-black md:hidden" aria-label="Navigasi siswa seluler">
        {navigation.map(({ href, label, icon: Icon }) => <Link key={href} href={href} aria-current={pathname === href ? "page" : undefined} className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium ${pathname === href ? "text-teal-700 dark:text-teal-300" : "text-slate-500"}`}><Icon size={19} />{label}</Link>)}
        <button type="button" onClick={() => logout.mutate()} className="flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-medium text-slate-500"><LogOut size={19} />Keluar</button>
      </nav>
    </div>
  );
}
