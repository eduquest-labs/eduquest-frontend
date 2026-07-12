import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { buildTitle, pageMetadata } from "@/config/site.config";

import { ClaimPageContent } from "./ClaimPageContent";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.claim.title),
  description: pageMetadata.claim.description,
};

export default async function ClaimPage() {
  const session = await auth();
  if (session && !session.error) {
    redirect(session.user.role === "dosen" ? "/dosen" : "/siswa");
  }

  return <ClaimPageContent />;
}
