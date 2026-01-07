"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthClient } from "./useAuthClient";

export function useRequireAuth({ redirectTo = "/login", requireAdmin = false } = {}) {
  const router = useRouter();
  const { user } = useAuthClient();

  useEffect(() => {
    // if no user found, redirect to login
    if (user === null) {
      router.push(redirectTo);
      return;
    }

    // if admin required but user is not admin, send to home
    if (requireAdmin && user && user.role !== "admin") {
      router.replace("/home");
    }
  }, [user, router, redirectTo, requireAdmin]);

  return { user };
}

export default useRequireAuth;
