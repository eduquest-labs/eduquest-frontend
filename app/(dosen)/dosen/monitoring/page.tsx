import type { Metadata } from "next";

import { MonitoringPageClient } from "@/components/monitoring";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.monitoring.title),
  description: pageMetadata.monitoring.description,
};

export default function MonitoringPage() {
  return <MonitoringPageClient />;
}
