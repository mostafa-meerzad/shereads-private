// hooks/useFavorites.js
import { useQuery } from "@tanstack/react-query";
import api from "../lib/apiClient";
import { queryKeys } from "../lib/queryKeys";

export default function useFavorites(userId, opts = {}) {
  return useQuery({
    queryKey: queryKeys.favorites.byUser(userId),
    queryFn: async () => {
      const { data } = await api.get(`/favorites/${userId}`);
      // expects { favorites: [...] }
      return data;
    },
    enabled: !!userId,
    ...opts,
  });
}



