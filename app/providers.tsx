"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { Toast } from "@heroui/react";

import { SessionSyncer } from "@/components/base/layout/SessionSyncer";
import { QueryProvider } from "@/providers/query-provider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="data-theme" defaultTheme="light">
        <QueryProvider>
          <SessionSyncer />
          <Toast.Provider placement="top end" />
          {children}
        </QueryProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
