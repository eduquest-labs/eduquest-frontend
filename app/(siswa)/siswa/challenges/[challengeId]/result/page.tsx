import type { Metadata } from "next";

import { AttemptResultPageClient } from "@/components/attempts";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.studentAttemptResult.title),
  description: pageMetadata.studentAttemptResult.description,
};

export default async function StudentAttemptResultPage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await params;
  return <AttemptResultPageClient challengeId={Number(challengeId)} />;
}
