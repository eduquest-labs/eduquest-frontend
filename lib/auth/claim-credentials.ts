import { CredentialsSignin } from "next-auth";

import { endpoints } from "@/services/endpoints";
import { claimStudentSchema } from "@/lib/validations";
import type { MeResponseContract, TokenPairContract } from "@/lib/contracts/auth";

import { fetchWithRetry } from "./fetch-with-retry";

export class ClaimFailedError extends CredentialsSignin {
  code = "claim_failed";
}

export class AlreadyClaimedError extends CredentialsSignin {
  code = "already_claimed";
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

export function createAuthorizeClaimStudent() {
  return async function authorize(
    credentials: Partial<Record<"classCode" | "nis" | "password" | "passwordConfirmation", unknown>>
  ): Promise<AuthorizedUser | null> {
    const parsed = claimStudentSchema.safeParse(credentials);
    if (!parsed.success) {
      throw new ClaimFailedError();
    }

    const claimResponse = await fetchWithRetry(apiUrl(endpoints.auth.claimStudent), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        class_code: parsed.data.classCode,
        nis: parsed.data.nis,
        password: parsed.data.password,
        password_confirmation: parsed.data.passwordConfirmation,
      }),
    });

    if (claimResponse.status === 429) {
      throw new RateLimitedError();
    }

    if (claimResponse.status === 422) {
      const body = (await claimResponse.json().catch(() => null)) as
        | { errors?: { nis?: string[] } }
        | null;
      const nisMessage = body?.errors?.nis?.[0];
      if (nisMessage?.includes("sudah pernah diaktifkan")) {
        throw new AlreadyClaimedError();
      }
      throw new ClaimFailedError();
    }

    if (!claimResponse.ok) {
      throw new ClaimFailedError();
    }

    const tokenPair = (await claimResponse.json()) as TokenPairContract;

    const meResponse = await fetchWithRetry(apiUrl(endpoints.auth.me), {
      headers: { Authorization: `Bearer ${tokenPair.access_token}` },
    });

    if (!meResponse.ok) {
      throw new ClaimFailedError();
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
