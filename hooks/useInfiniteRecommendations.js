// hooks/useInfiniteRecommendations.js
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../lib/apiClient";
import { queryKeys } from "../lib/queryKeys";
import { buildQuery } from "../lib/buildQuery";

/**
 * Backend now supports: GET /api/recommendation/:userId?page=1&limit=20
 * Returns: { books: [...], page, limit, total, totalPages }
 */

async function fetchRecommendationsPage({ userId, pageParam = 1, limit = 20 }) {
  const qs = buildQuery({ page: pageParam, limit });
  const { data } = await api.get(`/recommendation/${userId}${qs}`);
  return data;
}

export default function useInfiniteRecommendations(userId, { limit = 20, enabled = true } = {}) {
  const key = queryKeys.recommendations.byUser(userId);

  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam = 1 }) => fetchRecommendationsPage({ userId, pageParam, limit }),
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
