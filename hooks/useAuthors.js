// hooks/useAuthors.js
import { useQuery } from "@tanstack/react-query";
import api from "../lib/apiClient";
import { buildQuery } from "../lib/buildQuery";
import { queryKeys } from "../lib/queryKeys";

export async function fetchAuthors({ page = 1, limit = 10, name } = {}) {
  const qs = buildQuery({ page, limit, name });
  const { data } = await api.get(`/author${qs}`);
  // expects: { page, limit, total, pages, data: [...] }
  return data;
}

export default function useAuthors({ page = 1, limit = 10, name } = {}) {
  return useQuery({
    queryKey: queryKeys.authors.lists({ page, limit, name }),
    queryFn: () => fetchAuthors({ page, limit, name }),
    keepPreviousData: true,
  });
}
