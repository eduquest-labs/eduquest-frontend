import type { Metadata } from "next";

import { GuruPageClient } from "@/components/superadmin-guru";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.superadminGuru.title),
  description: pageMetadata.superadminGuru.description,
};

export default function SuperadminGuruPage() {
  return <GuruPageClient />;
}
