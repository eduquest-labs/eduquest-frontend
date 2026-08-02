import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import * as motion from "framer-motion/client";
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  BookOpenCheck,
  Camera,
  Footprints,
  School,
  Sparkles,
  Star,
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
      "Dosen menyiapkan tantangan, memantau aktivitas, dan membaca perkembangan lintas sekolah dalam satu alur.",
  },
] as const;

const RESEARCH_STATS = [
  { value: "75–100", label: "target siswa" },
  { value: "5", label: "sekolah sasaran" },
  { value: "1", label: "dosen peneliti" },
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
    role: "Dosen",
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
  title: "EduQuest — Belajar Aktif, Progres Terlihat",
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
              className="font-display text-xl font-extrabold tracking-[-0.04em] text-[#173f3d] focus-visible:rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:text-white"
              href="/"
            >
              Edu<span className="text-accent">Quest</span>
            </Link>

            <div className="hidden items-center gap-7 text-sm font-semibold text-teal-950/70 md:flex dark:text-teal-50/75">
              {NAV_ITEMS.map((item) => (
                <a
                  className="transition-colors duration-200 hover:text-teal-800 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:hover:text-white"
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </a>
              ))}
            </div>

            <Link
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-[#173f3d] px-5 text-sm font-bold text-white shadow-sm transition-colors duration-200 hover:bg-[#245e5a] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:bg-accent dark:text-[#173f3d]"
              href="/login"
            >
              Masuk
            </Link>
          </nav>
        </header>

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-10 pb-24 sm:px-8 sm:pt-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16 lg:px-12 lg:pt-20 lg:pb-32">
          <motion.div data-marketing-reveal {...reveal}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-teal-900/10 bg-white/70 px-4 py-2 text-xs font-bold tracking-[0.14em] text-teal-800 uppercase dark:border-white/10 dark:bg-white/5 dark:text-teal-200">
              <Sparkles aria-hidden="true" className="size-4 text-accent" />
              Riset gamifikasi pembelajaran
            </div>
            <h1 className="font-display max-w-3xl text-5xl leading-[0.98] font-extrabold tracking-[-0.055em] text-[#173f3d] sm:text-6xl lg:text-7xl dark:text-white">
              Tetap Semangat Belajar{" "}
              <span className="relative mt-3 block w-fit">
                <span className="relative z-10">Bersama EduQuest</span>
                <span
                  aria-hidden="true"
                  className="absolute right-0 bottom-1 left-0 h-3 -rotate-1 rounded-full bg-accent/90 sm:h-4"
                />
              </span>
            </h1>
            <p className="mt-8 max-w-xl text-base leading-8 text-teal-950/65 sm:text-lg dark:text-teal-50/70">
              Ubah soal, aktivitas fisik, dan progres kelas menjadi petualangan
              belajar yang ramah, terukur, dan membuat setiap langkah terasa
              berarti.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                className="inline-flex min-h-12 w-fit items-center justify-center gap-2 rounded-full bg-accent px-7 text-sm font-extrabold text-[#173f3d] shadow-[0_12px_30px_rgba(245,166,35,0.28)] transition-colors duration-200 hover:bg-[#ffb83f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#173f3d]"
                href="/claim"
              >
                Aktivasi Akun
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
              <a
                className="inline-flex min-h-11 w-fit items-center text-sm font-bold text-teal-900 underline decoration-accent decoration-2 underline-offset-4 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent dark:text-teal-100"
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
            <div className="absolute -top-8 -right-5 z-10 hidden text-accent sm:block lg:-right-7">
              <Star aria-hidden="true" className="size-12 fill-current" />
            </div>
            <svg
              aria-hidden="true"
              className="absolute -top-10 -left-8 z-10 hidden h-28 w-36 text-[#173f3d] sm:block dark:text-teal-200"
              fill="none"
              viewBox="0 0 150 110"
            >
              <path
                d="M8 96C28 18 79 10 139 31"
                stroke="currentColor"
                strokeDasharray="5 8"
                strokeLinecap="round"
                strokeWidth="3"
              />
            </svg>
            <div className="relative aspect-4/5 overflow-hidden rounded-[2.5rem_2.5rem_7rem_2.5rem] bg-teal-200 sm:rounded-[4rem_4rem_9rem_4rem]">
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
                className="absolute inset-x-0 bottom-0 h-1/3 bg-linear-to-t from-[#173f3d]/35 to-transparent"
              />
            </div>

            <div className="absolute -bottom-12 left-2 z-20 flex max-w-[calc(100%-1rem)] items-end gap-2 sm:-left-7 sm:gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-[0_18px_45px_rgba(23,63,61,0.18)] dark:border-white/10 dark:bg-neutral-900/95">
                <div className="relative size-10 overflow-hidden rounded-xl bg-teal-100 sm:size-12">
                  <Image
                    fill
                    alt="Potret ilustratif pendamping belajar"
                    className="object-cover"
                    sizes="48px"
                    src={TEACHER_IMAGE}
                  />
                </div>
                <div>
                  <p className="text-[0.62rem] font-bold tracking-wide text-teal-800/60 uppercase dark:text-teal-200/70">
                    Tantangan aktif
                  </p>
                  <p className="font-display text-lg font-extrabold text-[#173f3d] dark:text-white">
                    210+ poin
                  </p>
                </div>
              </div>
              <div className="max-w-40 rounded-2xl bg-[#173f3d] p-3 text-white shadow-[0_18px_45px_rgba(23,63,61,0.2)] sm:max-w-48 sm:p-4">
                <div className="mb-2 flex gap-0.5 text-accent">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      aria-hidden="true"
                      className="size-3 fill-current"
                      key={index}
                    />
                  ))}
                </div>
                <p className="text-[0.65rem] leading-4 sm:text-xs">
                  “Belajar terasa seperti menuntaskan misi bersama.”
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <motion.section
        className="scroll-mt-8 bg-white py-24 sm:py-28 dark:bg-neutral-950"
        data-marketing-reveal
        id="fitur"
        {...reveal}
      >
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
          <SectionHeading
            accent="Belajar dan Mengajar"
            align="center"
            eyebrow="Cara kerja EduQuest"
            title="Cara Lebih Mudah untuk"
          />
          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {VALUE_PROPS.map((item, index) => {
              const Icon = item.icon;
              return (
                <article
                  className="group rounded-3xl border border-teal-950/10 bg-background-warm p-7 transition-colors duration-200 hover:border-teal-700/30 dark:border-white/10"
                  key={item.title}
                >
                  <div className="mb-8 flex items-start justify-between">
                    <div className="flex size-14 items-center justify-center rounded-2xl bg-[#173f3d] text-white shadow-sm">
                      <Icon aria-hidden="true" className="size-6" />
                    </div>
                    <span className="font-display text-sm font-extrabold text-teal-900/30 dark:text-teal-100/30">
                      0{index + 1}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-[#173f3d] dark:text-white">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-teal-950/65 dark:text-teal-50/65">
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
                backgroundColor: "#173f3d",
                backgroundSize: "28px 28px",
              }}
            />
            <div className="relative aspect-5/4 overflow-hidden rounded-[2rem] bg-teal-200 sm:rounded-[3rem]">
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
            <p className="mt-8 text-base leading-8 text-teal-950/70 dark:text-teal-50/70">
              EduQuest v1.0 dirancang untuk riset multi-sekolah dengan gamifikasi
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
                  <div className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-full bg-accent text-[#173f3d]">
                    <BookOpenCheck aria-hidden="true" className="size-4" />
                  </div>
                  <p className="text-sm leading-7 text-teal-950/70 dark:text-teal-50/70">
                    {item}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-8 inline-flex rounded-full border border-teal-900/10 bg-white/70 px-4 py-2 text-xs font-bold text-teal-900/70 dark:border-white/10 dark:bg-white/5 dark:text-teal-100/70">
              Angka di samping adalah target skala riset EduQuest v1.0.
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="bg-white py-24 sm:py-28 dark:bg-neutral-950"
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
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm leading-7 text-teal-950/60 dark:text-teal-50/65">
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
              accent="Wawasan EduQuest"
              eyebrow="Sumber daya"
              title="Jelajahi"
            />
            <p className="max-w-sm text-sm leading-7 text-teal-950/60 dark:text-teal-50/65">
              Catatan yang akan membantu sekolah memahami gamifikasi, gerak, dan
              progres belajar dengan lebih utuh.
            </p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {RESOURCES.map((resource) => (
              <article className="group" key={resource.title}>
                <div className="relative aspect-4/3 overflow-hidden rounded-3xl bg-teal-200">
                  <Image
                    fill
                    alt={resource.alt}
                    className="object-cover transition-transform duration-300 group-hover:scale-[1.025]"
                    sizes="(max-width: 767px) 92vw, 30vw"
                    src={resource.image}
                  />
                  <span className="absolute top-4 right-4 flex size-11 items-center justify-center rounded-full bg-white text-[#173f3d] shadow-sm">
                    <ArrowUpRight aria-hidden="true" className="size-5" />
                  </span>
                </div>
                <p className="mt-6 text-xs font-bold tracking-[0.16em] text-teal-700 uppercase dark:text-teal-300">
                  {resource.category}
                </p>
                <h3 className="mt-3 font-display text-xl leading-snug font-bold text-[#173f3d] dark:text-white">
                  {resource.title}
                </h3>
                <p className="mt-4 text-xs font-semibold text-teal-900/50 dark:text-teal-100/50">
                  Artikel EduQuest — segera hadir
                </p>
              </article>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        className="scroll-mt-8 bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-12 dark:bg-neutral-950"
        data-marketing-reveal
        id="tentang"
        {...reveal}
      >
        <div className="mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] bg-[#173f3d] text-white shadow-[0_30px_80px_rgba(23,63,61,0.18)] sm:rounded-[3rem] lg:grid-cols-[0.78fr_1.22fr]">
          <div className="relative min-h-72 lg:min-h-107.5">
            <Image
              fill
              alt="Siswa belajar bersama dalam program EduQuest"
              className="object-cover"
              sizes="(max-width: 1023px) 92vw, 36vw"
              src={CLASSROOM_IMAGE}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-[#173f3d]/55 via-transparent to-transparent lg:bg-linear-to-r lg:from-transparent lg:to-[#173f3d]/45"
            />
          </div>
          <div className="flex flex-col justify-center px-7 py-12 sm:px-12 lg:px-16">
            <p className="text-xs font-bold tracking-[0.18em] text-teal-200 uppercase">
              Mulai dari langkah pertama
            </p>
            <h2 className="font-display mt-5 max-w-2xl text-3xl leading-tight font-extrabold tracking-[-0.04em] sm:text-5xl">
              Bergabung dengan Program EduQuest
            </h2>
            <p className="mt-6 max-w-xl text-sm leading-7 text-teal-50/75 sm:text-base">
              Aktifkan akun siswa, masuk ke kelas, dan temukan cara baru untuk
              bertumbuh melalui tantangan yang menyenangkan.
            </p>
            <Link
              className="mt-9 inline-flex min-h-12 w-fit items-center gap-3 rounded-full bg-accent px-6 text-sm font-extrabold text-[#173f3d] transition-colors duration-200 hover:bg-[#ffb83f] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
              href="/claim"
            >
              Mulai Petualangan
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </motion.section>

      <footer className="border-t border-teal-950/10 bg-background-warm dark:border-white/10">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[1fr_auto_auto] lg:items-start">
            <div className="max-w-sm">
              <Link
                className="font-display text-2xl font-extrabold tracking-[-0.04em] text-[#173f3d] dark:text-white"
                href="/"
              >
                Edu<span className="text-accent">Quest</span>
              </Link>
              <p className="mt-4 text-sm leading-7 text-teal-950/60 dark:text-teal-50/65">
                Petualangan belajar bergamifikasi untuk progres siswa dan riset
                kelas yang lebih bermakna.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm font-semibold text-teal-950/65 sm:grid-cols-4 lg:grid-cols-2 dark:text-teal-50/70">
              {NAV_ITEMS.map((item) => (
                <a className="hover:text-teal-800 dark:hover:text-white" href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
            </div>
            <div>
              <button
                disabled
                className="inline-flex min-h-11 cursor-not-allowed items-center rounded-full border border-teal-900/15 px-5 text-sm font-bold text-teal-950/45 dark:border-white/15 dark:text-teal-50/45"
                type="button"
              >
                Subscribe · Segera hadir
              </button>
              <div className="mt-5 flex gap-2" aria-label="Media sosial EduQuest">
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
                      className="flex size-11 cursor-not-allowed items-center justify-center rounded-full border border-teal-900/15 text-teal-950/40 dark:border-white/15 dark:text-teal-50/40"
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
          <div className="mt-12 flex flex-col gap-3 border-t border-teal-950/10 pt-6 text-xs text-teal-950/50 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:text-teal-50/50">
            <p>© {currentYear} EduQuest. Seluruh hak dilindungi.</p>
            <p>Dibangun untuk pembelajaran yang aktif dan suportif.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
