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
    nisn: data.nisn,
    email: data.email,
    emailVerified: data.email_verified,
    permissions: data.permissions,
  };
}

export async function updateStudentProfile(email: string): Promise<AuthUser> {
  const { data } = await client.patch<{ user: MeResponseContract }>(API_ENDPOINTS.AUTH.STUDENT_PROFILE, { email });
  const user = data.user;
  return {
    id: user.id,
    name: user.name,
    role: "siswa",
    nisn: user.nisn,
    email: user.email,
    emailVerified: user.email_verified,
    permissions: [],
  };
}

export async function resendEmailVerification(): Promise<void> {
  await client.post(API_ENDPOINTS.AUTH.RESEND_VERIFICATION);
}
