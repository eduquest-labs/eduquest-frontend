import type { Metadata } from "next";

import { buildTitle } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle("Dashboard Superadmin"),
};

export default function SuperadminDashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
        Dashboard superadmin segera hadir
      </h1>
      <p className="max-w-md text-sm text-slate-500 dark:text-slate-400">
        Manajemen sekolah, guru, dan analitik lintas sekolah akan tersedia di sini.
      </p>
    </div>
  );
}
