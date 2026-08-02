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
        "flex min-w-28 flex-col rounded-2xl border px-4 py-3 shadow-[0_14px_35px_rgba(23,63,61,0.12)] backdrop-blur-sm",
        inverse
          ? "border-white/15 bg-[#173f3d]/95 text-white"
          : "border-white/80 bg-white/95 text-[#173f3d] dark:border-white/10 dark:bg-neutral-900/95 dark:text-white",
        className,
      )}
    >
      <span className="font-display text-2xl leading-none font-extrabold tracking-tight">
        {value}
      </span>
      <span
        className={clsx(
          "mt-1 text-[0.68rem] leading-tight font-semibold tracking-wide uppercase",
          inverse ? "text-teal-100" : "text-teal-800/70 dark:text-teal-100/70",
        )}
      >
        {label}
      </span>
    </div>
  );
}
