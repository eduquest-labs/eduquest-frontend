"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthShell, RegisterGuruForm } from "@/components/auth";
import { siteConfig } from "@/config/site.config";

export function RegisterPageContent() {
  const router = useRouter();

  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-lg font-bold tracking-tight text-teal-700 dark:text-teal-300">
          {siteConfig.name}
        </span>
        <h1 className="text-2xl font-semibold">Daftar sebagai guru</h1>
        <p className="text-sm text-muted-foreground">
          Isi data Anda dan pilih sekolah untuk mulai mengelola kelas.
        </p>
      </div>
      <RegisterGuruForm onRegistered={() => router.replace("/guru")} />
      <p className="text-center text-sm text-muted-foreground">
        Sudah punya akun?{" "}
        <Link href="/login" className="font-medium text-teal-700 underline dark:text-teal-300">
          Masuk di sini
        </Link>
      </p>
    </AuthShell>
  );
}
