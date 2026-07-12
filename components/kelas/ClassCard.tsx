"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Copy, Users } from "lucide-react";

import type { KelasClass } from "@/types";

export interface ClassCardProps {
  kelas: KelasClass;
}

export function ClassCard({ kelas }: ClassCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy(event: React.MouseEvent) {
    event.preventDefault();
    await navigator.clipboard.writeText(kelas.classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Link
      href={`/dosen/kelas/${kelas.id}`}
      className="group flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-semibold text-slate-900 dark:text-white">
          {kelas.name}
        </h3>
        <ChevronRight
          size={16}
          className="mt-0.5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 dark:text-slate-600"
        />
      </div>

      <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 dark:bg-white/5">
        <span className="min-w-0 truncate font-mono text-sm font-medium tracking-wide text-slate-600 dark:text-slate-300">
          {kelas.classCode}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 cursor-pointer rounded p-1 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Salin kode kelas"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400">
        <Users size={13} />
        {kelas.studentCount} siswa
      </div>
    </Link>
  );
}
