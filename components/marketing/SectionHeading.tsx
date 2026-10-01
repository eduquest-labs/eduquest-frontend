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
            inverse ? "text-ink-100" : "text-primary-soft-foreground",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={clsx(
          "font-display text-3xl leading-tight font-extrabold tracking-[-0.035em] sm:text-4xl lg:text-5xl",
          inverse ? "text-white" : "text-foreground dark:text-white",
        )}
      >
        {title}{" "}
        <span>{accent}</span>
      </h2>
    </div>
  );
}
