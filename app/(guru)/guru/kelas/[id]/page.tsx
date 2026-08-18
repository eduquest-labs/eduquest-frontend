import type { Metadata } from "next";

import { KelasDetailPageClient } from "@/components/kelas";
import { buildTitle, pageMetadata } from "@/config/site.config";

export const metadata: Metadata = {
  title: buildTitle(pageMetadata.kelasDetail.title),
  description: pageMetadata.kelasDetail.description,
};

export default async function KelasDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <KelasDetailPageClient classId={Number(id)} />;
}
