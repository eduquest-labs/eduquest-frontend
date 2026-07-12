import type { NextAuthConfig } from "next-auth";

import { API_ENDPOINTS } from "@/services/endpoints";
import type { TokenPairContract } from "@/lib/contracts/auth";

import { fetchWithRetry } from "./fetch-with-retry";

const REFRESH_MARGIN_MS = 60 * 1000;

let refreshPromise: Promise<TokenPairContract | null> | null = null;

function apiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  return `${baseUrl}${path}`;
}

async function refreshAccessToken(refreshToken: string): Promise<TokenPairContract | null> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetchWithRetry(apiUrl(API_ENDPOINTS.AUTH.REFRESH), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as TokenPairContract;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

type Callbacks = NonNullable<NextAuthConfig["callbacks"]>;

export function createAuthCallbacks(): Callbacks {
  return {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.userId;
        token.name = user.name;
        token.role = user.role;
        token.anonymousId = user.anonymousId;
        token.permissions = user.permissions;
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.accessTokenExpiry = Date.now() + user.expiresIn * 1000;
        delete token.error;
        return token;
      }

      const isExpiring = !token.accessTokenExpiry || Date.now() >= token.accessTokenExpiry - REFRESH_MARGIN_MS;
      if (!isExpiring || !token.refreshToken) {
        return token;
      }

      const refreshed = await refreshAccessToken(token.refreshToken);
      if (!refreshed) {
        token.error = "RefreshAccessTokenError";
        return token;
      }

      token.accessToken = refreshed.access_token;
      token.refreshToken = refreshed.refresh_token;
      token.accessTokenExpiry = Date.now() + refreshed.expires_in * 1000;
      delete token.error;
      return token;
    },

    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.accessTokenExpiry = token.accessTokenExpiry;
      session.error = token.error;
      if (session.user && token.userId && token.role) {
        session.user.userId = token.userId;
        session.user.name = token.name;
        session.user.role = token.role;
        session.user.anonymousId = token.anonymousId ?? null;
        session.user.permissions = token.permissions ?? [];
      }
      // NEVER copy token.refreshToken here — it must stay server-only.
      return session;
    },
  };
}
