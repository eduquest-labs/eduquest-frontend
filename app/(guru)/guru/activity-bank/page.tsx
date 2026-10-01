import type { Metadata } from "next";
import { z } from "zod";
import { BankActivityPageClient } from "@/components/activity-bank";
import { buildTitle } from "@/config/site.config";
export const metadata: Metadata = { title: buildTitle("Bank Aktivitas Gerak") };
const targetSchema = z.object({ challengeId: z.coerce.number().int().positive(), classId: z.coerce.number().int().positive(), topicId: z.coerce.number().int().positive() });
export default async function ActivityBankPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const target = targetSchema.safeParse(params);
  return <BankActivityPageClient importTarget={target.success ? target.data : undefined} />;
}
