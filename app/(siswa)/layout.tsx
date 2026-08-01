import { auth } from "@/auth";
import { requireRole } from "@/lib/auth/guards";
import { StudentShell } from "@/components/student";

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  requireRole(session, "siswa");

  return <StudentShell>{children}</StudentShell>;
}
