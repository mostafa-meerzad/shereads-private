// hooks/useInfiniteReading.js
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../lib/apiClient";
import { queryKeys } from "../lib/queryKeys";
import { buildQuery } from "../lib/buildQuery";

async function fetchReadingProgressPage({ userId, pageParam = 1, limit = 20 }) {
  const qs = buildQuery({ page: pageParam, limit });
  const { data } = await api.get(`/reading-progress/${userId}${qs}`);

  // If backend returns { userId, progress: [...] } with embedded book,
  // normalize to { books: [...], page, totalPages } so the UI can consume it.
  if (data && Array.isArray(data.progress)) {
    const books = data.progress
      .map((p) => p.book)
      .filter(Boolean);
    return {
      books,
      // backend didn't provide pagination fields -> treat as single page
      page: data.page ?? 1,
      totalPages: data.totalPages ?? 1,
      total: data.total ?? books.length,
      raw: data, // keep raw if you want for debugging
    };
  }

  // If backend already returns expected shape, just return it
  return data;
}

export default function useInfiniteReading(userId, { limit = 20, enabled = true } = {}) {
  const key = queryKeys.recommendations.byUser(userId); // keep your existing key or use a new one

  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam = 1 }) => fetchReadingProgressPage({ userId, pageParam, limit }),
    enabled: !!userId && enabled,
    getNextPageParam: (lastPage) => {
      // lastPage should now have `page` and `totalPages`
      if (!lastPage) return undefined;
      const next = (lastPage.page ?? 1) + 1;
      const totalPages = lastPage.totalPages ?? 1;
      return next <= totalPages ? next : undefined;
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 20,
  });
}
