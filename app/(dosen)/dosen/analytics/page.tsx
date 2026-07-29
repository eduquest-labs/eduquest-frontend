import type { Metadata } from "next";

import { AnalyticsPageClient } from "@/components/analytics";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.analytics.title),
  description: pageMetadata.analytics.description,
};

export default function AnalyticsPage() {
  return <AnalyticsPageClient />;
}
