import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { createAuthCallbacks } from "@/lib/auth/callbacks";
import { createAuthorizeCredentials } from "@/lib/auth/credentials";
import { createAuthorizeClaimStudent } from "@/lib/auth/claim-credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        identifier: { label: "Identifier" },
        password: { label: "Password", type: "password" },
      },
      authorize: createAuthorizeCredentials(),
    }),
    Credentials({
      id: "claim-student",
      credentials: {
        classCode: { label: "Class code" },
        nis: { label: "NIS" },
        password: { label: "Password", type: "password" },
        passwordConfirmation: { label: "Password confirmation", type: "password" },
      },
      authorize: createAuthorizeClaimStudent(),
    }),
  ],
  callbacks: createAuthCallbacks(),
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
