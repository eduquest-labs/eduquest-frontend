import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { createAuthCallbacks } from "@/lib/auth/callbacks";
import { createAuthorizeCredentials } from "@/lib/auth/credentials";
import { createAuthorizeClaimStudent } from "@/lib/auth/claim-credentials";
import { createAuthorizeRegisterGuru } from "@/lib/auth/register-guru-credentials";

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
    Credentials({
      id: "register-guru",
      credentials: {
        name: { label: "Name" },
        email: { label: "Email" },
        password: { label: "Password", type: "password" },
        passwordConfirmation: { label: "Password confirmation", type: "password" },
        schoolId: { label: "School ID" },
      },
      authorize: createAuthorizeRegisterGuru(),
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
