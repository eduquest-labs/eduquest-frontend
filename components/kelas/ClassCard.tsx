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
      href={`/guru/kelas/${kelas.id}`}
      className="group flex min-w-0 flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-colors hover:border-ink-300 dark:border-border dark:bg-surface-secondary dark:hover:border-white/20"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="min-w-0 truncate text-sm font-semibold text-foreground">
          {kelas.name}
        </h3>
        <ChevronRight
          size={16}
          className="mt-0.5 shrink-0 text-ink-300 transition-transform group-hover:translate-x-0.5 dark:text-ink-600"
        />
      </div>

      <div className="flex items-center justify-between gap-2 rounded-lg bg-background px-3 py-2 dark:bg-surface-secondary">
        <span className="min-w-0 truncate font-mono text-sm font-medium tracking-wide text-muted">
          {kelas.classCode}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 cursor-pointer rounded p-1 text-ink-400 transition-colors hover:bg-ink-200 hover:text-ink-700 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Salin kode kelas"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-xs font-medium text-muted">
        <Users size={13} />
        {kelas.studentCount} siswa
      </div>
    </Link>
  );
}
