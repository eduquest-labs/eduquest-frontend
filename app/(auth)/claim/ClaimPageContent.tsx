"use client";

import { useState } from "react";
import Link from "next/link";

import { AnonymousIdReveal, AuthShell, ClaimStudentForm } from "@/components/auth";
import { siteConfig } from "@/config/site.config";

export function ClaimPageContent() {
  const [anonymousId, setAnonymousId] = useState<string | null>(null);

  if (anonymousId) {
    return (
      <AuthShell>
        <AnonymousIdReveal anonymousId={anonymousId} />
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-lg font-bold tracking-tight text-teal-700 dark:text-teal-300">
          {siteConfig.name}
        </span>
        <h1 className="text-2xl font-semibold">Aktivasi akun siswa</h1>
        <p className="text-sm text-muted-foreground">
          Masukkan kode kelas dan NIS yang diberikan dosen, lalu buat kata sandi baru. Aktivasi
          hanya bisa dilakukan sekali.
        </p>
      </div>
      <ClaimStudentForm onClaimed={setAnonymousId} />
      <p className="text-center text-sm text-muted-foreground">
        Sudah pernah aktivasi?{" "}
        <Link href="/login" className="font-medium text-teal-700 underline dark:text-teal-300">
          Masuk di sini
        </Link>
      </p>
    </AuthShell>
  );
}
