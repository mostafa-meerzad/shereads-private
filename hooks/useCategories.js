"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/apiClient";

export default function useCategories({ enabled = true } = {}) {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await api.get("/category");
      return data.categories || [];
    },
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}
