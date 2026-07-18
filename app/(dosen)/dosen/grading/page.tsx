import type { Metadata } from "next";

import { EssayGradingQueuePageClient } from "@/components/essay-grading";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.grading.title),
  description: pageMetadata.grading.description,
};

export default async function EssayGradingPage({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string }>;
}) {
  const { classId } = await searchParams;
  const parsedClassId = classId ? Number(classId) : null;

  return (
    <EssayGradingQueuePageClient
      initialClassId={parsedClassId && parsedClassId > 0 ? parsedClassId : null}
    />
  );
}
