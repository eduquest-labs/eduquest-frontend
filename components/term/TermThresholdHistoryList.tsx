"use client";

import { Skeleton } from "@heroui/react";

import { useTermThresholdHistory } from "@/hooks/queries";

const FORMATTER = new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" });

export interface TermThresholdHistoryListProps {
  termId: number;
}

export function TermThresholdHistoryList({ termId }: TermThresholdHistoryListProps) {
  const history = useTermThresholdHistory(termId, true);

  if (history.isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2].map((item) => <Skeleton key={item} className="h-8 w-full rounded" />)}
      </div>
    );
  }
  if (history.isError) return <p className="text-sm text-danger">Riwayat threshold gagal dimuat.</p>;
  if (!history.data?.length) return <p className="text-sm text-slate-500">Belum ada riwayat perubahan.</p>;

  return (
    <ul className="flex flex-col gap-2 text-sm">
      {history.data.map((entry, index) => (
        <li key={index} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-white/10">
          <span>
            {entry.oldThreshold === null ? "Dibuat" : `${entry.oldThreshold}%`} → <strong>{entry.newThreshold}%</strong>
          </span>
          <span className="text-xs text-slate-500">{FORMATTER.format(new Date(entry.createdAt))}</span>
        </li>
      ))}
    </ul>
  );
}
