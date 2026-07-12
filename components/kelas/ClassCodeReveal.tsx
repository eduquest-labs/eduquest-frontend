"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export interface ClassCodeRevealProps {
  classCode: string;
}

export function ClassCodeReveal({ classCode }: ClassCodeRevealProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Kode Kelas</span>
      <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/10 dark:bg-white/5">
        <span className="font-mono text-lg font-semibold tracking-widest text-slate-900 dark:text-white">
          {classCode}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
          aria-label="Salin kode kelas"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
      </div>
    </div>
  );
}
