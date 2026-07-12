"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";

import { useQueryClient } from "@tanstack/react-query";

import { clearToken, setToken } from "@/services/token-store";

export function SessionSyncer() {
  const { data: session, status } = useSession();
  const queryClient = useQueryClient();
  const hadAuthenticatedSession = useRef(false);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (session?.accessToken && !session.error) {
      setToken(session.accessToken);
      hadAuthenticatedSession.current = true;
      return;
    }

    clearToken();
    // Only wipe the query cache on a real logout/session-expiry transition —
    // an anonymous visitor never had a session to begin with, so there is
    // nothing to invalidate and clearing here would cancel that page's own
    // in-flight queries.
    if (hadAuthenticatedSession.current) {
      queryClient.clear();
      hadAuthenticatedSession.current = false;
    }
  }, [session, status, queryClient]);

  return null;
}
