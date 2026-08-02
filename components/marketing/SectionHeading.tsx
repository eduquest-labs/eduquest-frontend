import clsx from "clsx";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  accent: string;
  align?: "left" | "center";
  inverse?: boolean;
};

export function SectionHeading({
  eyebrow,
  title,
  accent,
  align = "left",
  inverse = false,
}: SectionHeadingProps) {
  return (
    <div className={clsx("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow ? (
        <p
          className={clsx(
            "mb-4 text-xs font-bold tracking-[0.2em] uppercase",
            inverse ? "text-teal-100" : "text-teal-700 dark:text-teal-300",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={clsx(
          "font-display text-3xl leading-tight font-extrabold tracking-[-0.035em] sm:text-4xl lg:text-5xl",
          inverse ? "text-white" : "text-[#173f3d] dark:text-white",
        )}
      >
        {title}{" "}
        <span className="relative inline-block whitespace-nowrap">
          <span className="relative z-10">{accent}</span>
          <span
            aria-hidden="true"
            className="absolute right-0 bottom-0 left-0 h-2 -rotate-1 rounded-full bg-accent/85"
          />
        </span>
      </h2>
    </div>
  );
}
