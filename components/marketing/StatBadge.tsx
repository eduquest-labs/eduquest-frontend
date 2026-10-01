import clsx from "clsx";

type StatBadgeProps = {
  value: string;
  label: string;
  className?: string;
  inverse?: boolean;
};

export function StatBadge({
  value,
  label,
  className,
  inverse = false,
}: StatBadgeProps) {
  return (
    <div
      className={clsx(
        "flex min-w-28 flex-col rounded-2xl border px-4 py-3 shadow-[0_14px_35px_rgba(32,41,66,0.12)] backdrop-blur-sm",
        inverse
          ? "border-white/15 bg-brand-strong/95 text-white"
          : "border-white/80 bg-surface/95 text-foreground dark:border-border dark:bg-surface/95 dark:text-white",
        className,
      )}
    >
      <span className="font-display text-2xl leading-none font-extrabold tracking-tight">
        {value}
      </span>
      <span
        className={clsx(
          "mt-1 text-[0.68rem] leading-tight font-semibold tracking-wide uppercase",
          inverse ? "text-ink-100" : "text-ink-800/70 dark:text-ink-100/70",
        )}
      >
        {label}
      </span>
    </div>
  );
}
