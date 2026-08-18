import type { Metadata } from "next";

import { EssayGradingDetailPageClient } from "@/components/essay-grading";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.gradingDetail.title),
  description: pageMetadata.gradingDetail.description,
};

export default async function EssayGradingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ attemptId: string }>;
  searchParams: Promise<{ classId?: string }>;
}) {
  const [{ attemptId }, { classId }] = await Promise.all([params, searchParams]);

  return (
    <EssayGradingDetailPageClient
      attemptId={Number(attemptId)}
      classId={classId ? Number(classId) : 0}
    />
  );
}
