import type { Metadata } from "next";

import { StudentChallengePageClient } from "@/components/attempts";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.studentChallenges.title),
  description: pageMetadata.studentChallenges.description,
};

export default function SiswaPage() {
  return <StudentChallengePageClient />;
}
