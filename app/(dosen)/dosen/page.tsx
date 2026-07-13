import Link from "next/link";
import { ArrowRight, BookOpen, School } from "lucide-react";

import { auth } from "@/auth";

export default async function DosenPage() {
  const session = await auth();

  return (
    <div className="flex flex-col gap-8 p-4 sm:p-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">
          Halo, {session?.user.name}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Kelola kelas dan pantau progres siswa Anda dari sini.
        </p>
      </div>

      <div className="grid max-w-3xl grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          { href: "/dosen/kelas", title: "Kelas Saya", description: "Kelola kelas dan impor siswa", icon: School },
          { href: "/dosen/authoring", title: "Authoring", description: "Susun topic, challenge, dan soal", icon: BookOpen },
        ].map((item) => (
          <Link key={item.href} href={item.href} className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"><item.icon size={19} strokeWidth={2} /></span>
            <div className="flex flex-1 flex-col gap-0.5"><span className="text-sm font-semibold text-slate-900 dark:text-white">{item.title}</span><span className="text-sm text-slate-500 dark:text-slate-400">{item.description}</span></div>
            <ArrowRight size={16} className="shrink-0 text-slate-300 transition-colors group-hover:text-slate-500 dark:text-slate-600" />
          </Link>
        ))}
      </div>
    </div>
  );
}
