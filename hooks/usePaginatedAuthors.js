import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchAuthors } from "./useAuthors";
import { queryKeys } from "../lib/queryKeys";

export default function usePaginatedAuthors({
  initialPage = 1,
  limit = 10,
  name,
} = {}) {
  const [page, setPage] = useState(initialPage);
  const query = useQuery({
    queryKey: queryKeys.authors.lists({ page, limit, name }),
    queryFn: () => fetchAuthors({ page, limit, name }),
    keepPreviousData: true,
  });

  const { data, isLoading, isFetching, refetch } = query;
  const total = data?.total ?? 0;
  const pages = data?.pages ?? 0;
  const nextPage = () => {
    if (page < pages) setPage((p) => p + 1);
  };

  const prevPage = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  // Reset to initial page when filters/limit change

  // useEffect(() => {
  //   if (page !== initialPage) {
  //     setPage(initialPage);
  //   }
  // }, [initialPage, name, limit]);

  return {
    data: data?.data ?? [],
    page,
    setPage,
    limit,
    total,
    pages,
    isLoading,
    isFetching,
    refetch,
    nextPage,
    prevPage,
  };
}

