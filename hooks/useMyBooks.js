// hooks/useMyBooks.js
import { useInfiniteQuery } from "@tanstack/react-query";
import api from "../lib/apiClient";
import { buildQuery } from "../lib/buildQuery";
import { queryKeys } from "../lib/queryKeys";

async function fetchMyBooksPage({ pageParam = 1, limit = 20, categories = [] }) {
  // If no categories, return empty result to avoid showing random books in "My Books" tab
  if (!categories || categories.length === 0) {
    return { page: pageParam, limit, total: 0, totalPages: 0, books: [] };
  }
  
  const params = { page: pageParam, limit, categories, onlyMatches: true };
  const qs = buildQuery(params);
  const { data } = await api.get(`/book${qs}`);
  return data;
}

export default function useMyBooks({ limit = 20, categories = [], enabled = true } = {}) {
  const key = [...queryKeys.books.lists({ limit, categories }), "my-books"];

  const query = useInfiniteQuery({
    queryKey: key,
    queryFn: ({ pageParam = 1 }) => fetchMyBooksPage({ pageParam, limit, categories }),
    enabled,
    getNextPageParam: (lastPage) => {
      if (!lastPage) return undefined;
      const next = lastPage.page + 1;
      return next <= lastPage.totalPages ? next : undefined;
    },
    staleTime: 1000 * 60 * 3,
    cacheTime: 1000 * 60 * 30,
  });

  return {
    data: query.data,
    fetchNextPage: query.fetchNextPage,
    hasNextPage: query.hasNextPage,
    isFetchingNextPage: query.isFetchingNextPage,
    status: query.status,
    query,
  };
}
