import { client } from "@/services/client";
import { endpoints } from "@/services/endpoints";
import type { MeResponseContract } from "@/lib/contracts/auth";
import type { AuthUser } from "@/types";

export async function logout(): Promise<void> {
  await client.post(endpoints.auth.logout);
}

export async function getMe(): Promise<AuthUser> {
  const { data } = await client.get<MeResponseContract>(endpoints.auth.me);
  return {
    id: data.id,
    name: data.name,
    role: data.role,
    anonymousId: data.anonymous_id,
    permissions: data.permissions,
  };
}
