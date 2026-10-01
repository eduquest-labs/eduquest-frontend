import type { ReactNode, CSSProperties } from "react";
import { Skeleton } from "@heroui/react";
import { Search } from "lucide-react";
import { formatResearchNumber } from "@/lib/superadmin/research-summary";
import styles from "./ResearchUI.module.css";

export { styles as researchStyles };

export function ResearchPage({ children }: { children: ReactNode }) {
  return <div className={styles.page}>{children}</div>;
}

export function ResearchHeader({ section, title, description, actions }: { section: string; title: string; description: string; actions?: ReactNode }) {
  return <header className={styles.header}>
    <div><p className={styles.eyebrow}>GerakGamify <span>/</span> Riset UPI <span>/</span> {section}</p>
      <h1>{title}</h1><p className={styles.description}>{description}</p></div>
    {actions ? <div className={styles.actions}>{actions}</div> : null}
  </header>;
}

export function ResearchMetrics({ children }: { children: ReactNode }) {
  return <dl className={styles.metrics}>{children}</dl>;
}

export function ResearchMetric({ label, value, note, loading = false, index = 0 }: { label: string; value: number | null; note: string; loading?: boolean; index?: number }) {
  return <div className={styles.metric} style={{ "--reveal-order": index } as CSSProperties}>
    <dt>{label}</dt><dd>{loading ? <Skeleton className="h-10 w-20 rounded" /> : formatResearchNumber(value)}</dd>
    <p>{note}</p>
  </div>;
}

export function ResearchPanel({ title, description, children, aside }: { title: string; description?: string; children: ReactNode; aside?: ReactNode }) {
  return <section className={styles.panel}>
    <div className={styles.panelHeader}><div><h2>{title}</h2>{description ? <p>{description}</p> : null}</div>{aside}</div>
    {children}
  </section>;
}

export function ResearchSearch({ value, onChange, label, placeholder }: { value: string; onChange: (value: string) => void; label: string; placeholder: string }) {
  return <label className={styles.search}><Search size={17} aria-hidden="true" />
    <span className="sr-only">{label}</span><input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
  </label>;
}

export function AssessmentProgress({ finalCount, lockedCount, label = "Kelengkapan penilaian" }: { finalCount: number; lockedCount: number; label?: string }) {
  const percent = lockedCount > 0 ? Math.min(100, finalCount / lockedCount * 100) : 0;
  return <div className={styles.progress} role="progressbar" aria-label={label} aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-valuetext={lockedCount === 0 ? "Belum ada data" : `${formatResearchNumber(percent)}%`}>
    <span style={{ transform: `scaleX(${percent / 100})` }} />
  </div>;
}

export function ResearchEmpty({ title, description }: { title: string; description: string }) {
  return <div className={styles.empty}><h3>{title}</h3><p>{description}</p></div>;
}
