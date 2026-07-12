import { auth } from "@/auth";
import { requireRole } from "@/lib/auth/guards";

export default async function DosenLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  requireRole(session, "dosen");

  return <>{children}</>;
}
