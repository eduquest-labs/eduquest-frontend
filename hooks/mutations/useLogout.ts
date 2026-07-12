import { useMutation } from "@tanstack/react-query";
import { signOut } from "next-auth/react";

import { logout } from "@/services/modules";

export function useLogout() {
  return useMutation({
    mutationFn: logout,
    onSettled: () => signOut({ redirectTo: "/login" }),
  });
}
