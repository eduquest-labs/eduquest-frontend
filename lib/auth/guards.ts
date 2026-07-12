import { redirect } from "next/navigation";

import type { Session } from "next-auth";

export function requireAuth(session: Session | null): asserts session is Session {
  if (!session || session.error) {
    redirect("/login");
  }
}

/**
 * Enforces that the session belongs to the given role. A mismatched role is
 * redirected to their own dashboard rather than a raw 403 — the request is
 * authenticated, just pointed at the wrong route group.
 */
export function requireRole(session: Session | null, role: "dosen" | "siswa"): asserts session is Session {
  requireAuth(session);
  if (session.user.role !== role) {
    redirect(session.user.role === "dosen" ? "/dosen" : "/siswa");
  }
}
