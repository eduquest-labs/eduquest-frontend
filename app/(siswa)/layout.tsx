import { auth } from "@/auth";
import { requireRole } from "@/lib/auth/guards";

export default async function SiswaLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  requireRole(session, "siswa");

  return <>{children}</>;
}
