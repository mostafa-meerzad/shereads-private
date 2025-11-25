// hooks/useInfiniteBooks.js
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../lib/apiClient";
import { buildQuery } from "../lib/buildQuery";
import { queryKeys } from "../lib/queryKeys";

/**
 * Backend expects: GET /api/book?page=1&limit=20&genre=...
 * Returns: { page, limit, total, totalPages, books: [...] }
 */

async function fetchBooksPage({ pageParam = 1, limit = 20, filters = {} }) {
  const params = { page: pageParam, limit, ...filters };
  const qs = buildQuery(params);
  const { data } = await api.get(`/book${qs}`);
  return data;
}

export default function useInfiniteBooks({ limit = 20, filters = {}, enabled = true } = {}) {
  const key = queryKeys.books.lists({ limit, ...filters });

  return useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam = 1 }) => fetchBooksPage({ pageParam, limit, filters }),
    enabled,
    getNextPageParam: (lastPage) => {
      // lastPage shape: { page, totalPages, books: [...] }
      if (!lastPage) return undefined;
      const next = lastPage.page + 1;
      return next <= lastPage.totalPages ? next : undefined;
    },
    // keep previous pages for smooth scroll
    staleTime: 1000 * 60 * 3,
    cacheTime: 1000 * 60 * 30,
  });
}
