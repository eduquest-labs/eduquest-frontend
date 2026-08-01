"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthShell, ClaimStudentForm } from "@/components/auth";
import { siteConfig } from "@/config/site.config";

export function ClaimPageContent() {
  const router = useRouter();

  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-lg font-bold tracking-tight text-teal-700 dark:text-teal-300">
          {siteConfig.name}
        </span>
        <h1 className="text-2xl font-semibold">Aktivasi akun siswa</h1>
        <p className="text-sm text-muted-foreground">
          Siapkan kode kelas dan NISN, lalu tambahkan email serta kata sandi untuk mengamankan akunmu.
        </p>
      </div>
      <ClaimStudentForm onClaimed={() => router.replace("/siswa?claimed=1")} />
      <p className="text-center text-sm text-muted-foreground">
        Sudah pernah aktivasi?{" "}
        <Link href="/login" className="font-medium text-teal-700 underline dark:text-teal-300">
          Masuk di sini
        </Link>
      </p>
    </AuthShell>
  );
}
