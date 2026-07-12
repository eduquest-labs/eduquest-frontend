import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { AuthShell, LoginForm } from "@/components/auth";
import { buildTitle, pageMetadata, siteConfig } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.login.title),
  description: pageMetadata.login.description,
};

export default async function LoginPage() {
  const session = await auth();
  if (session && !session.error) {
    redirect(session.user.role === "dosen" ? "/dosen" : "/siswa");
  }

  return (
    <AuthShell>
      <div className="flex flex-col items-center gap-2 text-center">
        <span className="text-lg font-bold tracking-tight text-teal-700 dark:text-teal-300">
          {siteConfig.name}
        </span>
        <h1 className="text-2xl font-semibold">Masuk ke akun Anda</h1>
      </div>
      <LoginForm />
      <p className="text-center text-sm text-muted-foreground">
        Siswa baru dan belum pernah masuk?{" "}
        <Link href="/claim" className="font-medium text-teal-700 underline dark:text-teal-300">
          Aktivasi akun di sini
        </Link>
      </p>
    </AuthShell>
  );
}
