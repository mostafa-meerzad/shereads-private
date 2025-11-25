// hooks/useInfiniteFavorites.js
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../lib/apiClient";
import { queryKeys } from "../lib/queryKeys";
import { buildQuery } from "../lib/buildQuery";

async function fetchFavoritesPage({ userId, pageParam = 1, limit = 20, filters }) {
  const qs = buildQuery({ page: pageParam, limit, ...filters });

  const { data } = await api.get(`/favorites/${userId}${qs}`);
  return data;
}

export default function useInfiniteFavorites(
  userId,
  { limit = 20, filters = {}, enabled = true } = {}
) {
  return useInfiniteQuery({
    queryKey: [...queryKeys.favorites.byUser(userId), { filters }],
    queryFn: ({ pageParam = 1 }) =>
      fetchFavoritesPage({ userId, pageParam, limit, filters }),
    enabled: !!userId && enabled,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const next = lastPage.page + 1;
      return next <= lastPage.totalPages ? next : undefined;
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 20,
  });
}
