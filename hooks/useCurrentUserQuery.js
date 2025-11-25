// hooks/useCurrentUserQuery.js
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../lib/queryKeys";

export default function useCurrentUserQuery() {
  return useQuery({
    queryKey: queryKeys.auth.currentUser,
    queryFn: async () => {
      if (typeof window === "undefined") return null;
      const raw = localStorage.getItem("auth-shereads");
      if (!raw) return null;
      try {
        const { user } = JSON.parse(raw);
        return user;
      } catch {
        return null;
      }
    },
    staleTime: Infinity,
  });
}
