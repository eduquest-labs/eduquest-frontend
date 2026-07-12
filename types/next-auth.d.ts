import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken?: string;
    accessTokenExpiry?: number;
    error?: "RefreshAccessTokenError";
    user: {
      userId: number;
      role: "dosen" | "siswa";
      anonymousId: string | null;
      permissions: string[];
    } & DefaultSession["user"];
  }

  interface User {
    userId: number;
    role: "dosen" | "siswa";
    anonymousId: string | null;
    permissions: string[];
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: number;
    name?: string | null;
    role?: "dosen" | "siswa";
    anonymousId?: string | null;
    permissions?: string[];
    accessToken?: string;
    accessTokenExpiry?: number;
    refreshToken?: string;
    error?: "RefreshAccessTokenError";
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId?: number;
    name?: string | null;
    role?: "dosen" | "siswa";
    anonymousId?: string | null;
    permissions?: string[];
    accessToken?: string;
    accessTokenExpiry?: number;
    refreshToken?: string;
    error?: "RefreshAccessTokenError";
  }
}
