"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

import { AuthShell, ClaimStudentForm } from "@/components/auth";

export function ClaimPageContent() {
  const router = useRouter();

  return (
    <AuthShell
      variant="claim"
      title="Petualanganmu dimulai."
      description="Aktifkan akun siswa dengan kode kelas dari guru dan NISN, lalu buat kata sandimu."
      footer={<p>Sudah pernah aktivasi? <Link href="/login">Masuk di sini</Link></p>}
    >
      <ClaimStudentForm onClaimed={() => router.replace("/siswa?claimed=1")} />
    </AuthShell>
  );
}
