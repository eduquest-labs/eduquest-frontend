import styles from "./BrandLogo.module.css";

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

/** A running-track G and a forward-leaning wordmark, drawn without image assets. */
export function BrandLogo({ compact = false, className = "" }: BrandLogoProps) {
  return (
    <span className={`${styles.logo} ${compact ? styles.compact : ""} ${className}`} role="img" aria-label="GerakGamify">
      <svg className={styles.mark} viewBox="0 0 48 48" fill="none" aria-hidden="true">
        <path className={styles.tile} d="M15 2H34C41 2 46 7 46 14V33C46 41 41 46 33 46H2V15C2 7 7 2 15 2Z" />
        <path className={styles.track} d="M32.5 15.5A12 12 0 1 0 35.5 26H24" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        <path className={styles.arrow} d="M26 18H37V29M36 19L26 29" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path className={styles.speed} d="M6 38H14M6 32H10" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className={styles.wordmark} aria-hidden="true">
        <span className={styles.gerak}>Gerak</span><span className={styles.gamify}>Gamify<span className={styles.spark} /></span>
      </span>
    </span>
  );
}
