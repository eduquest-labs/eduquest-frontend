import { client } from "@/services/client";
import { API_ENDPOINTS } from "@/services/endpoints";
import type { MeResponseContract } from "@/lib/contracts/auth";
import type { AuthUser } from "@/types";

export async function logout(): Promise<void> {
  await client.post(API_ENDPOINTS.AUTH.LOGOUT);
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await client.get<MeResponseContract>(API_ENDPOINTS.AUTH.ME);
  return {
    id: data.id,
    name: data.name,
    role: data.role,
    anonymousId: data.anonymous_id,
    permissions: data.permissions,
  };
}
