import type { Metadata } from "next";
import { BankActivityPageClient } from "@/components/activity-bank";
import { buildTitle } from "@/config/site.config";
export const metadata: Metadata = { title: buildTitle("Bank Aktivitas Gerak") };
export default function ActivityBankPage() { return <BankActivityPageClient admin />; }
