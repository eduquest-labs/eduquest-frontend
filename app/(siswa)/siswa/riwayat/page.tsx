import type { Metadata } from "next";

import { AttemptHistoryPageClient } from "@/components/attempts";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.attemptHistory.title),
  description: pageMetadata.attemptHistory.description,
};

export default function AttemptHistoryPage() {
  return <AttemptHistoryPageClient />;
}
