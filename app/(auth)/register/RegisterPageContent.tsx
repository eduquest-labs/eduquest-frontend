"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthShell, RegisterGuruForm } from "@/components/auth";

export function RegisterPageContent() {
  const router = useRouter();

  return (
    <AuthShell
      variant="register"
      title="Mulai cerita kelas Anda."
      description="Buat akun guru dan pilih sekolah untuk mulai mendampingi perjalanan belajar siswa."
      footer={<p>Sudah punya akun? <Link href="/login">Masuk di sini</Link></p>}
    >
      <RegisterGuruForm onRegistered={() => router.replace("/guru")} />
    </AuthShell>
  );
}
