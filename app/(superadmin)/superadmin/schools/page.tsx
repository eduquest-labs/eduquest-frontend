import type { Metadata } from "next";

import { SchoolsPageClient } from "@/components/superadmin-schools";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.superadminSchools.title),
  description: pageMetadata.superadminSchools.description,
};

export default function SuperadminSchoolsPage() {
  return <SchoolsPageClient />;
}
