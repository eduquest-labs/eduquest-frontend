import type { Metadata } from "next";

import { ChallengeEditorPageClient } from "@/components/authoring";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.challengeEditor.title),
  description: pageMetadata.challengeEditor.description,
};

export default async function ChallengeEditorPage({
  params,
}: {
  params: Promise<{ classId: string; topicId: string; challengeId: string }>;
}) {
  const values = await params;
  return (
    <ChallengeEditorPageClient
      classId={Number(values.classId)}
      topicId={Number(values.topicId)}
      challengeId={Number(values.challengeId)}
    />
  );
}
