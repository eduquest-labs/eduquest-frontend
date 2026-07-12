import type { Metadata } from "next";

import { KelasPageClient } from "@/components/kelas";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.kelas.title),
  description: pageMetadata.kelas.description,
};

export default function KelasPage() {
  return <KelasPageClient />;
}
