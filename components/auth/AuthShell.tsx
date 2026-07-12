interface AuthShellProps {
  children: React.ReactNode;
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="relative flex flex-1 min-h-dvh items-center justify-center overflow-hidden px-6 py-12 bg-linear-to-br from-teal-50 via-white to-emerald-50 dark:from-[#031312] dark:via-[#08201d] dark:to-[#031312]">
      <div
        aria-hidden
        className="pointer-events-none absolute top-1/4 left-1/2 h-112 w-md -translate-x-2/3 rounded-full bg-teal-400/50 blur-3xl dark:bg-teal-400/25"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-1/4 left-1/2 h-112 w-md -translate-x-1/3 rounded-full bg-emerald-400/50 blur-3xl dark:bg-emerald-400/20"
      />

      <div className="relative flex w-full max-w-sm flex-col gap-8 rounded-3xl border border-(--glass-border) bg-(--glass-surface) p-8 shadow-[0_25px_50px_-12px_var(--glass-shadow)] backdrop-blur-2xl">
        {children}
      </div>
    </div>
  );
}
