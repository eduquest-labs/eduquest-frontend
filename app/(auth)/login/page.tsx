import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { AuthShell, LoginForm } from "@/components/auth";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.login.title),
  description: pageMetadata.login.description,
};

export default async function LoginPage() {
  const session = await auth();
  if (session && !session.error) {
    redirect(
      session.user.role === "superadmin" ? "/superadmin" : session.user.role === "guru" ? "/guru" : "/siswa"
    );
  }

  return (
    <AuthShell
      variant="login"
      title="Senang bertemu lagi."
      description="Masuk dengan email atau NISN untuk melanjutkan perjalanan belajarmu."
      footer={
        <>
          <p>Baru pertama kali di sini? <Link href="/claim">Aktivasi akun siswa</Link></p>
          <p>Ingin mendampingi kelas? <Link href="/register">Daftar sebagai guru</Link></p>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
