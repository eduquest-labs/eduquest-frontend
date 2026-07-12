import { CredentialsSignin } from "next-auth";

import { API_ENDPOINTS } from "@/services/endpoints";
import { loginSchema } from "@/lib/validations";
import type { MeResponseContract, TokenPairContract } from "@/lib/contracts/auth";

import { fetchWithRetry } from "./fetch-with-retry";

export class InvalidCredentialsError extends CredentialsSignin {
  code = "invalid_credentials";
}

export class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

interface AuthorizedUser {
  userId: number;
  name: string;
  role: "dosen" | "siswa";
  anonymousId: string | null;
  permissions: string[];
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

function apiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  return `${baseUrl}${path}`;
}

export function createAuthorizeCredentials() {
  return async function authorize(
    credentials: Partial<Record<"identifier" | "password", unknown>>
  ): Promise<AuthorizedUser | null> {
    const parsed = loginSchema.safeParse(credentials);
    if (!parsed.success) {
      throw new InvalidCredentialsError();
    }

    const loginResponse = await fetchWithRetry(apiUrl(API_ENDPOINTS.AUTH.LOGIN), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });

    if (loginResponse.status === 429) {
      throw new RateLimitedError();
    }

    if (!loginResponse.ok) {
      throw new InvalidCredentialsError();
    }

    const tokenPair = (await loginResponse.json()) as TokenPairContract;

    const meResponse = await fetchWithRetry(apiUrl(API_ENDPOINTS.AUTH.ME), {
      headers: { Authorization: `Bearer ${tokenPair.access_token}` },
    });

    if (!meResponse.ok) {
      throw new InvalidCredentialsError();
    }

    const me = (await meResponse.json()) as MeResponseContract;

    return {
      userId: me.id,
      name: me.name,
      role: me.role,
      anonymousId: me.anonymous_id,
      permissions: me.permissions,
      accessToken: tokenPair.access_token,
      refreshToken: tokenPair.refresh_token,
      expiresIn: tokenPair.expires_in,
    };
  };
}
