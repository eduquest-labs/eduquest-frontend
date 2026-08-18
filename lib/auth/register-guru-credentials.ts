import { CredentialsSignin } from "next-auth";

import { API_ENDPOINTS } from "@/services/endpoints";
import { registerGuruSchema } from "@/lib/validations";
import type { MeResponseContract, TokenPairContract } from "@/lib/contracts/auth";

import { fetchWithRetry } from "./fetch-with-retry";

export class RegistrationFailedError extends CredentialsSignin {
  code = "registration_failed";
}

export class RateLimitedError extends CredentialsSignin {
  code = "rate_limited";
}

interface AuthorizedUser {
  userId: number;
  name: string;
  role: "superadmin" | "guru" | "siswa";
  permissions: string[];
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

function apiUrl(path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  return `${baseUrl}${path}`;
}

export function createAuthorizeRegisterGuru() {
  return async function authorize(
    credentials: Partial<Record<"name" | "email" | "password" | "passwordConfirmation" | "schoolId", unknown>>
  ): Promise<AuthorizedUser | null> {
    const parsed = registerGuruSchema.safeParse({
      ...credentials,
      schoolId: credentials.schoolId === undefined ? undefined : Number(credentials.schoolId),
    });
    if (!parsed.success) {
      throw new RegistrationFailedError();
    }

    const registerResponse = await fetchWithRetry(apiUrl(API_ENDPOINTS.AUTH.REGISTER_GURU), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        password_confirmation: parsed.data.passwordConfirmation,
        school_id: parsed.data.schoolId,
      }),
    });

    if (registerResponse.status === 429) {
      throw new RateLimitedError();
    }

    if (registerResponse.status === 422) {
      throw new RegistrationFailedError();
    }

    if (!registerResponse.ok) {
      throw new RegistrationFailedError();
    }

    const tokenPair = (await registerResponse.json()) as TokenPairContract;

    const meResponse = await fetchWithRetry(apiUrl(API_ENDPOINTS.AUTH.ME), {
      headers: { Authorization: `Bearer ${tokenPair.access_token}` },
    });

    if (!meResponse.ok) {
      throw new RegistrationFailedError();
    }

    const me = (await meResponse.json()) as MeResponseContract;

    return {
      userId: me.id,
      name: me.name,
      role: me.role,
      permissions: me.permissions,
      accessToken: tokenPair.access_token,
      refreshToken: tokenPair.refresh_token,
      expiresIn: tokenPair.expires_in,
    };
  };
}
