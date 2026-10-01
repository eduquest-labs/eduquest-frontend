import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BrandLogo } from "@/components/brand/BrandLogo";

import styles from "./AuthShell.module.css";

type AuthVariant = "login" | "register" | "claim";

interface AuthShellProps {
  children: React.ReactNode;
  variant: AuthVariant;
  title: string;
  description: string;
  footer: React.ReactNode;
}

const stories = {
  login: {
    title: "Langkah kecil,",
    emphasis: "penemuan besar.",
    description: "Lanjutkan petualanganmu. Ada hal baru untuk dipelajari, tantangan untuk dicoba, dan pencapaian untuk dirayakan.",
    note: "Belajar bukan sekadar sampai di tujuan. Nikmati setiap prosesnya.",
  },
  register: {
    title: "Hadirkan kelas",
    emphasis: "penuh cerita.",
    description: "Dampingi setiap langkah siswa lewat tantangan yang bermakna, aktivitas yang seru, dan progres yang mudah diikuti.",
    note: "Mulai dari satu kelas. Buka lebih banyak kesempatan untuk belajar.",
  },
  claim: {
    title: "Rasa ingin tahu,",
    emphasis: "bawa lebih jauh.",
    description: "Gabung ke kelasmu dan temukan cara belajar yang lebih aktif. Siapkan dirimu untuk mencoba, bergerak, dan bertumbuh.",
    note: "Setiap petualangan hebat dimulai dari keberanian untuk mencoba.",
  },
} satisfies Record<AuthVariant, Record<string, string>>;

export function AuthShell({ children, variant, title, description, footer }: AuthShellProps) {
  const story = stories[variant];

  return (
    <div className={styles.shell} data-auth-variant={variant}>
      <a href="#auth-form" className={styles.skipLink}>Langsung ke formulir</a>
      <header className={styles.header}>
        <Link href="/" aria-label="GerakGamify — beranda" className={styles.logoLink}>
          <BrandLogo />
        </Link>
        <Link href="/" className={styles.backLink} aria-label="Kembali ke beranda">
          <ArrowLeft size={15} aria-hidden="true" />
          <span>Kembali ke beranda</span>
        </Link>
      </header>
      <main className={styles.main}>
        <aside className={styles.story} aria-label="Tentang perjalanan belajar GerakGamify">
          <div>
            <h2 className={styles.storyTitle}>
              {variant === "login" ? <><span>Belajar.</span><span>Bergerak.</span><span>Bertumbuh.</span></> : <>{story.title}<span>{story.emphasis}</span></>}
            </h2>
            <p className={styles.storyDescription}>{story.description}</p>
          </div>
          <ol className={styles.journey} aria-label="Alur belajar di GerakGamify">
            {[
              { title: "Pelajari", description: "Pahami materinya" },
              { title: "Bergerak", description: "Kerjakan tantangannya" },
              { title: "Raih pencapaian", description: "Lihat progres belajarmu" },
            ].map((step, index) => (
              <li className={styles.journeyStep} key={step.title}>
                <div className={styles.stepArt} aria-hidden="true" />
                <span className={styles.stepNumber} aria-hidden="true">{index + 1}</span>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
              </li>
            ))}
          </ol>
          <div className={styles.storyFooter}>
            <p>{story.note}</p>
            <label className={styles.motionControl}>
              <input type="checkbox" aria-label="Jeda animasi ilustrasi" />
              <span>Jeda animasi</span>
            </label>
          </div>
        </aside>
        <section id="auth-form" aria-labelledby="auth-title" className={styles.formPanel}>
          <div className={styles.formContent}>
            <div className={styles.formHeading}>
              <h1 id="auth-title">{title}</h1>
              <p className={styles.formDescription}>{description}</p>
            </div>
            {children}
            <div className={styles.formFooter}>{footer}</div>
          </div>
        </section>
      </main>
      <footer className={styles.pageFooter}>
        <span>GerakGamify · Belajar. Bergerak. Bertumbuh.</span>
        <span className={styles.footerDetail}>Ruang belajar untuk langkah yang berarti.</span>
      </footer>
    </div>
  );
}
