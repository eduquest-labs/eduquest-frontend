import type { Metadata } from "next";

import { PhysicalActivityPageClient } from "@/components/physical-activity";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.physicalActivity.title),
  description: pageMetadata.physicalActivity.description,
};

export default async function PhysicalActivityPage({
  params,
}: {
  params: Promise<{ challengeId: string }>;
}) {
  const { challengeId } = await params;

  return <PhysicalActivityPageClient challengeId={Number(challengeId)} />;
}
