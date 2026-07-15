import type { Metadata } from "next";

import { AttemptPageClient } from "@/components/attempts";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.studentAttempt.title),
  description: pageMetadata.studentAttempt.description,
};

export default async function StudentAttemptPage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await params;
  return <AttemptPageClient challengeId={Number(challengeId)} />;
}
