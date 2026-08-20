import type { Metadata } from "next";

import { SuperadminAnalyticsPageClient } from "@/components/superadmin-analytics";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.superadminAnalytics.title),
  description: pageMetadata.superadminAnalytics.description,
};

export default function SuperadminAnalyticsPage() {
  return <SuperadminAnalyticsPageClient />;
}
