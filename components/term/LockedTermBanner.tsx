import { Lock } from "lucide-react";

export interface LockedTermBannerProps {
  termName: string;
  previousTermName: string | null;
}

export function LockedTermBanner({ termName, previousTermName }: LockedTermBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-ink-300 bg-background p-5 dark:border-white/15 dark:bg-surface-secondary">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-ink-200 text-muted dark:bg-surface-secondary">
        <Lock size={18} />
      </span>
      <div>
        <p className="font-semibold text-muted">{termName} — Terkunci</p>
        <p className="text-sm text-muted">
          {previousTermName ? `Selesaikan ${previousTermName} terlebih dahulu.` : "Belum bisa diakses saat ini."}
        </p>
      </div>
    </div>
  );
}
