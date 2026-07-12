import axios from "axios";
import { signOut } from "next-auth/react";

import { clearToken, getTokenWithFallback } from "@/services/token-store";

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

client.interceptors.request.use(async (config) => {
  // Falls back to a session fetch on cold load (e.g. a hard navigation/full
  // refresh into a dashboard route before SessionSyncer's effect has run and
  // populated the in-memory token) — see token-store.ts.
  const token = await getTokenWithFallback();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        void signOut({ redirectTo: "/login" });
      }
    }
    return Promise.reject(error);
  }
);
