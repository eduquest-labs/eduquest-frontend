import { Lock } from "lucide-react";

export interface LockedTermBannerProps {
  termName: string;
  previousTermName: string | null;
}

export function LockedTermBanner({ termName, previousTermName }: LockedTermBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 dark:border-white/15 dark:bg-white/3">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 dark:bg-white/10">
        <Lock size={18} />
      </span>
      <div>
        <p className="font-semibold text-slate-700 dark:text-slate-200">{termName} — Terkunci</p>
        <p className="text-sm text-slate-500">
          {previousTermName ? `Selesaikan ${previousTermName} terlebih dahulu.` : "Belum bisa diakses saat ini."}
        </p>
      </div>
    </div>
  );
}
