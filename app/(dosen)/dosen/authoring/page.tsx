import type { Metadata } from "next";

import { AuthoringPageClient } from "@/components/authoring";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.authoring.title),
  description: pageMetadata.authoring.description,
};

export default async function AuthoringPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const { classId } = await searchParams;
  const parsedClassId = classId ? Number(classId) : null;

  return <AuthoringPageClient initialClassId={parsedClassId && parsedClassId > 0 ? parsedClassId : null} />;
}
