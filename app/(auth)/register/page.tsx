import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { buildTitle, pageMetadata } from "@/config/site.config";

import { RegisterPageContent } from "./RegisterPageContent";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.register.title),
  description: pageMetadata.register.description,
};

export default async function RegisterPage() {
  const session = await auth();
  if (session && !session.error) {
    redirect(
      session.user.role === "superadmin" ? "/superadmin" : session.user.role === "guru" ? "/guru" : "/siswa"
    );
  }

  return <RegisterPageContent />;
}
