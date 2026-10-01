import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { BrandLogo } from "@/components/brand/BrandLogo";
import * as motion from "framer-motion/client";
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  BookOpenCheck,
  Camera,
  Footprints,
  School,
  Trophy,
  Users,
} from "lucide-react";

import {
  SectionHeading,
  StatBadge,
  TestimonialCard,
} from "@/components/marketing";

const HERO_IMAGE =
  "https://images.pexels.com/photos/5472898/pexels-photo-5472898.jpeg?auto=compress&cs=tinysrgb&w=1600";
const CLASSROOM_IMAGE =
  "https://images.pexels.com/photos/5494260/pexels-photo-5494260.jpeg?auto=compress&cs=tinysrgb&w=1600";
const TEACHER_IMAGE =
  "https://images.pexels.com/photos/18506736/pexels-photo-18506736.jpeg?auto=compress&cs=tinysrgb&w=800";

const NAV_ITEMS = [
  { label: "Fitur", href: "#fitur" },
  { label: "Untuk Sekolah", href: "#sekolah" },
  { label: "Sumber Daya", href: "#sumber-daya" },
  { label: "Tentang Kami", href: "#tentang" },
] as const;

const VALUE_PROPS = [
  {
    icon: Footprints,
    title: "Tantangan fisik yang terarah",
    description:
      "Aktivitas bergerak hadir sebagai misi yang jelas, terukur, dan tetap terhubung dengan perjalanan belajar siswa.",
  },
  {
    icon: Trophy,
    title: "Gamifikasi menjaga semangat",
    description:
      "Poin, badge, dan leaderboard memberi umpan balik yang menyenangkan tanpa menyembunyikan progres belajar nyata.",
  },
  {
    icon: School,
    title: "Mudah dikelola untuk kelas",
    description:
      "Guru menyiapkan tantangan, memantau aktivitas, dan membaca perkembangan lintas sekolah dalam satu alur.",
  },
] as const;

const RESEARCH_STATS = [
  { value: "75–100", label: "target siswa" },
  { value: "5", label: "sekolah sasaran" },
  { value: "1", label: "peneliti" },
] as const;

const TESTIMONIALS = [
  {
    name: "Alya",
    role: "Siswa",
    quote:
      "Setiap tantangan terasa seperti langkah kecil yang membuat saya ingin terus maju.",
    avatarSrc:
      "https://images.pexels.com/photos/5472898/pexels-photo-5472898.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    name: "Raka",
    role: "Siswa",
    quote:
      "Saya bisa melihat progres sendiri dan belajar tanpa merasa sedang dikejar angka saja.",
    avatarSrc:
      "https://images.pexels.com/photos/8199138/pexels-photo-8199138.jpeg?auto=compress&cs=tinysrgb&w=200",
  },
  {
    name: "Bu Mira",
    role: "Guru",
    quote:
      "Aktivitas kelas lebih mudah diamati, sementara pengalaman siswa tetap terasa ringan dan suportif.",
    avatarSrc: TEACHER_IMAGE,
  },
] as const;

const RESOURCES = [
  {
    category: "Gamifikasi",
    title: "Merancang tantangan belajar yang membuat progres terasa nyata",
    image:
      "https://images.pexels.com/photos/5530515/pexels-photo-5530515.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Siswa belajar menggunakan komputer di ruang kelas",
  },
  {
    category: "Aktivitas Fisik",
    title: "Menghubungkan gerak, rasa ingin tahu, dan pengalaman belajar",
    image:
      "https://images.pexels.com/photos/8199138/pexels-photo-8199138.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Siswa Asia tersenyum saat belajar bersama di kelas",
  },
  {
    category: "Riset Kelas",
    title: "Membaca progres kelas dengan data yang lebih bermakna",
    image:
      "https://images.pexels.com/photos/18506736/pexels-photo-18506736.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Guru dan siswa berdiskusi di ruang kelas",
  },
] as const;

const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.18 },
  transition: { duration: 0.32, ease: "easeOut" as const },
};

export const metadata: Metadata = {
  title: "GerakGamify — Belajar Aktif, Progres Terlihat",
  description:
    "Platform gamifikasi pembelajaran untuk tantangan, progres siswa, dan riset kelas lintas sekolah.",
};

export default function MarketingPage() {
  const currentYear = new Date().getFullYear();

  return (
    <main className="min-h-screen overflow-x-clip bg-background text-foreground">
      <section className="bg-background-warm">
        <header className="relative z-30">
          <nav
            aria-label="Navigasi utama"
            className="mx-auto flex min-h-20 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12"
          >
            <Link
              className="font-display text-xl font-extrabold tracking-[-0.035em] text-foreground focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:text-white"
              href="/"
            >
              <BrandLogo />
            </Link>

            <div className="hidden items-center gap-7 text-sm font-semibold text-ink-950/70 lg:flex dark:text-ink-50/75">
              {NAV_ITEMS.map((item) => (
                <a
                  className="transition-colors duration-200 hover:text-ink-800 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:hover:text-white"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-strong px-5 text-sm font-bold text-white shadow-sm transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:bg-primary dark:text-primary-foreground"
              href="/login"
            >
              Masuk
            </Link>
          </nav>
        </header>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-10 pb-24 sm:px-8 sm:pt-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-12 lg:pt-20 lg:pb-32">
          <motion.div data-marketing-reveal {...reveal}>
            <h1 className="font-display max-w-3xl text-4xl leading-[1.12] font-bold tracking-[-0.035em] text-foreground sm:text-5xl lg:text-5xl">
              Tetap Semangat Belajar{" "}
              <span>Bersama GerakGamify</span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-ink-950/65 sm:text-lg dark:text-ink-50/70">
              Ubah soal, aktivitas fisik, dan progres kelas menjadi petualangan
              belajar yang ramah, terukur, dan membuat setiap langkah terasa
              berarti.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-full bg-primary px-7 text-sm font-extrabold text-primary-foreground shadow-sm transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
                href="/claim"
              >
                Aktivasi Akun
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <a
                className="inline-flex min-h-11 w-fit items-center text-sm font-bold text-ink-900 underline decoration-reward decoration-2 underline-offset-4 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:text-ink-100"
                href="#fitur"
              >
                Lihat cara kerjanya
              </a>
            </div>
          </motion.div>

          <motion.div
            className="relative mx-auto w-full max-w-2xl lg:max-w-none"
            data-marketing-reveal
            {...reveal}
            transition={{ duration: 0.34, delay: 0.06, ease: "easeOut" }}
          >
            <div className="relative aspect-4/5 overflow-hidden rounded-2xl bg-surface-secondary">
              <Image
                fill
                priority
                alt="Siswa Asia sedang fokus belajar di ruang kelas"
                className="object-cover object-center"
                sizes="(max-width: 1023px) 90vw, 48vw"
                src={HERO_IMAGE}
              />
              <div
                aria-hidden="true"
                className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-brand-strong/35 to-transparent"
              />
            </div>

          </motion.div>
        </div>
      </section>

      <motion.section
        className="scroll-mt-8 bg-surface py-24 sm:py-28 dark:bg-background"
        data-marketing-reveal
        id="fitur"
        {...reveal}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <SectionHeading
            accent="Belajar dan Mengajar"
            align="center"
            eyebrow="Cara kerja GerakGamify"
            title="Cara Lebih Mudah untuk"
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {VALUE_PROPS.map((item) => {
              const Icon = item.icon;
              return (
                <article
                  className="group border-t border-border py-7"
                  key={item.title}
                >
                  <div className="mb-8 flex items-start justify-between">
                    <div className="flex size-10 items-center text-primary">
                      <Icon aria-hidden="true" className="size-6" />
                    </div>
                  </div>
                  <h3 className="font-display text-xl font-bold text-foreground dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-ink-950/65 dark:text-ink-50/65">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="scroll-mt-8 bg-background-warm py-24 sm:py-28"
        data-marketing-reveal
        id="sekolah"
        {...reveal}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-16 px-5 sm:px-8 lg:grid-cols-2 lg:px-12">
          <div className="relative pb-16 sm:pb-12">
            <div
              aria-hidden="true"
              className="absolute -top-6 -left-6 hidden size-44 rounded-3xl opacity-70 sm:block"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.22) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.22) 1px, transparent 1px)",
                backgroundColor: "var(--brand-strong)",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="relative aspect-5/4 overflow-hidden rounded-[2rem] bg-brand-200 sm:rounded-[3rem]">
              <Image
                fill
                alt="Sekelompok siswa belajar bersama di ruang kelas"
                className="object-cover"
                sizes="(max-width: 1023px) 92vw, 46vw"
                src={CLASSROOM_IMAGE}
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 sm:absolute sm:-right-4 sm:bottom-2 sm:mt-0 sm:flex sm:w-auto sm:flex-col sm:gap-3">
              {RESEARCH_STATS.map((stat, index) => (
                <StatBadge
                  {...stat}
                  className={
                    index === 1
                      ? "min-w-0 px-3 sm:-translate-x-8 sm:px-4"
                      : "min-w-0 px-3 sm:px-4"
                  }
                  inverse={index === 1}
                  key={stat.label}
                />
              ))}
            </div>
          </div>

          <div>
            <SectionHeading
              accent="Berbasis Progres"
              eyebrow="Untuk sekolah dan peneliti"
              title="Riset Gamifikasi"
            />
            <p className="mt-8 text-base leading-8 text-ink-950/70 dark:text-ink-50/70">
              GerakGamify v1.0 dirancang untuk riset multi-sekolah dengan gamifikasi
              penuh bagi seluruh siswa. Setiap kelas tetap memiliki tantangan yang
              relevan, sementara progres dapat dibaca dari waktu ke waktu secara
              terstruktur.
            </p>
            <div className="mt-8 space-y-5">
              {[
                "Soal, aktivitas, dan riwayat progres berada dalam satu perjalanan belajar.",
                "Perbandingan berfokus pada perkembangan kelas dan individu, bukan kelompok kontrol.",
                "Data riset dapat dikelola tanpa menghilangkan pengalaman yang ramah bagi siswa.",
              ].map((item) => (
                <div className="flex gap-4" key={item}>
                  <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <BookOpenCheck aria-hidden="true" className="size-4" />
                  </div>
                  <p className="text-sm leading-7 text-ink-950/70 dark:text-ink-50/70">
                    {item}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 inline-flex rounded-full border border-brand-900/10 bg-surface/70 px-4 py-2 text-xs font-bold text-ink-900/70 dark:border-border dark:bg-surface-secondary dark:text-ink-100/70">
              Angka di samping adalah target skala riset GerakGamify v1.0.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="bg-surface py-24 sm:py-28 dark:bg-background"
        data-marketing-reveal
        {...reveal}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <SectionHeading
            accent="Perjalanan Belajar"
            align="center"
            eyebrow="Cerita ilustratif"
            title="Suara dari"
          />
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-7 text-ink-950/60 dark:text-ink-50/65">
            Contoh berikut membantu menggambarkan pengalaman yang ingin dibangun.
            Seluruh nama dan kutipan masih berupa placeholder, bukan data peserta
            riset.
          </p>
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((testimonial) => (
              <TestimonialCard {...testimonial} key={testimonial.name} />
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="scroll-mt-8 bg-background-warm py-24 sm:py-28"
        data-marketing-reveal
        id="sumber-daya"
        {...reveal}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <SectionHeading
              accent="Wawasan GerakGamify"
              eyebrow="Sumber daya"
              title="Jelajahi"
            />
            <p className="max-w-sm text-sm leading-7 text-ink-950/60 dark:text-ink-50/65">
              Catatan yang akan membantu sekolah memahami gamifikasi, gerak, dan
              progres belajar dengan lebih utuh.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {RESOURCES.map((resource) => (
              <article className="group" key={resource.title}>
                <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-brand-200">
                  <Image
                    fill
                    alt={resource.alt}
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
                    sizes="(max-width: 767px) 92vw, 30vw"
                    src={resource.image}
                  />
                  <span className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-surface text-foreground shadow-sm">
                    <ArrowUpRight aria-hidden="true" className="size-5" />
                  </span>
                </div>
                <p className="mt-6 text-xs font-bold tracking-[0.16em] text-ink-700 uppercase dark:text-ink-300">
                  {resource.category}
                </p>
                <h3 className="mt-3 font-display text-xl leading-snug font-bold text-foreground dark:text-white">
                  {resource.title}
                </h3>
                <p className="mt-4 text-xs font-semibold text-ink-900/50 dark:text-ink-100/50">
                  Artikel GerakGamify — segera hadir
                </p>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="scroll-mt-8 bg-surface px-5 py-20 sm:px-8 sm:py-24 lg:px-12 dark:bg-background"
        data-marketing-reveal
        id="tentang"
        {...reveal}
      >
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-brand-strong text-white shadow-[0_30px_80px_rgba(34,39,35,0.10)] sm:rounded-[3rem] lg:grid-cols-[0.78fr_1.22fr]">
          <div className="relative min-h-72 lg:min-h-107.5">
            <Image
              fill
              alt="Siswa belajar bersama dalam program GerakGamify"
              className="object-cover"
              sizes="(max-width: 1023px) 92vw, 36vw"
              src={CLASSROOM_IMAGE}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-brand-strong/55 via-transparent to-transparent lg:bg-linear-to-r lg:from-transparent lg:to-brand-strong/45"
            />
          </div>
          <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
            <p className="text-xs font-bold tracking-[0.18em] text-ink-200 uppercase">
              Mulai dari langkah pertama
            </p>
            <h2 className="font-display mt-5 max-w-2xl text-3xl leading-tight font-extrabold tracking-[-0.035em] sm:text-5xl">
              Bergabung dengan Program GerakGamify
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-ink-50/75 sm:text-base">
              Aktifkan akun siswa, masuk ke kelas, dan temukan cara baru untuk
              bertumbuh melalui tantangan yang menyenangkan.
            </p>
            <Link
              className="mt-9 inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground transition-colors duration-200 hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              href="/claim"
            >
              Mulai Petualangan
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      <footer className="border-t border-brand-950/10 bg-background-warm dark:border-border">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto_auto] lg:items-start">
            <div className="max-w-sm">
              <Link
                className="font-display text-2xl font-extrabold tracking-[-0.035em] text-foreground dark:text-white"
                href="/"
              >
                <BrandLogo />
              </Link>
              <p className="mt-4 text-sm leading-7 text-ink-950/60 dark:text-ink-50/65">
                Petualangan belajar bergamifikasi untuk progres siswa dan riset
                kelas yang lebih bermakna.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm font-semibold text-ink-950/65 sm:grid-cols-4 lg:grid-cols-2 dark:text-ink-50/70">
              {NAV_ITEMS.map((item) => (
                <a className="hover:text-ink-800 dark:hover:text-white" href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
            <div>
              <button
                disabled
                className="inline-flex min-h-11 cursor-not-allowed items-center rounded-full border border-brand-900/15 px-5 text-sm font-bold text-ink-950/45 dark:border-white/15 dark:text-ink-50/45"
                type="button"
              >
                Subscribe · Segera hadir
              </button>
              <div className="mt-5 flex gap-2" aria-label="Media sosial GerakGamify">
                {[
                  { icon: Camera, label: "Instagram — segera hadir" },
                  { icon: Users, label: "Facebook — segera hadir" },
                  { icon: AtSign, label: "Twitter/X — segera hadir" },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      disabled
                      aria-label={item.label}
                      className="flex size-11 cursor-not-allowed items-center justify-center rounded-full border border-brand-900/15 text-ink-950/40 dark:border-white/15 dark:text-ink-50/40"
                      key={item.label}
                      type="button"
                    >
                      <Icon aria-hidden="true" className="size-4" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-12 flex flex-col gap-3 border-t border-brand-950/10 pt-6 text-xs text-ink-950/50 sm:flex-row sm:items-center sm:justify-between dark:border-border dark:text-ink-50/50">
            <p>© {currentYear} GerakGamify. Seluruh hak dilindungi.</p>
            <p>Dibangun untuk pembelajaran yang aktif dan suportif.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
