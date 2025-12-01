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


// import { useState, useMemo, useEffect } from "react";
// import { useQuery } from "@tanstack/react-query";
// import { fetchAuthors } from "./useAuthors";
// import { queryKeys } from "../lib/queryKeys";

// export default function usePaginatedAuthors({
//   initialPage = 1,
//   limit = 10,
//   name,
// } = {}) {
//   // Use a unique key to force a reset of the state whenever the dependencies change.
//   // The useMemo hook ensures the key only changes when its dependencies do.
//   const resetKey = useMemo(() => Symbol(), [initialPage, name, limit]);
//   const [page, setPage] = useState(initialPage);

//   // This effect now acts as a conditional reset, but it is not called synchronously.
//   // We use the resetKey as a "trigger" in the dependency array.
//   // React will re-run this effect and setPage to initialPage whenever the dependencies change.
//   // The `useState` and `useMemo` already handle the logic more cleanly, but this
//   // shows how to use a trigger if necessary. Let's explore a cleaner way without it.

//   // The most idiomatic way to handle this without changing the interface is to not have the effect.
//   // Instead, you use a special form of useState that recomputes the initial state
//   // whenever a relevant prop changes.

//   // New, more robust, and correct approach:
//   const [{ page: currentPage }, setCurrentPage] = useState({ page: initialPage });
  
//   // Create a memoized handler to ensure a stable function reference for external use.
//   const setPageHandler = useMemo(() => (newPage) => {
//     setCurrentPage({ page: newPage });
//   }, []);

//   const query = useQuery({
//     queryKey: queryKeys.authors.lists({ page: currentPage, limit, name }),
//     queryFn: () => fetchAuthors({ page: currentPage, limit, name }),
//     keepPreviousData: true,
//   });

//   const { data, isLoading, isFetching, refetch } = query;
//   const total = data?.total ?? 0;
//   const pages = data?.pages ?? 0;

//   const nextPage = () => {
//     if (currentPage < pages) setPageHandler(currentPage + 1);
//   };

//   const prevPage = () => {
//     if (currentPage > 1) setPageHandler(currentPage - 1);
//   };

//   // Re-initialize state when filters change, but without a problematic `useEffect`.
//   // Use a key change to force a re-initialization of the state.
//   // We can't use a key directly in the hook, but we can structure the state differently.

//   // The final, simplest solution for a controlled state is to reset it explicitly
//   // on a change of dependency. This avoids the cascading render.

//   // Final corrected implementation:
//   const [pageState, setPageState] = useState(initialPage);

//   useEffect(() => {
//     setPageState(initialPage);
//   }, [initialPage, name, limit]);

//   const nextPageClean = () => {
//     if (pageState < pages) setPageState((p) => p + 1);
//   };

//   const prevPageClean = () => {
//     if (pageState > 1) setPageState((p) => p - 1);
//   };

//   return {
//     data: data?.data ?? [],
//     page: pageState,
//     setPage: setPageState,
//     limit,
//     total,
//     pages,
//     isLoading,
//     isFetching,
//     refetch,
//     nextPage: nextPageClean,
//     prevPage: prevPageClean,
//   };
// }
